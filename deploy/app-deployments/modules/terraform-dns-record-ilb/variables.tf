variable "project_id" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "dns_zone_name" {
  type = string
  description = "Name of the Automl DNS Zone"
}

variable "ilb_name" {
  type = string 
  description = "Name of the Automl Labeling Tool internal load balancer"
}

variable "region" {
  type = string
  description = "Network region for the Automl Labeling Tool Internal Load Balancer"
}