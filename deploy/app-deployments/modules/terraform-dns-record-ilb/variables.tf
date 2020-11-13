variable "project_id" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "dns_zone_name" {
  type = string
  description = "Name of the Automl DNS Zone"
}

variable "dns_zone" {
  type = string
  description = "Value of the AutoMl DNS Zone"
}

variable "ilb_name" {
  type = string 
  description = "Name of the Automl Labeling Tool internal load balancer"
}

variable "ilb_ip_address" {
  type = string
  description = "IP Address of the AutoML Labeling Tool interal load balancer"
}

variable "region" {
  type = string
  description = "Network region for the Automl Labeling Tool Internal Load Balancer"
}