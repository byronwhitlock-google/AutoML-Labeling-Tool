module "service-account" {
    source  = "../modules/terraform-service-account"
    project         = var.project
}

module "mig" {
    source = "../modules/terraform-mig"
    project_id           = var.project
    region               = var.region
    zone                 = var.zone
    mig_size             = var.mig_size
    subnetwork           = var.subnet
    service_account      = module.service-account.email
    container_image_path = var.container_image_path
    network_tags         = var.network_tags

}

module "ilb" {
    source = "../modules/terraform-ilb"
    project_id          = var.project
    network             = var.network
    subnet              = var.subnet
    proxy_subnet        = var.proxy_subnet
    region              = var.region
    instance_group_name = module.mig.instance_group_name
}

module "dns-record" {
    source = "../modules/terraform-dns-record-ilb"
    project_id          = var.project
    dns_zone_name       = var.dns_zone_name
    ilb_name            = module.ilb.ilb_name
    region              = var.region
}