data "google_compute_image" "cos_image" {
  provider = google-beta
  family   = "cos-stable"
  project  = "cos-cloud"
}

data "google_compute_subnetwork" "subnetwork" {
  project = var.project_id
  name    = var.subnetwork
  region  = var.region
}

/*
data "google_service_account" "automl_service_account" {
  project   = var.project_id
  account_id = var.service_account
}
*/

resource "google_compute_region_instance_group_manager" "rigm" {
  provider = google-beta
  project  = var.project_id
  region   = var.region
  name     = var.rigm_name
  version {
    instance_template = google_compute_instance_template.instance_template.id
    name              = "primary"
  }

  base_instance_name = var.base_instance_name
  target_size        = var.mig_size

  auto_healing_policies { 
    health_check = google_compute_health_check.mig_health_check.self_link
    initial_delay_sec = 60
  } 

}

resource "google_compute_instance_template" "instance_template" {
  provider     = google-beta
  name         = var.instance_template_name
  machine_type = "n2-standard-2"
  project      = var.project_id

  disk {
    source_image = data.google_compute_image.cos_image.self_link
    auto_delete  = true
    boot         = true
  }

  network_interface {
    #subnetwork         = var.subnetwork
    subnetwork         = data.google_compute_subnetwork.subnetwork.self_link
    subnetwork_project = var.project_id
  }

  tags = var.network_tags
  
  service_account {
    email   = var.service_account
    #email  = data.google_service_account.automl_service_account.email
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = "docker run -dp 80:5000 ${var.container_image_path}"

}

resource "google_compute_health_check" "mig_health_check" {
  provider = google-beta

  project = var.project_id
  name    = var.health_check_name

  http_health_check {
    port = 80
  }
}