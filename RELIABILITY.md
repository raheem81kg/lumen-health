## Day 2 — Integration

**Assigned responsibility:** Wire secrets into the deployment pipeline and complete the runbook’s deployment, rollback, and alert response procedures.

### Secrets and pipeline

The secrets inventory identifies the values needed for each environment. The deployment workflow must read staging and production credentials from their respective GitHub Environments. In particular:

- `DATABASE_URL` must be provided to the API at runtime, with a separate value for staging and production.
- `DEPLOY_SSH_KEY` must be scoped to the environment whose VM is being deployed.
- A GHCR read credential is needed on the VM if the published images are private.
- Secret values must not be committed, printed in Actions logs, or embedded in container images.
- Production deployment must use a GitHub Environment with required reviewers configured in repository settings.

**Status: Pending integration.** At the time of review, the original repository’s `main` branch has no `.github/workflows` deployment file. The secrets cannot be wired into Matthew’s staging and production jobs until that workflow is added. The presence and values of GitHub Environment secrets have not been verified.

### Runbook

`docs/RUNBOOK.md` now documents:

1. Deploying the same immutable web and API image tag to staging, checking `/health`, `/ready`, `/version`, and the web app, then promoting that tag through the production approval gate.
2. Rolling back to previously published images without rebuilding or reusing an old tag for new source code.
3. Responding to API downtime, database readiness failures, elevated 5xx errors, and high latency.

**Status: Written; live validation pending.** The current Compose file builds images locally and does not provide an image-based rollback path. A staging deployment and rollback must be performed after the pipeline is implemented. Record the workflow run links, image SHA, check results, and measured recovery time.

### Day 2 handoff

- **Matthew:** Add the deployment workflow and coordinate the secret references in the staging and production jobs.
- **Raheem:** Confirm the VM targets, environment separation, and secure access.
- **Max:** Configure alert rules, dashboard panels, and monitoring of the deployed environments.
- **Terri:** Verify secret names and scopes, review the pipeline’s handling of secrets, maintain the runbook, and record redacted deployment and rollback evidence.

**Day 2 completion state:** Runbook procedures are complete. Pipeline secret wiring and live verification remain pending.