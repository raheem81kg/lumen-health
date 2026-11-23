# Lumen Health — Operations and Recovery Runbook

**Owner:** Terri-Etana Thoms

## Platform and responsibilities

Lumen Health uses a Next.js web app, a Hono API, Docker Compose, Azure VMs, GitHub Actions, GHCR, Prometheus, and Grafana. The CI workflow tests the application, builds web and server images, deploys to staging, and then deploys to production.

| Area | Owner |
|---|---|
| Azure VMs, Terraform, and SSH access | Raheem |
| CI/CD, images, deployment, and rollback workflow | Matthew |
| Prometheus, Grafana, alerts, and dashboards | Max |
| Secrets documentation, operating procedures, and game-day evidence | Terri |

## Before deployment

1. Identify the approved commit SHA and the previous known-good SHA.
2. Confirm both web and server images have the intended tag in GHCR.
3. Confirm the target environment has working `DATABASE_URL`, `DEPLOY_SSH_KEY`, and `GHCR_PAT` values. See [SECRETS.md](SECRETS.md). Never place credential values in this repository or screenshots.
4. Confirm the VM is reachable and Docker Compose is available.
5. Confirm the production GitHub Environment has its required-reviewer rule configured.
6. Check that the application version is compatible with the target database schema. An image rollback does not reverse database changes.
7. Restrict access to the fault-injection endpoint, Prometheus, and Grafana. Use the fault endpoint only for an authorized staging rehearsal.

## Deploy and verify

1. Push or merge an approved change to `main`.
2. In **GitHub → Actions → ci**, follow the `test`, `build (web)`, `build (server)`, `deploy-staging`, and `deploy-prod` jobs.
3. Confirm that staging pulls the intended images, starts Docker Compose, and passes its workflow health checks.
4. Check the staging web page and API `/health`, `/ready`, and `/version` routes.
5. Check the Prometheus target, alert state, Grafana dashboard, error rate, and latency.
6. Promote the same tested image SHA to production through the configured approval process.
7. Repeat the web, API, and monitoring checks in production. Record the run URL, SHA, approval, and result.

The workflow checks `/health` and the web home page. Also check `/ready` for database access and `/version` for release identification.

## Rollback to a known-good image

**Use when:** A deployment causes persistent errors, failed readiness, high latency, or a user-visible regression.

1. Identify a previously working **full commit SHA** and confirm both corresponding GHCR images exist.
2. Check that the older application version is compatible with the current database schema.
3. Coordinate the rollback with the pipeline and infrastructure owners. Test the procedure on staging before relying on it for production.
4. Use the verified rollback procedure to redeploy both web and server images with the previous SHA. The GitHub Actions workflow offers a **Run workflow** `tag` input; confirm its manual deployment jobs actually run before treating it as a working rollback path.
5. Check the web page, `/health`, `/ready`, `/version`, image SHA, API error rate, and latency after deployment.
6. Record the fault time, alert time, rollback start, healthy recovery time, operator, image SHAs, workflow run URL, and total recovery duration.
7. If the service remains unhealthy, involve the API/database and infrastructure owners. Preserve redacted logs.

A passing test, image build, or pull-request check titled “Rollback” does not prove that an older image was deployed. Rollback evidence must show the older image tag and healthy recovery.

## Alert response

The alert rules are defined in `monitoring/alerts.yml`.

| Alert or signal | First checks | Response |
|---|---|---|
| `ApiDown` | `/health`, Compose status, API logs, Prometheus target | Investigate the API and VM; roll back if linked to a release |
| `/ready` fails | Database connectivity and API logs | Involve the database owner without exposing credentials |
| `HighErrorRate` | 5xx traffic, release SHA, Grafana panel, authorized staging fault state | Identify the cause; clear an authorized test fault or roll back a bad image |
| `HighLatencyP95` | Latency panel, database readiness, traffic, recent changes | Investigate the affected service and dependency |

A rule in the repository is not proof that Prometheus loaded it or that an alert fired. Confirm the live alert state and record it during game day.

## Game-day evidence

The [Solo game-day report](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/game-day.md) documents an earlier fault-and-alert exercise. Its [alert screenshot](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-alert-HighErrorRate.png) and [dashboard screenshot](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-dashboard-error-spike.png) show detection and recovery after the injected fault was cleared. That exercise is separate from an image rollback in this group repository.

The group's rehearsal results, workflow links, screenshots, event times, and measured recovery duration belong in [Game_Day.md](Game_Day.md). Keep that file as the evidence record so this runbook remains a reusable operating procedure.