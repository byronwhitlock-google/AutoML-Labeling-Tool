locals {
  credentials_file_path = var.credentials_path
}

/******************************************
  Provider configuration
 *****************************************/


provider "google" {
  credentials = file(local.credentials_file_path)
  version = "~> 3.30"
}

provider "google-beta" {
  credentials = file(local.credentials_file_path)
  version = "~> 3.30"
}

provider "null" {
  version = "~> 2.1"
}

provider "random" {
  version = "~> 2.2"
}
