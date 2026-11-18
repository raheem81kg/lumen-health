terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Remote state is the production-grade option: a shared Azure Storage
  # container so every teammate (and CI) applies against the same state.
  # For this project, state stays local — see infra/README.md for why and
  # what enabling this backend would look like.
  #
  # backend "azurerm" {
  #   resource_group_name  = "lumen-tfstate"
  #   storage_account_name = "lumentfstate"
  #   container_name       = "tfstate"
  #   key                  = "lumen.tfstate"
  # }
}
