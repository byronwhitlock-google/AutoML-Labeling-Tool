resource "google_compute_subnetwork" "auto_ml_subnet" {
    project                     = var.project
    name                        = var.subnet_name
    ip_cidr_range               = var.cidr_range
    region                      = var.subnet_region
    network                     = var.vpc_name
    private_ip_google_access    = true
}

resource "google_compute_firewall" "allow-tcp" {
    project            = var.project 
    name               = "automl-allow-tcp"
    network            = var.vpc_name
    direction          = "INGRESS"

    allow {
        protocol = "tcp"
        ports    = ["80"]
    }

    target_tags = var.source_tags
}

resource "google_compute_firewall" "allow-iap-ssh" {
    project             = var.project
    name                = "automl-allow-iap-ssh"
    network             = var.vpc_name
    direction           = "INGRESS"
    source_ranges       = ["35.235.240.0/20"]    

    allow {
        protocol = "tcp"
        ports    = ["22"]
    }
    
    target_tags = var.source_tags
}

resource "google_compute_firewall" "allow_health_check_probes" {
    provider        = google-beta
    project         = var.project
    name            = "allow-health-check-probes"
    network         = var.vpc_name
    source_ranges   = ["130.211.0.0/22", "35.191.0.0/16"]
    allow {
        protocol = "tcp"
    }
    target_tags = ["load-balanced-backend"]
    direction   = "INGRESS"
}
