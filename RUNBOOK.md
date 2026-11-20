# Lumen Health — operations and recovery runbook

Owner: Terri-Etana Thoms (reliability and security). Updated 20 November 2026.

## Current state and ownership

The current `main` branch contains a Next.js web app, Hono API, Docker Compose and Azure Terraform for staging and production. It does **not** yet contain an Actions deployment workflow or Prometheus/Grafana Compose services. `docs/architecture.md` describes the intended pipeline and observability system; those portions are a design, not observed live infrastructure.

| Concern | Repository source | Responsible handoff |
|---|---|---|
| API and database readiness | `apps/server/src/index.ts`, `apps/server/.env.schema` | API/DB owner |
| VM, SSH access and state | `infra/terraform`, `infra/README.md` | Raheem, infrastructure |
| Build, release and environment approvals | Future `.github/workflows/ci.yml` | Matthew, pipeline |
| Metrics and alerts | API `/metrics`; future monitoring configuration | Max, observability |
| Secrets, incident response and rollback record | `docs/SECRETS.md`, this runbook | Terri, reliability and security |

## Day 1 — inventory and checks

- Web listens on port 3001; API listens on port 3000 in `docker-compose.yml`. Local Compose builds images from `apps/web/Dockerfile` and `apps/server/Dockerfile`; it does not pull released image tags.
- `apps/server/.env.schema` defines `NODE_ENV`, `CORS_ORIGIN`, and `DATABASE_URL`; `apps/web/.env.schema` defines `NODE_ENV` and `NEXT_PUBLIC_SERVER_URL`. `packages/db/.env.schema` imports database configuration. See [SECRETS.md](SECRETS.md) for placement and handling.
- `/health` checks the API process; `/ready` checks a database query and returns 503 on failure; `/version` reports `APP_VERSION`, `GIT_SHA`, or `dev`. `/metrics` exposes Prometheus format. These routes exist in source; remote availability has not been verified.
- Terraform has separate `staging` and `prod` workspaces and tfvars. The infrastructure owner must check state, VM outputs and network restrictions; do not infer deployed hosts from the tfvars alone.

## Day 2 — deployment procedure

**Preconditions:** Pipeline owner has implemented and reviewed CI, immutable image publishing, staging deployment and a production approval gate. Infrastructure owner has confirmed VM and database separation. Environment secrets are configured and a known-good release is recorded. The fault-injection route is disabled or restricted in production.

1. Record the proposed commit SHA and the last known-good image SHA. Confirm web and API images use the **same immutable tag**.
2. Run type checks and build checks in CI. Publish images to GHCR only after checks pass; use harmless build placeholders if the build needs a syntactically valid database URL. Supply real `DATABASE_URL` only at runtime.
3. Deploy the commit's images to staging. Confirm the container image tags and environment identity. Do not build an older source tree under a reused tag.
4. Check `GET /health`, `GET /ready`, `GET /version` and the web homepage. `/ready` must return success and `/version` must match the intended SHA. Observe errors and latency if monitoring has been configured.
5. Record the Actions run, staging host, SHA, results and reviewer. Promote the same image SHA to production only through the configured required-reviewer gate. Recheck health, readiness, version and user-visible behavior.

For the current local Compose implementation, use `docker compose config` with ignored local env files, then `docker compose up -d --build`, `docker compose ps`, and `docker compose logs --tail 50 server web`. These commands validate a local setup; they are not a production release procedure.

## Rollback procedure

**Trigger:** New release causes failed readiness, sustained 5xx errors, high latency or a user-visible regression. An image rollback does not reverse a database migration; the database owner must confirm schema compatibility.

1. Identify the last known-good **published** web and API image tags and their matching SHA.
2. Obtain the required environment approval, then redeploy those existing images without rebuilding or retagging current source. Keep the previous release and current release IDs in the incident record.
3. Verify API `/health`, `/ready`, `/version`, web response and error/latency recovery. Record detection, rollback start and recovery times; the proposed under-10-minute objective is unmeasured until a rehearsal is performed.
4. If readiness still fails, inspect database connectivity and container logs, then escalate to the API/DB or infra owner. Avoid Terraform apply/destroy and avoid guessing at production credentials during incident response.

No image-based rollback command can be executed from the current `docker-compose.yml` because it specifies builds and no registry image tags. The pipeline owner must implement and test a released-image deployment path before this procedure can be signed off.

## Alerts and first response

| Signal | Check | Response |
|---|---|---|
| API unavailable | `/health`, Compose status and logs | Determine VM/container issue; involve infrastructure owner; consider rollback if release-related |
| Database not ready | `/ready` status and API logs | Check Neon reachability and correct environment credential with DB owner; never paste the URL into logs |
| Elevated 5xx | API metrics, deploy SHA, logs | Compare with release time; roll back confirmed release regression |
| High p95 latency | Metrics, database readiness and traffic | Investigate load or dependency delay with API/DB owner; escalate sustained impact |

Thresholds, alert receiver, dashboard URL and paging contact remain to be defined by the observability owner. Do not claim alert firing or acknowledgement until configured and tested.

## Evidence log

| Field | Record after a real run |
|---|---|
| Environment, date, operator and reviewer | Pending |
| CI run URL, commit SHA and image digests | Pending |
| `/health`, `/ready`, `/version`, web result | Pending |
| Alert or dashboard link and observed metric | Pending |
| Rollback target, start/end time and recovery | Pending |
| Follow-up owner and outcome | Pending |

## Remaining gates

- [x] Inventory repo configuration, routes and secrets without disclosing values.
- [x] Document deployment, rollback and alert response procedures.
- [ ] CI and GHCR release path implemented by pipeline owner.
- [ ] Staging/production environments, secrets, VM hosts and production required reviewers verified by owners.
- [ ] Fault injection restricted; monitoring and alert routing configured.
- [ ] Staging release and rollback performed; evidence and measured recovery added.