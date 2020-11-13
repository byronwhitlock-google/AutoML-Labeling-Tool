data "google_dns_managed_zone" "automl_dns_zone" {
  project = var.project_id
  name    = var.dns_zone_name
}

data "google_compute_instance" "automl_vm" {
  project = var.project_id
  name    = var.vm_name
  zone    = var.zone

}

resource "google_dns_record_set" "autmoml_record" {
  project = var.project_id
  name    = "labelingtool.${data.google_dns_managed_zone.automl_dns_zone.dns_name}"
  type    = "A"
  ttl     = 300

  managed_zone = data.google_dns_managed_zone.automl_dns_zone.name

  rrdatas = [data.google_compute_instance.automl_vm.network_interface[0].network_ip]
}