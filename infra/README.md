# Infrastructure

Terraform code that builds the Lumen Health staging and production
environments on Azure. Each environment is a resource group containing a
virtual network, firewall rules, and an Ubuntu VM with Docker installed —
the pipeline deploys containers onto it.

## Layout

```
infra/terraform/
  versions.tf      provider pins + commented remote-state backend
  variables.tf     all tunables
  main.tf          resource group, vnet/subnet, NSG, public IP, NIC, VM
  outputs.tf       public IP, FQDN, SSH command, app URL
  cloud-init.yaml  first-boot provisioning (docker, compose, /opt/lumen)
  envs/
    staging.tfvars environment-specific values
    prod.tfvars
```

## Auth (one-time, local)

Terraform authenticates to Azure via a service principal. Set these before
running anything (teammates: get the values from the infra owner — never
commit them):

```bash
export ARM_CLIENT_ID=...
export ARM_CLIENT_SECRET=...
export ARM_TENANT_ID=...
export ARM_SUBSCRIPTION_ID=...      # also referenced below as TF_VAR
export TF_VAR_subscription_id="$ARM_SUBSCRIPTION_ID"
export TF_VAR_ssh_public_key="$(cat ~/.ssh/id_ed25519.pub)"
```

Alternatively `az login` works without a service principal — the provider
picks up the CLI session; only `TF_VAR_*` vars are still needed.

## Usage

```bash
cd infra/terraform
terraform init

# Staging
terraform plan  -var-file=envs/staging.tfvars
terraform apply -var-file=envs/staging.tfvars

# Production (identical code, different var file)
terraform apply -var-file=envs/prod.tfvars

# Rebuild proof: destroy and re-apply produces the same environment
terraform destroy -var-file=envs/staging.tfvars
```

Outputs print the VM's FQDN, SSH command, and app URL.

> **Note on state:** each `apply` stores state in a local
> `terraform.tfstate` (gitignored). For a shared team workflow the
> `backend "azurerm"` block in `versions.tf` can be pointed at an Azure
> Storage container so CI and every teammate apply against one state.
> Documented in `versions.tf`; left local for this project.

## Port map (open on the NSG)

| Port | Service |
|------|---------|
| 22   | SSH (restricted via `allowed_ssh_cidr`) |
| 80/443 | public HTTP(S) |
| 3000 | API (Hono) |
| 3001 | Web (Next.js) |
| 3002 | Grafana |
| 9090 | Prometheus |
