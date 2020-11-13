output "instance_group_name" {
    value       = var.rigm_name
    description = "Name of the managed instance group"
}

output "instance_group" {
    value = google_compute_region_instance_group_manager.rigm.instance_group
}