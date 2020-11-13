
resource "google_dns_managed_zone" "automl-prive-zone" {
    project     = var.project
    name        = var.dns_zone_name
    dns_name    = var.dns_zone
    description = "Private DNS Zone for AutoML Labeling Tool instance"

    visibility = "private"

    private_visibility_config { 
        networks {
            network_url = var.vpc_id
        }
    }
}