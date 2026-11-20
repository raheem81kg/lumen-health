# Lumen Health — operations and recovery runbook

**Owner:** Terri-Etana Thoms, reliability and security
**Updated:** 20 November 2026

## Current platform

The original repository contains a Next.js web app (port 3001), Hono API (port 3000), Docker Compose, Azure Terraform, `.github/workflows/ci.yml`, Prometheus alert rules and a Grafana dashboard. The workflow tests, builds SHA-tagged web/API images, deploys to staging and then has a production job. GitHub Environment secrets and protection rules are configured outside the repository and cannot be verified from the YAML alone.

| Responsibility | Owner |
|---|---|
| Azure VMs, Terraform, SSH access | Raheem |
| CI, GHCR images, deployment and rollback workflow | Matthew |
| Prometheus, Grafana, alert rules and panels | Max |
| Secrets inventory, procedures, incident timeline and evidence | Terri |

## Before a deployment

1. Confirm the target is staging or production, the approved commit SHA, the previous known-good SHA and database compatibility. Both web and API images must exist in GHCR under the same immutable SHA tag.
2. Check that `staging` and `production` GitHub Environments have distinct `DATABASE_URL` and `DEPLOY_SSH_KEY` values. The VM's GHCR read credential must be available where needed. Never print or commit these values.
3. Confirm production **required reviewers** are configured in repository settings. `environment: production` alone is not an approval gate.
4. Confirm the VM is reachable, Docker Compose is installed, and the deployment directory and monitoring files exist. Confirm the intended `IMAGE_TAG`, `GITHUB_REPOSITORY`, `CORS_ORIGIN` and `PUBLIC_API_URL`.
5. Do not expose the API's unauthenticated `/__debug/fault` route to the public or enable fault injection in production. Change the default Grafana admin password and restrict monitoring access before exposing these services.

## Deploy and verify

1. Push or merge an approved change to `main`. In **Actions → ci**, watch `test`, both `build` jobs, `deploy-staging`, then `deploy-prod`. A successful test/build does not mean the app was deployed.
2. The staging job copies Compose, monitoring configuration and environment files to the staging VM, then pulls GHCR images and starts Compose. Record the workflow run and SHA. If the copy step fails, stop: no staging deploy has occurred.
3. Check the staging API `/health`, `/ready`, `/version` and the web homepage. `/health` checks liveness, while `/ready` queries the database. Compare `/version` with the intended SHA if the release sets `GIT_SHA` or `APP_VERSION`.
4. Observe Prometheus targets, alert state and Grafana panels. Investigate error rate and latency as well as liveness.
5. Promote the **same image SHA** to production only after a green staging gate and configured production approval. Repeat health, readiness, version, web and monitoring checks. Record the reviewer and time.

The present workflow's shell health gate checks `/health` and the web homepage, but does not check `/ready` or verify `/version`. Those additional checks must be performed manually until Matthew adds them to CI.

## Rollback to a known-good release

**Trigger:** Failed readiness, persistent 5xx errors, elevated latency or a user-visible regression after deployment. An image rollback does not reverse database migrations.

1. Identify a previously published, known-good full commit SHA. Confirm both GHCR image tags exist and the target database schema is compatible.
2. Coordinate the rollback with the pipeline owner. In **Actions → ci → Run workflow**, supply the previous SHA as `tag` for a staging rehearsal. Do not use production for a practice run.
3. The manual path must deploy the existing images **without rebuilding**. Verify that `deploy-staging` actually runs: the current workflow sets `build` to skip on `workflow_dispatch`, while staging declares `needs: build`, so a manual run may skip staging as well. Matthew must fix and test this dependency before relying on the button for rollback.
4. If the manual workflow is unavailable, only an authorized VM operator may redeploy a verified previous image tag using the approved recovery procedure. Do not improvise with production credentials or Terraform state.
5. Confirm `/health`, `/ready`, `/version`, web response, image SHA and error/latency recovery. Record the decision, start and healthy times. Calculate the measured recovery duration and whether it was under ten minutes.
6. If checks remain red, stop and involve the API/DB and infrastructure owners. Preserve logs and the incident timeline; redact any secrets.

## Alert response

The repository defines `ApiDown` (API scrape unavailable for 30 seconds), `HighErrorRate` (more than 0.1 errors/second over five minutes for 30 seconds), and `HighLatencyP95` (p95 above one second for one minute) in `monitoring/alerts.yml`. A checked-in rule is not proof that a running Prometheus instance loaded it or that a notification was delivered.

| Signal | First checks | Response |
|---|---|---|
| `ApiDown` | `/health`, Compose status, API logs, Prometheus target | Involve infrastructure/API owner; rollback if tied to a release |
| `/ready` fails | DB connectivity and API logs | Involve database owner; do not reveal the connection string |
| `HighErrorRate` | 5xx panel, `/trpc/*`, release SHA, fault status in an authorized staging test | Distinguish injected fault from regression; clear an authorized test fault or roll back a bad release |
| `HighLatencyP95` | Latency panel, DB readiness, traffic | Investigate dependency/load with API/DB owner |

The Solo staging rehearsal documented in [the game-day report](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/game-day.md) showed `HighErrorRate` firing while `/health` stayed green. The operator cleared the injected fault; that exercise did **not** demonstrate an image rollback in this original repository.

## Evidence and incident record

Record the environment, operator, reviewer, failing and known-good SHA, Actions run URL, alert name and firing time, dashboard screenshot, decision time, rollback start, recovery time, final health/readiness/version results and follow-up owner. Use the [Solo Prometheus alert](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-alert-HighErrorRate.png) and [Solo Grafana error spike](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-dashboard-error-spike.png) only as evidence of that Solo fault exercise, not proof of a rollback here.

**Latest observed original-repo state:** The latest completed `main` run reviewed before this update passed tests and both builds but failed while copying the bundle to the staging VM. A newer run was in progress when checked. No successful original-repo rollback timing has been verified. Update this paragraph with the exact run URL and result after the next completed run.