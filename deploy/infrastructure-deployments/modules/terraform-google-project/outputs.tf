
output "project_number" {
  value       = google_project.project.number
  description = "The project Number"
  depends_on  = [google_service_account_iam_member.service_account_grant_to_group]
}

output "service_account_email" {
  value       = google_service_account.default_service_account.email
  description = "The email of the default service account"
}

output "service_account_name" {
  value       = google_service_account.default_service_account.name
  description = "The email of the default service account"
}

output "project_id" {
  value       = google_project.project.project_id
  description = "The project ID"
  depends_on  = [google_service_account_iam_member.service_account_grant_to_group]
}
