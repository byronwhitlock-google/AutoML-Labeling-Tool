variable "project" {
    description = "ID of project in which to place the network resources"
    type        = string
}

variable "vpc_name" {
    description = "Name of the VPC"
    type        = string
    default     = "automl-labeling-vpc"
}