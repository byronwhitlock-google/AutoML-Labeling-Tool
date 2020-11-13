project         = "auto-ml-project-2aa7"
vpc_name        = "automl-vpc"

subnet_name     = "automl-ilb-proxy-subnet"
subnet_region   = "us-east1"
cidr_range      = "10.129.0.0/26"
target_tags     = ["load-balanced-backend"]