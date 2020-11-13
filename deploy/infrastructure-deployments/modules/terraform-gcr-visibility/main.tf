variable project {
    description = "Project ID"
    type = string
}

resource "null_resource" "public-visibility" {
    provisioner "local-exec" {
        command = "gsutil iam ch allUsers:objectViewer gs://artifacts.${var.project}.appspot.com"
    }
}