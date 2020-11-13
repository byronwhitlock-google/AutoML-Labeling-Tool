variable "project_id" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "name" {
  type        = string
  description = "The name for the compute vm to be created"
}

variable "machine_type" {
  type        = string
  description = "The machine type for the compute vm created"
}

variable "zone" {
  type        = string
  description = "The GCP Zone to create the Compute VM"
}

variable "tags" {
    type        = list(string)
    description = "The network tags to add for the Compute VM."
}

variable "image" {
  type        = string
  description = "The image for the compute vm."
}
variable "network" {
  type        = string
  description = "The network the dataproc compute vm created."
  default     = null
}

variable "subnetwork" {
  type        = string
  description = "The subnetwork the dataproc compute vm to created."
  default     = null
}

variable "subnetwork_project" {
  type        = string
  description = "The subnetwork project the compute vm to created."
  default     = null
}

variable "scopes" {
  type        = list(string)
  description = "The service account scopes to attach for the compute vm created"
}

variable "container_image_path" {
  description = "The path to the container image in GCR"
  type        = string
}

variable "service_account" {
  description = "Service account for the Compute Engine instance"
  type        = string
}