data "google_compute_network" "automl_network" {
  project = var.project_id
  name    = var.network
}

data "google_compute_subnetwork" "automl_subnet" {
  project = var.project_id
  name    = var.subnet 
  region  = var.region
}

data "google_compute_subnetwork" "proxy" {
  project = var.project_id
  name    = var.proxy_subnet
  region  = var.region
}

data "google_compute_region_instance_group" "automl_instance_group" {
  project  = var.project_id
  name     = var.instance_group_name
  region   = var.region
}

resource "google_compute_forwarding_rule" "automl_forwarding_rule" {
  provider    = google-beta
  depends_on  = [data.google_compute_subnetwork.proxy]
  
  project     = var.project_id
  name        = var.forwarding_rule_name
  region      = var.region

  ip_protocol           = "TCP"
  load_balancing_scheme = "INTERNAL_MANAGED"
  port_range            = 80
  target                = google_compute_region_target_http_proxy.automl_proxy.id
  network               = data.google_compute_network.automl_network.id
  subnetwork            = data.google_compute_subnetwork.automl_subnet.id
  network_tier          = "PREMIUM"
}

resource "google_compute_region_target_http_proxy" "automl_proxy" {
  provider = google-beta
  project  = var.project_id
  region   = var.region
  name     = var.http_proxy_name
  url_map  = google_compute_region_url_map.automl_map.id
}

resource "google_compute_region_url_map" "automl_map" {
  provider = google-beta
  project         = var.project_id
  region          = var.region
  name            = var.url_map_name
  default_service = google_compute_region_backend_service.automl_backend.id
}

resource "google_compute_region_backend_service" "automl_backend" {
  provider = google-beta
  
  load_balancing_scheme = "INTERNAL_MANAGED"

  backend {
    group = data.google_compute_region_instance_group.automl_instance_group.self_link
    balancing_mode = "UTILIZATION"
    capacity_scaler = 1.0
  }

  project     = var.project_id
  region      = var.region
  name        = var.automl_backend
  protocol    = "HTTP"
  timeout_sec = 10

  health_checks = [google_compute_region_health_check.automl_ilb_health_check.id]
}

resource "google_compute_region_health_check" "automl_ilb_health_check" {
  provider = google-beta

  project = var.project_id
  region  = var.region
  name    = var.automl_ilb_health_check
  http_health_check {
    port               = 80
  }
}
