resource google_service_account "automl_service_account" {
     project        = var.project
     account_id     = var.account_id
     display_name   = var.display_name
 }

resource "google_project_iam_member" "automl_predictor" {
  project = var.project
  role    = "roles/automl.predictor"
  member  = "serviceAccount:${google_service_account.automl_service_account.email}"
}

resource "google_project_iam_member" "automl_viewer" {
  project = var.project
  role    = "roles/automl.viewer"
  member  = "serviceAccount:${google_service_account.automl_service_account.email}"
}

resource "google_project_iam_member" "storage_objectAdmin" {
  project = var.project
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.automl_service_account.email}"
}