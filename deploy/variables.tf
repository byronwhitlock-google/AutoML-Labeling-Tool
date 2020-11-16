variable "project_id" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "name" {
  type        = string
  description = "The name for the compute vm to be created"
  default     = "automl-labeling-tool-vm"
}

variable "machine_type" {
  type        = string
  description = "The machine type for the compute vm created"
  default     = "n2-standard-2" 
}

variable "region" {
  type        = string
  description = "The GCP Region to create the Conpute VM"
}

variable "zone" {
  type        = string
  description = "The GCP Zone to create the Compute VM"
}

variable "network" {
  type        = string
  description = "The network the dataproc compute vm created."
  default     = null
}

variable "subnet" {
  type        = string
  description = "The subnetwork the dataproc compute vm to created."
  default     = null
}

variable "subnetwork_project" {
  type        = string
  description = "The subnetwork project the compute vm to created."
}

variable "static_ip_address" {
  description = "The internal IP address for the Compute VM"
  type        = string
}

variable "tags" {
    type        = list(string)
    description = "The network tags to add for the Compute VM."
    default     = ["automl-labeling-tool"]
}

variable "image" {
  type        = string
  description = "The image for the compute vm."
  default     = "projects/cos-cloud/global/images/cos-77-12371-1096-0" 
}

variable "service_account_email" {
  description = "Service account for the Compute Engine instance"
  type        = string
}

variable "scopes" {
  type        = list(string)
  description = "The service account scopes to attach for the compute vm created"
  default     = ["cloud-platform"] 
}

variable "container_image_path" {
  description = "The path to the container image in GCR"
  type        = string
  default     =  "gcr.io/automl-labeling-tool/automl-labeling-tool"
}


