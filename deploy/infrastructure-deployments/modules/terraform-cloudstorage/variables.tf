variable project {
    description = "GCP Project ID"
    type        = string
}

variable bucket_name {
    description = "GCS Bucket Name"
    type        = string
    default     = "automl-labeling-tool-bucket"
}
