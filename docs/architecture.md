# Lumen Health — Platform Architecture

```mermaid
flowchart LR
    subgraph Dev["Developer machine"]
        push[git push to main]
    end

    subgraph GH["GitHub"]
        push --> ci[Actions pipeline<br/>test → build images → GHCR]
        ci -->|auto deploy| staging
        ci -->|manual approval| prod
    end

    subgraph Azure["Azure (Terraform-managed)"]
        subgraph staging["staging env"]
            s_vm[VM · docker compose<br/>web :3001 · api :3000]
        end
        subgraph prod["prod env"]
            p_vm[VM · docker compose<br/>web :3001 · api :3000]
        end
        staging -->|same image sha| prod
    end

    subgraph Neon["Neon (managed)"]
        db[(PostgreSQL)]
    end

    subgraph Obs["Observability stack (docker compose on VM)"]
        prom[Prometheus<br/>scrapes /metrics]
        graf[Grafana<br/>dashboard + alerts]
        prom --> graf
    end

    s_vm --> db
    p_vm --> db
    s_vm & p_vm -.->|scrape| prom
```

## Components

- **Web** — Next.js app, port 3001 (docker compose service `web`)
- **API** — Hono server, port 3000, exposes `/health` `/ready` `/metrics`
  `/version` `/__debug/fault` (docker compose service `server`)
- **Database** — Neon managed Postgres, shared connection string via
  `DATABASE_URL` secret (never in the repo)
- **Terraform** — builds RG/VNet/NSG/VM per environment from
  `infra/terraform`; staging and prod differ only in `*.tfvars`
- **CI/CD** — GitHub Actions: test → build + push `web`/`server` images to
  GHCR → deploy staging → approval gate → deploy prod (same image tag)
- **Monitoring** — Prometheus scrapes the API `/metrics`; Grafana shows
  up/down, error rate, latency; ≥2 alert rules
- **Recovery** — rollback = redeploy previous image tag; fault injection
  via `/__debug/fault` drives the game day
