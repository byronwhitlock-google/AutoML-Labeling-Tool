variable "project_id" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "dns_zone_name" {
  type = string
  description = "Name of the Automl DNS Zone"
}

variable "vm_name" {
  type = string 
  description = "Name of the Automl Labeling Tool VM"
}

variable "zone" {
  type = string
  description = "Network zone for the Automl Labeling Tool VM"
}