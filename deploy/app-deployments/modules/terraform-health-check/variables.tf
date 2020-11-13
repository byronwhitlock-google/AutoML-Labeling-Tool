variable "project_id" {
  description = "The ID of the project in which the resource belongs."
  type        = string
}

variable "region" {
  description = "Region of the subnet and GCE instances"
  type        = string
}

variable "automl_mig_health_check" {
  description = "Name for the Health Check"
  type        = string
 