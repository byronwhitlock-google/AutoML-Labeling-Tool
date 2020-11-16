# AutoML Labeling Tool Deployment Guide

1. Install Terraform
2. Configure Backend (optional)
3. Set Required Inputs
4. Apply Terraform Configuration




## Required Inputs
The following variables are required to be set for the Terraform deploy script to run

|       Name                  |  Description                                                     |
|---                          |---                                                               |
| project_id                  | ID for the project in which to deploy the labeling tool          |
| name                        | Name for the GCE instance on which the labeling tool is deployed |
| region                      | Region in which to deploy the GCE instance                       |
| zone                        | Zone in which to deploy the GCE instance                         |
| network                     | Network on which to deploy the GCE instance                      |
| subnet                      | Subnet on which to deploy the GCE instance                       |
| subnetwork_project          | ID of the project in which the subnetwork is created.  Note that project_id and subnetwork_project can be the same value |
| static_ip_address           | The internal IP address for the GCE instance.  Note that this address must be within RFC1918 IP space and available on the subnet.  The GCE instance does not have an external IP address   |
| service_account_email       | Email ID of the service account under which the GCE instance will run |


## Additional Inputs
The following variables are configurable in the Terraform deploy script.  However, they have been provided default values to simplify deployment.  You can choose to overwrite any of these values or accept them as-is

|       Name                  |  Description                                                     | Default Value(s)          |
|---                          |---                                                               |---
| machine_type                | Size of the GCE instance                                         | n2-standard-2     |
| tags                        | Network tags for the GCE instance.  These tags can be used to assign specific firewall rules to allow/disallow instance to the GCE instance  | ["automl-labeling-tool"]
| image                       | GCE image for the GCE instance.  The AutoML Labeling tool is deployed as a Docker container and requires Docker to be included as part of the VM image.  The default image uses Google Containerized OS (COS) | projects/cos-cloud/global/images/cos-77-12371-1096-0 |
| scopes                      | Scopes control which GCP APIs the GCE VM can access.  At a minimum, the AutoML Labeling Tool requires access to: Google Cloud Storage (GCS), AutoML, and Google Identity for OAuth 2.0 authentication.  The current default value allows the VM to access any GCP API.  | ["cloud-platform"]
| container_image_path        | The path to the AutoML Labeling Tool container image within GCR.  Note that the deployment script assumes that this container image is publicly available (i.e., can be accessed without authentication).  If you decide to host the container image in your own GCR instance, you must set the GCR visibility to public | gcr.io/automl-labeling-tool/automl-labeling-tool |