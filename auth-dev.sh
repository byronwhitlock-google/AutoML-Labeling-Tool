#!/bin/bash

#authenticates the dev enviornment

gcloud auth login
project=`gcloud config get-value project`

gcloud auth application-default set-quota-project $project
gcloud auth login application-default 