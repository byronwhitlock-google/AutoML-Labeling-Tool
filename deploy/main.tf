resource "google_compute_address" "ip_address" {
  name          = "automl-labeling-tool-internal-ip"
  project       = var.project_id
  subnetwork    = var.subnet
  address_type  = "INTERNAL"
  address       = var.static_ip_address
  region        = var.region
}

resource "google_compute_instance" "vm" {
   name         = var.name
   machine_type = var.machine_type
   zone         = var.zone
   project      = var.project_id

   tags = var.tags

   boot_disk {
     initialize_params {
       image = var.image
     }
   }

   network_interface {
        network            = var.network
        subnetwork         = var.subnet
        subnetwork_project = var.subnetwork_project
        network_ip         = google_compute_address.ip_address.self_link
    }

   service_account {
     email  = var.service_account_email
     scopes = var.scopes
   }

   metadata_startup_script = "docker run -dp 80:5000 ${var.container_image_path}"
}


