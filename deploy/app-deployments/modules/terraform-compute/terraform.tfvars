project_id      = "gred-ptddtalak-sb-001-e4372d8c"

name               = "automl-labeling-tool-vm"
machine_type       = "n2-standard-2"
zone               = "us-west1-b"
tags               = ["automl"]
image              = "projects/cos-cloud/global/images/cos-77-12371-1096-0"
network            = "vpc-ptddatalak-sb-001"
subnetwork         = "sub-prv-usw1-01"
subnetwork_project = "gred-ptddtalak-sb-001-e4372d8c"
scopes             = ["cloud-platform"] 

service_account    = "sparq-300@grad-ptddtalak-sb-001-e4372d8c.iam.gserviceaccountcom"

container_image_path = "gcr.io/automl-labeling-tool/automl-labeling-tool"