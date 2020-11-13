variable "project_id" {
  description = "The ID of the project in which the resource belongs."
  type        = string
}

variable "region" {
  description = "Region of the subnet and GCE instances"
  type        = string
}

variable "zone" {
  description = "Zone for the GCE instances"
  type        = string
}

variable "rigm_name" {
  description = "Name for the region instance group manager"
  type        = string
  default     = "automl-labeling-tool-mig" 
}

variable "base_instance_name" {
  description = "Base instance name to use for instances in the regional instance group"
  type        = string 
  default     = "automl-labeling-tool-vm"
}

variable "mig_size" {
  description = "Size of the Managed Instance Group (i.e., number of GCE instances)"
  type        = number
  default     = 1
}

variable "instance_template_name" {
  description = "Instance template name"
  type        = string
  default     = "automl-labeling-tool-template"
}

variable "subnetwork" {
  description = "Name of the subnet"
  type        = string
}

variable "service_account" {
  description = "ID of the service account"
  type        = string
}

variable "container_image_path" {
  description = "Path to AutoML Labelling Tool container image"
  type        = string
}

variable "health_check_name" {
  description = "Name for health check for the managed instance group"
  type        = string
  default     = "automl-labeling-tool-health-check"
}

variable "network_tags" {
  description = "Firewall network tags for the GCE instances"
  type        = list(string)
}