project_id      = "auto-ml-project-2aa7"
region          = "us-east1"

network             = "automl-vpc"
subnet              = "automl-subnet"
proxy_subnet        = "automl-ilb-proxy-subnet"
instance_group_name = "automl-managed-instance-group"

http_proxy_name         = "automl-http-proxy"
url_map_name            = "automl-url-map"
automl_backend          = "automl-backend"
automl_ilb_health_check = "automl-ilb-health-check"