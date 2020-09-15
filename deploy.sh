
#!/bin/sh
#gcloud auth login
gcloud config set project lucky-era-233023

#docker build . -t automl-labeling-tool
#docker tag automl-labeling-tool gcr.io/lucky-era-233023/automl-labeling-tool
#docker push gcr.io/lucky-era-233023/automl-labeling-tool
gcloud builds submit -t gcr.io/lucky-era-233023/automl-labeling-tool .
gcloud run deploy automl-labeling-tool --image gcr.io/lucky-era-233023/automl-labeling-tool --allow-unauthenticated --platform managed --region us-central1
