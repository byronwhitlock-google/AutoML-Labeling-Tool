data "google_service_account" "automl_service_account" {
  project   = var.project_id
  account_id = "automl-service-account"
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
        subnetwork = var.subnetwork
        subnetwork_project = var.project_id
    }

   service_account {
     email  = data.google_service_account.automl_service_account.email
     scopes = var.scopes
   }

   metadata_startup_script = "docker run -dp 80:5000 ${var.container_image_path}"
}


