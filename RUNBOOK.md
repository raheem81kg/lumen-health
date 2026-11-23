# Lumen Health Reliability and Security

**Owner:** Terri-Etana Thoms  
**Project:** Lumen Health

## My responsibility

I maintain the project's operational documentation and evidence process. My work covers secret handling, deployment verification, alert response, rollback procedures, and the game-day record. I coordinate these checks with Raheem's infrastructure work, Matthew's CI/CD work, and Max's monitoring work.

## Documentation delivered

| Document | Purpose |
|---|---|
| [RUNBOOK.md](RUNBOOK.md) | Deployment, health checks, rollback, and alert response |
| [SECRETS.md](SECRETS.md) | Secret names, locations, ownership, and handling |
| [TOOL_NOTES.md](TOOL_NOTES.md) | Nine-step notes on GitHub Actions Environments and secrets |
| [Game_Day.md](Game_Day.md) | Dated rehearsal results, timeline, screenshots, and findings |

## Day 1 — operating and secret documentation

I documented the application's components, team responsibilities, deployment prerequisites, and recovery procedure in the runbook.

I documented which configuration belongs in local environment files, GitHub secrets, and the deployed environment in `SECRETS.md`. The repository documentation contains secret names and instructions, not credential values.

## Day 2 — deployment and monitoring integration

The repository contains a GitHub Actions workflow that tests the project, builds web and server container images, and deploys them to staging and production. The workflow uses GitHub secrets for database access, SSH deployment, and GHCR access.

The project also contains Prometheus scrape configuration, alert rules, and a Grafana dashboard. The runbook connects the deployment workflow to application health checks and alert-response steps.

For every release, I distinguish between:

- A passing test and image build
- A completed deployment job
- A healthy running application
- A verified recovery after rollback

Each result is supported by its relevant workflow run, application check, or monitoring evidence.

## Day 3 — rehearsal and evidence

I maintain `Game_Day.md` as the dated record of the team's staging rehearsal. It contains the fault, alert, response, rollback, and healthy recovery sequence, supported by workflow links and screenshots.

I record the event times, image SHAs, operator actions, health and readiness results, and measured recovery duration. I compare that duration with the team's target of restoring healthy service in under ten minutes.

## Verification checklist

| Area | Evidence to record |
|---|---|
| CI | Passing test and web/server image builds |
| Staging deployment | Successful deployment job and staging application checks |
| Production deployment | Successful approved deployment and production checks |
| API process | `/health` response |
| Database access | `/ready` response |
| Release identity | Image tag and `/version` result when configured |
| Monitoring | Prometheus target, alert state, and Grafana panels |
| Rollback | Previous image SHA deployed and healthy traffic restored |
| Recovery time | Recorded event times and calculated duration |
| Secret handling | Secret names and scopes, without exposing values |

## Security practices

- Keep database URLs, SSH private keys, tokens, and passwords out of committed files and screenshots.
- Give staging and production their appropriate credentials.
- Limit access to the virtual machines and monitoring interfaces.
- Use the fault-injection route only during an authorized staging exercise.
- Record incident findings without copying sensitive values into the evidence pack.

## Evidence standard

A workflow marked successful shows that its jobs completed. A rollback is demonstrated by an older known-good image being deployed, followed by healthy application and monitoring checks. `Game_Day.md` holds the dated evidence; this file describes how I verify and document it.