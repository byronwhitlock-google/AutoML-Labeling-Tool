
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

module "gcs" {
  source = "../modules/terraform-cloudstorage"
  project = module.project.project_id
}
