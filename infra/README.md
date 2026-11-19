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

## Cheat sheet

Terraform describes infrastructure as code: `*.tf` files declare "a VM +
network + firewall + IP, named and tagged like this", and `terraform apply`
makes Azure match. Environments are identical code with different
`-var-file` values — `staging.tfvars` (env=staging, `10.10.x.x`) vs
`prod.tfvars` (env=prod, `10.20.x.x`).

```bash
# one-time: auth vars (az login must also be done)
export TF_VAR_subscription_id="<subscription-id>"
export TF_VAR_ssh_public_key="$(cat ~/.ssh/lumen-deploy.pub)"

terraform init                                  # download provider (once)
terraform plan  -var-file=envs/staging.tfvars   # dry run
terraform apply -var-file=envs/staging.tfvars   # build it
terraform destroy -var-file=envs/staging.tfvars # tear it all down

terraform fmt        # format .tf files
terraform validate   # syntax check
terraform import <resource> <azure-id>  # adopt an orphaned resource
```

Notes:

- **Re-running `apply` is safe.** Terraform diffs config vs recorded state:
  nothing changed → `No changes. Infrastructure is up-to-date.`. If
  someone edits resources in the portal, the next apply detects the drift
  and offers to put it back.
- `terraform.tfstate` (gitignored) is Terraform's memory — lose it and it
  forgets what it built. The commented `backend "azurerm"` block in
  `versions.tf` is the fix for shared/CI use.
- Never `apply` while a `destroy` or RG delete is still propagating —
  Azure deletes are async and racing them creates orphaned resources.
  Wait for `az group exists -n rg-lumen-staging` → `false` first.
- If apply fails with "Root object was present, but now absent", the
  resource was created but never recorded (known azurerm read-after-write
  race). Fix: `terraform import <addr> <azure-id> -var-file=...` then
  re-run apply.
- Trial sub quota: 4 vCPU per region, counted even when VMs are
  deallocated. Delete unused VMs fully (and their disks/IPs) before
  applying.

## Port map (open on the NSG)

| Port | Service |
|------|---------|
| 22   | SSH (restricted via `allowed_ssh_cidr`) |
| 80/443 | public HTTP(S) |
| 3000 | API (Hono) |
| 3001 | Web (Next.js) |
| 3002 | Grafana |
| 9090 | Prometheus |
