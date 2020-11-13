project_id      = "auto-ml-project-2aa7"
region          = "us-east1"
zone            = "us-east1-b"

rigm_name              = "automl-managed-instance-group"
base_instance_name     = "automl-vm"
mig_size               = 1
instance_template_name = "automl-template"
health_check_name      = "automl-mig-health-check"

subnet                 = "automl-subnet"

service_account        = "automl-service-account"

container_image_path   = "gcr.io/auto-ml-project-2aa7/automl-labeling-tool"