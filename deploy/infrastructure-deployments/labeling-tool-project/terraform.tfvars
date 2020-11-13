

credentials_path = "../../../../terraform.json"

################################################
##########   PROJECT VARIABLES #################
################################################

name              = "AutoML Labeling Project"
project_id        = "automl-labeling-project"
random_project_id = true # disable to get exact project ID

labels = {
  auto-ml-key : "auto-ml-values",
}

enable_apis = true
activate_apis = [
  "compute.googleapis.com",
  "cloudbuild.googleapis.com",
  "cloudresourcemanager.googleapis.com",
  "containerregistry.googleapis.com",
  "iam.googleapis.com",
  "servicemanagement.googleapis.com",
  "dns.googleapis.com"

]

disable_services_on_destroy = "true"
disable_dependent_services  = "true"

member_attributes = {
  
  "user:eprocopio@kubernetes.deloitte.com" = {
    roles = [
      "roles/owner",
    ]
  }
}

################################################
##########   NETWORK VARIABLES #################
################################################

subnet_region     = "us-east1"
mig_cidr_range    = "10.0.0.0/24"
mig_source_tags   = ["automl-labeling-tool"]

proxy_cidr_range  = "10.129.0.0/26"
proxy_source_tags = ["load-balanced-backend"]

################################################
##########   DNS Zone VARIABLES ################
################################################

dns_zone_name     = "automl-labeling-tool"
dns_zone          = "automl."