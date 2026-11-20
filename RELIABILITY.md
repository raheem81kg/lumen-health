# Lumen Health — reliability and security

**Owner:** Terri-Etana Thoms
**Updated:** 20 November 2026

## My role

I document where deployment secrets belong, how to verify a release, how to respond to alerts and roll back a failed release, and how to record the team's game-day evidence. Raheem owns infrastructure, Matthew owns the CI/CD pipeline, and Max owns monitoring. I coordinate the reliability and security checks across those pieces.

## Day 1 — runbook and secrets

I reviewed the tracked environment schemas, Docker Compose, Terraform workspaces and API health/readiness routes. I prepared [RUNBOOK.md](RUNBOOK.md) with operating and recovery steps. A separate secrets inventory should map local ignored `.env` files, staging and production GitHub Environment secrets, and runtime VM files. It must include names and scopes, never secret values.

**Repository status:** The runbook exists on `main`; a separate `SECRETS.md` was not present at the last check. Add the inventory before marking that Day 1 file delivered.

## Day 2 — integration

The repo now contains `.github/workflows/ci.yml`, SHA-tagged GHCR builds, staging and production deployment jobs, and `monitoring/alerts.yml`. The workflow references `DATABASE_URL`, `DEPLOY_SSH_KEY` and `GHCR_PAT`. I review that each secret is scoped to its intended GitHub Environment and that production required reviewers are configured in repository settings. Secret values and approval settings are not visible in the source, so references alone do not verify provisioning.

My [runbook](RUNBOOK.md) documents deployment, health/readiness checks, rollback and alert response. The current workflow's manual rollback path needs a dependency fix and a staging test: `build` is skipped on `workflow_dispatch`, while `deploy-staging` depends on `build`. The latest completed `main` run I reviewed passed tests and builds but failed at the staging SSH copy step. This is not a successful deployment or rollback.

## Day 3 — game day and evidence

I record the fault start, error spike, alert firing, response, rollback decision, known-good image SHA, recovery checks and elapsed time. The [Solo game-day report](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/game-day.md) documents a staging fault exercise with [Prometheus alert](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-alert-HighErrorRate.png) and [Grafana dashboard](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-dashboard-error-spike.png) screenshots. In that exercise the operator **cleared the fault**; the screenshots do not show an image rollback in the original repo.

The original repo still needs a game-day record with verified run links, screenshot links, actual times and a measured image rollback if the assignment requires the full fault → alert → rollback → green sequence. Do not fill in a successful rollback result from the Solo fault-clear exercise.

## Nine-step tool notes

I completed my nine-step notes on GitHub Actions Environments and secrets, including purpose, environment scoping, secret access, approvals, runner internals, logs, limits and verification. The repo currently has a file whose path appears as `TOOL_NOTES.md ` with a trailing space; rename it to `TOOL_NOTES.md` so links and GitHub navigation are consistent.

## Evidence status

| Item | Status |
|---|---|
| Runbook and nine-step notes | Present on `main` |
| Separate secrets inventory | Add to original repo |
| CI and monitoring configuration | Present in source; live state requires verification |
| Solo fault/alert screenshots | Available as linked historical evidence |
| Original staging deployment | Latest completed run reviewed failed SSH copy; verify newer run |
| Original image rollback and under-ten-minute result | Not yet evidenced |