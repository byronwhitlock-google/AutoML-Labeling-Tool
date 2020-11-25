# AutoML Labeling Tool Deployment Guide
The AutoML Labeling tool is packaged as a container which can run in a number of different ways.  This deployment creates a Google Compute Engine (GCE) instance with a static internal (i.e., RFC1918) IP address to provide secure private access to the tool.  The deployment consists of a Terraform module to instantiate the required resources.  

## Configuration 

### Pre-requisites
The deployment assumes that a number of pre-requisites have been configured prior to running the deploy script.  They are:

1. GCP Project in which to deploy the GCE instance 
2. Networking Resources for the GCE instance to connect
    1. GCP VPC (i.e., Network
    2. GCP Subnet
    3. GCP firewall rules (as needed to allow client browers to connect to the instance).  Note that the AutoML labeling tool maps to port 80 on the GCE instance.
3. GCP Service Account for the VM to run under.  This service account, at a minmum, requires the following  permissions: roles/automl.predictor; roles/automl.viewer; roles/storage.objectAdmin
4. DNS record pointing to IP address of the GCE instance. 

### Required Inputs
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

### Additional Inputs
The following variables are configurable in the Terraform deploy script.  However, they have been provided default values to simplify deployment.  You can choose to overwrite any of these values or accept them as-is

|       Name                  |  Description                                                     | Default Value(s)          |
|---                          |---                                                               |---
| machine_type                | Size of the GCE instance                                         | n2-standard-2     |
| tags                        | Network tags for the GCE instance.  These tags can be used to assign specific firewall rules to allow/disallow instance to the GCE instance  | ["automl-labeling-tool"]
| image                       | GCE image for the GCE instance.  The AutoML Labeling tool is deployed as a Docker container and requires Docker to be included as part of the VM image.  The default image uses Google Containerized OS (COS) | projects/cos-cloud/global/images/cos-77-12371-1096-0 |
| scopes                      | Scopes control which GCP APIs the GCE VM can access.  At a minimum, the AutoML Labeling Tool requires access to: Google Cloud Storage (GCS), AutoML, and Google Identity for OAuth 2.0 authentication.  The current default value allows the VM to access any GCP API.  | ["cloud-platform"]
| container_image_path        | The path to the AutoML Labeling Tool container image within GCR.  Note that the deployment script assumes that this container image is publicly available (i.e., can be accessed without authentication).  If you decide to host the container image in your own GCR instance, you must set the GCR visibility to public | gcr.io/automl-labeling-tool/automl-labeling-tool |

## Deployment Process
Once the pre-requisites have been setup, the deployment process involves configuring the Terraform installer to make it aware of the environment and running Terraform to deploy the resources.

1. Install Terraform.  Download the appropriate Terraform binary for your system (https://www.terraform.io/downloads.html).  Install Terraform by unzippint it and moving it to a directory included in your system's PATH.  Note that GCP Cloud Shell has Terraform pre-installed. 
2. Configure Backend (optional).  Terraform generally stores the state of resources it creates locally to your machine.  To prevent potential corruption, it is strongly recommend to setup Google Cloud Storage as a remote state backend for Terraform.  To setup the backend, the following steps are required: 
3. Create a GCS bucket to serve as the remote backend and a top-level within the GCS folder to store the actual state
    1. Enter the name of the GCS bucket in the file "backend.example"
    2. Enter the name of the GCS folder in the file "backend.example"
    3.  Rename "backend.example" to "backend.tf"
3. Set Required Inputs (see SETTING INPUTS) 
4. Apply Terraform Configuration
    1 Run "Terraform init" in this directory to initialize Terraform
    2 Run "Terraform plan" in this directory to ensure input has been correctly set
    3 Run "Terraform apply" to deploy the tool.  Enter "yes" when prompted for Terraform to deploy. 

More information on running Terraform can be found at https://cloud.google.com/community/tutorials/getting-started-on-gcp-with-terraform

### SETTING INPUTS
Terraform inputs can be set either by passing variables interactively through the Terraform CLI, using a Terraform variable file (named "terraform.tfvars"), or by setting environment variables.  

#### Terraform.tfvars
To use a tfvars file, create a file in this directory called "terraform.tfvars".  Follow the  example to populate this file appropriately.  Replace "XYZ" with values based on the REQUIRED INPUTS

> \# EXAMPLE terraform.tfvars               <br>
> project_id            = "XYZ"             <br>
> name                  = "XYZ"             <br>
> region                = "XYZ"             <br>
> zone                  = "XYZ"             <br>
> network               = "XYZ"             <br>
> subnet                = "XYZ"             <br>
> subnetwork_project    = "XYZ"             <br>
> static_ip_address     = "XYZ"             <br>
> service_account_email = "XYZ"             <br>

#### Environment variables
To use environment variables, create a script to set these variable.  Instantiate the values using "source <filename>".  Follow the xample to populate the file appropriately.  Replace "XYZ" with values based on the REQUIRED INPUTS

> \# EXAMPLE config.sh
> export TF_VAR_project_ID=XYZ             <br>
> ...                                       <br>
