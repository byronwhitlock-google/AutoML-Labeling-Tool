module "project" {
  source            = "../modules/terraform-google-project"
  billing_account   = var.billingAccount
  org_id            = var.organizationID
  folder_id         = var.folderID
  name              = var.name
  project_id        = var.project_id
  random_project_id = var.random_project_id

  #labels                      = var.labels
  enable_apis                 = var.enable_apis
  activate_apis               = var.activate_apis
  disable_services_on_destroy = var.disable_services_on_destroy
  disable_dependent_services  = var.disable_dependent_services
  sa_roles                    = var.sa_roles
  group_emails                = var.group_emails
  member_attributes           = var.member_attributes
}

module "network" {
  source          = "../modules/terraform-network-base"
  project         = module.project.project_number
}

module "network-core" {
  source          = "../modules/terraform-network-core"
  project         = module.project.project_number
  vpc_name        = module.network.vpc_name
  subnet_region   = var.subnet_region
  cidr_range      = var.mig_cidr_range
  source_tags     = var.mig_source_tags
}

module "network-ilb" {
  source          = "../modules/terraform-network-ilb"
  project         = module.project.project_number
  vpc_name        = module.network.vpc_name
  subnet_region   = var.subnet_region
  cidr_range      = var.proxy_cidr_range
  target_tags     = var.proxy_source_tags
}

module "dns-zone" {
  source          = "../modules/terraform-dns-zone"
  project         = module.project.project_number
  network         = module.network.vpc_name
  vpc_id          = module.network.vpc_id
  dns_zone_name   = var.dns_zone_name
  dns_zone        = var.dns_zone
}