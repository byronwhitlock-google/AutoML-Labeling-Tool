project_id      = "auto-ml-project-2aa7"

name               = "automl-vm"
machine_type       = "n2-standard-2"
zone               = "us-east1-b"
tags               = ["automl"]
image              = "projects/cos-cloud/global/images/cos-77-12371-1096-0"
network            = "automl-vpc"
subnetwork         = "automl-subnet"
subnetwork_project = "auto-ml-project-2aa7"
scopes             = ["cloud-platform"] 

service_account    = "automl-service-account"

container_image_path = "gcr.io/auto-ml-project-2aa7/automl-labeling-tool"