#Example tfvars
credentials_path = "../../../../terraform.json"

project      = "automl-labeling-project-8d0a"
network      = "automl-labeling-vpc"
subnet       = "automl-labeling-subnet"
proxy_subnet = "automl-labeling-tool-ilb-proxy-subnet"

container_image_path = "gcr.io/auto-ml-project-2aa7/automl-labeling-tool"

# MIG and ILB Configuration

region        = "us-east1"
zone          = "us-east1-b"
mig_size      = 1
network_tags  = ["automl-labeling-tool", "load-balanced-backend"]

# DNS Record Configuration

dns_zone_name = "automl-labeling-tool"
