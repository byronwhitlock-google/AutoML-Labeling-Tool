## Requirements

| Name | Version |
|------|---------|
| google | ~> 3.30 |
| google-beta | ~> 3.30 |
| random | ~> 2.2 |

## Providers

| Name | Version |
|------|---------|
| google | ~> 3.30 |
| random | ~> 2.2 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| activate\_apis | The list of apis to activate within the project | `list(string)` | n/a | yes |
| auto\_create\_network | Create the default network | `bool` | `false` | no |
| billing\_account | The ID of the billing account to associate this project with | `string` | n/a | yes |
| disable\_dependent\_services | Whether services that are enabled and which depend on this service should also be disabled when this service is destroyed. https://www.terraform.io/docs/providers/google/r/google_project_service.html#disable_dependent_services | `string` | `"true"` | no |
| disable\_services\_on\_destroy | Whether project services will be disabled when the resources are destroyed. https://www.terraform.io/docs/providers/google/r/google_project_service.html#disable_on_destroy | `string` | `"true"` | no |
| enable\_apis | Whether to actually enable the APIs. If false, this module is a no-op. | `string` | `"false"` | no |
| folder\_id | The ID of a folder to host this project | `string` | `""` | no |
| group\_emails | The email address of a group to control the project by being assigned group\_role. | `list(string)` | `[]` | no |
| labels | Map of labels for project | `map(string)` | `{}` | no |
| member\_attributes | The role & group (project binding) to give the controlling group (group\_name) over the project. | <pre>map(object({<br>    roles = list(string)<br>  }))</pre> | n/a | yes |
| name | The visual name for the project | `string` | n/a | yes |
| org\_id | The organization ID. | `string` | n/a | yes |
| project\_id | The ID to give the project. If not provided, the `name` will be used. | `string` | `""` | no |
| random\_project\_id | Adds a suffix of 4 random characters to the `project_id` | `bool` | `false` | no |
| sa\_roles | A role to give the default Service Account for the project (defaults to none) | `list(string)` | `[]` | no |

## Outputs

| Name | Description |
|------|-------------|
| project\_id | The project ID |
| project\_number | The project Number |
| service\_account\_email | The email of the default service account |
| service\_account\_name | The email of the default service account |

