resource "google_compute_network" "vpc_network" {
    project                 = var.project
    name                    = var.vpc_name
    auto_create_subnetworks = false

}

