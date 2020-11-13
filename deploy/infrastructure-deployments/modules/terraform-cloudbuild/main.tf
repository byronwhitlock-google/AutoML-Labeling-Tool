resource "google_cloudbuild_trigger" "test-trigger" {
    provider = google-beta
    name = var.trigger_name_test
    project = var.project

    github {
        owner   = var.github_repo_owner
        name    = var.github_repo_name_test
        
        push {
            branch = "^master$"
        }
    }

    filename = "cloudbuild.yaml"
}

resource "google_cloudbuild_trigger" "automl-trigger" {
    provider = google-beta
    name = var.trigger_name
    project = var.project

    github {
        owner   = var.github_repo_owner
        name    = var.github_repo_name
        
        push {
            branch = "^master$"
        }
    }

    filename = "cloudbuild.yaml"
}