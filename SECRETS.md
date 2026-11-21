# Lumen Health — Secrets and Environment Configuration

**Owner:** Terri-Etana Thoms

## Deployment secrets

Add these names under **Repository Settings → Environments → staging → Environment secrets**. Add separate production values under **production**.

| Secret name | Value to enter in GitHub Settings | Used for |
|---|---|---|
| `DATABASE_URL` | The rotated Neon PostgreSQL connection URL | API database access |
| `DEPLOY_SSH_KEY` | The new OpenSSH private key, including its BEGIN and END lines | Deployment access to the VM |
| `GHCR_PAT` | The replacement GitHub token with permission to read the container images | Pulling web and server images from GHCR |

Raheem supplied earlier values for these three secrets in chat. They must be replaced before use. **Do not paste their values into this file, commits, issues, screenshots, or logs.**

## Local development

The local server environment file is `apps/server/.env`. It uses:

```dotenv
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=<local-development-database-url>
NODE_ENV=development
```

Replace the placeholder only in the uncommitted local `.env` file. The `localhost` origin and `development` mode are for local use; the deployment workflow sets the deployed values.

## GitHub Actions

- `staging` and `production` must each have `DATABASE_URL`, `DEPLOY_SSH_KEY`, and `GHCR_PAT` configured.
- Configure required reviewers on the `production` Environment.
- GitHub provides `GITHUB_TOKEN` automatically to the workflow for building and pushing images.
- The secret names appearing in `.github/workflows/ci.yml` do not confirm that values have been configured in GitHub Settings.

## Grafana demo login

The team chose `admin` / `admin` for the restricted project demo. This is a known default login. Grafana credentials are separate from the three deployment secrets. Restrict access to the demo dashboard and change its password before exposing it to real users or sensitive data.

## Verification

An authorized repository administrator should verify the Environment secret names and production reviewer rule. Then confirm that the staging deployment succeeds, `/health` and `/ready` pass, and no credential values appear in Actions logs. Record the workflow run URL and deployed commit SHA in the runbook.