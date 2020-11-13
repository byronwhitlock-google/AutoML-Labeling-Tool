output "ilb_name" {
    value       = var.forwarding_rule_name
    description = "Name of the internal loab balancer"
}

output "ilb_ip_address" {
    value       = google_compute_forwarding_rule.automl_forwarding_rule.ip_address
}