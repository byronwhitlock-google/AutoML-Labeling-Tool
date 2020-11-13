variable "project" {
    description = "GCP Project ID"
    type        = string
}

variable "dns_zone_name" {
    description = "DNS zone name"
    type        = string
    default     = "automl-labeling-tool"
}

variable "dns_zone" {
    description = "DNS name for the DNS zone"
    type        = string
}

variable "network" {
    description = "Network for DNS zone"
    type        = string
}

variable "vpc_id" {
    description = "Network ID for DNS zone"
    type        = string
}