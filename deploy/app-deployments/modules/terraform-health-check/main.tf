resource "google_compute_region_health_check" "automl_health_check" {
  provider = google-beta

  project = var.project_id
  region  = var.region
  name    = var.automl_health_check
  http_health_check {
    port               = 80
    # port_specification = "USE_SERVING_PORT"
  }
}