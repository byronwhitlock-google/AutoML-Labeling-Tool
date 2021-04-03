
#!/bin/sh
#
#  Copyright 20210 Google LLC
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

#
gcloud auth login
gcloud config set project lucky-era-233023

#docker build . -t automl-labeling-tool
#docker tag automl-labeling-tool gcr.io/lucky-era-233023/automl-labeling-tool
#docker push gcr.io/lucky-era-233023/automl-labeling-tool
gcloud builds submit -t gcr.io/lucky-era-233023/automl-labeling-tool .
gcloud run deploy automl-labeling-tool --image gcr.io/lucky-era-233023/automl-labeling-tool --allow-unauthenticated --platform managed --region us-central1

#container_image_path   = "gcr.io/lucky-era-233023/automl-labeling-tool"