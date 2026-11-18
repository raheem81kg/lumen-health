output "public_ip" {
  description = "Public IP of the environment VM."
  value       = azurerm_public_ip.main.ip_address
}

output "fqdn" {
  description = "Fully qualified domain name of the environment VM."
  value       = azurerm_public_ip.main.fqdn
}

output "ssh_command" {
  description = "Convenience SSH command for the admin user."
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.main.fqdn}"
}

output "app_url" {
  description = "URL of the deployed web app."
  value       = "http://${azurerm_public_ip.main.fqdn}:${var.deploy_app_port}"
}

output "resource_group_name" {
  description = "Resource group containing all environment resources."
  value       = azurerm_resource_group.main.name
}
