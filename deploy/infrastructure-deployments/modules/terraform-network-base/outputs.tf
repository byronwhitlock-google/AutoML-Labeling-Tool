
output "vpc_name" {
  value       = google_compute_network.vpc_network.name
  description = "VPC Name"
}

output "vpc_id" {
  value       = google_compute_network.vpc_network.self_link
}