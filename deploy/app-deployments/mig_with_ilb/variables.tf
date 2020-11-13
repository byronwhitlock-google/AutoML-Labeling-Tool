variable "credentials_path" {
  description = "File path of the service account credentials for Terraform"
  type        = string
}

variable "project" {
  description = "Project ID"
  type        = string
}

variable "network" {
  description = "GCP Network"
  type        = string
}

variable "subnet" {
  description = "GCP Subnet"
  type        = string
}

variable "proxy_subnet" {
  description = "Name of the subnet for the ILB proxies"
  type        = string
}


variable "container_image_path" {
  description = "GCR path to AutoML Labeling Tool Container image"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "zone" {
  description = "GCP Zone"
  type        = string
}

variable "mig_size" {
  description = "Size of the managed instance groups (# of GCE instances)"
  type       = number
}

variable "network_tags" {
  description = "Firewall network tags to add to instance"
  type        = list(string)
  default     = ["automl-labeling-tool", "load-balanced-backend"]
}

variable "dns_zone_name" {
  description = "DNS Zone name in which to create the ILB A record"
  type        = string
  default     = "automl-labeling-tool"
}