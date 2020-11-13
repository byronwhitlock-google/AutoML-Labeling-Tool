data "google_dns_managed_zone" "automl_dns_zone" {
  project = var.project_id
  name    = var.dns_zone_name
}

data "google_compute_forwarding_rule" "automl_ilb" {
  project = var.project_id
  name    = var.ilb_name
  region  = var.region
}

resource "google_dns_record_set" "autmoml_record" {
  project = var.project_id
  name    = "labelingtool.${data.google_dns_managed_zone.automl_dns_zone.dns_name}"
  type    = "A"
  ttl     = 300

  managed_zone = data.google_dns_managed_zone.automl_dns_zone.name

  rrdatas = [data.google_compute_forwarding_rule.automl_ilb.ip_address]
}