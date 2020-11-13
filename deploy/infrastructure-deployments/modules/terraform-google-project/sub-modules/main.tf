
locals {
  api_set = var.enable_apis ? toset(var.activate_apis) : []
}

/******************************************
  APIs configuration
 *****************************************/
resource "google_project_service" "project_services" {
  for_each                   = local.api_set
  project                    = var.project_id
  service                    = each.value
  disable_on_destroy         = var.disable_services_on_destroy
  disable_dependent_services = var.disable_dependent_services
}

variable "project_id" {}
variable "enable_apis" {}
variable "activate_apis" {
  type = list(string)
}
variable "disable_services_on_destroy" {}
variable "disable_dependent_services" {}

output "enabled_apis" {
  description = "Enabled APIs in the project"
  value       = [for api in google_project_service.project_services : api.service]
}
