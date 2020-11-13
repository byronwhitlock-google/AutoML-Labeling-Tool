

resource "google_compute_subnetwork" "ilb_proxy" {
    provider        = google-beta
    project         = var.project
    name            = var.subnet_name
    ip_cidr_range   = var.cidr_range
    region          = var.subnet_region
    network         = var.vpc_name
    purpose         = "INTERNAL_HTTPS_LOAD_BALANCER"
    role            = "ACTIVE"
}

resource "google_compute_firewall" "allow_tcp_to_proxy" {
    provider        = google-beta
    project         = var.project
    name            = "allow-tcp-to-proxy"
    network         = var.vpc_name
    source_ranges   = [google_compute_subnetwork.ilb_proxy.ip_cidr_range]
    target_tags     = var.target_tags
    allow {
        protocol    = "tcp"
        ports       = ["80"]
    }
    allow {
        protocol    = "tcp"
        ports       = ["443"]
    }
    allow {
        protocol    = "tcp"
        ports       = ["8080"]
    }
    direction       = "INGRESS"
}
