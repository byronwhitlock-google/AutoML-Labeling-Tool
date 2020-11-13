
/******************************************
  Project random id suffix configuration
 *****************************************/
resource "random_id" "random_project_id_suffix" {
  byte_length = 2
}

/******************************************
  Locals configuration
 *****************************************/
locals {
  base_project_id   = var.project_id == "" ? var.name : var.project_id
  project_org_id    = var.folder_id != "" ? null : var.org_id
  project_folder_id = var.folder_id != "" ? var.folder_id : null
  temp_project_id = var.random_project_id ? format(
    "%s-%s",
    local.base_project_id,
    random_id.random_project_id_suffix.hex,
  ) : local.base_project_id
  api_set = var.enable_apis ? toset(var.activate_apis) : []
  s_account_fmt = format(
    "serviceAccount:%s",
    google_service_account.default_service_account.email,
  )
  sa_roles = toset(var.sa_roles)

  iam_member = toset(flatten([
    for members, roles_list in var.member_attributes : [
      for roles in roles_list["roles"] : {
        member_id = members
        role      = roles
    }]
    ])
  )
  activate_apis = distinct(concat(var.activate_apis, [
    "serviceusage.googleapis.com"
  ]))
}

/*******************************************
  Project creation
 *******************************************/
resource "google_project" "project" {
  name                = var.name
  project_id          = local.temp_project_id
  org_id              = local.project_org_id
  folder_id           = local.project_folder_id
  billing_account     = var.billing_account
  auto_create_network = var.auto_create_network

  labels = var.labels

}

/******************************************
  APIs configuration
 *****************************************/
module "project_services" {
  source        = "./sub-modules"
  enable_apis   = var.enable_apis
  project_id    = google_project.project.project_id
  activate_apis = local.activate_apis

  disable_services_on_destroy = var.disable_services_on_destroy
  disable_dependent_services  = var.disable_dependent_services
}

/******************************************
  Default Service Account configuration
 *****************************************/
resource "google_service_account" "default_service_account" {
  account_id   = "project-service-account"
  display_name = "${var.name} Project Service Account"
  project      = google_project.project.project_id

  depends_on = [module.project_services]
}

/**************************************************
  Policy to operate service account in the project
 *************************************************/
resource "google_project_iam_member" "default_service_account_membership" {
  for_each = local.sa_roles
  project  = google_project.project.project_id
  role     = each.value
  member   = local.s_account_fmt

  depends_on = [google_service_account.default_service_account]
}

/******************************************
  Gsuite Group Role Configuration
 *****************************************/
resource "google_project_iam_member" "gsuite_group_role_bind" {
  for_each = {
    for member in local.iam_member : "${member.member_id}.${member.role}" => member
  }
  member  = each.value.member_id
  project = google_project.project.project_id
  role    = each.value.role

  depends_on = [module.project_services]
}

/******************************************
  Granting serviceAccountUser to group
 *****************************************/
resource "google_service_account_iam_binding" "service_account_grant_to_group" {

  members            = var.group_emails
  role               = "roles/iam.serviceAccountUser"
  service_account_id = "projects/${google_project.project.project_id}/serviceAccounts/${google_service_account.default_service_account.email}"

  depends_on = [
    google_service_account.default_service_account,
    google_project_iam_member.gsuite_group_role_bind
  ]
}