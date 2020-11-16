variable "project" {
  type        = string
  description = "The ID of the project in which the resource belongs."
}

variable "account_id" {
  description = "ID for the AutoML Labeling Tool service account"
  type        = string
  default     = "automl-labeling-tool-sa"
}

variable "display_name" {
  description = "Display name for the AutoML Labeling Tool service account"
  type        =  string
  default     = "automl-labeling-tool-sa"
}