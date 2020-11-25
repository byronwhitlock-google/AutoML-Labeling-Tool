
/*
# Copyright 2020 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#            http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
//parent is: projects/PROJECT_ID/locations/LOCATION_ID
// https://cloud.google.com/automl/docs/reference/rest/v1/projects.locations.datasets/list


"use strict";
const Dumper = require('dumper').dumper;
const {AutoMlClient,PredictionServiceClient} = require('@google-cloud/automl').v1;
const CloudStorage = require('lib/cloud-storage.js');

//required options: accessToken, projectId, locationId
module.exports = class AutoML {
  /**
   * @param {{ projectId: any; locationId: any; }} options
   */
  constructor(options) {

    this.projectId = options.projectId
    this.locationId = options.locationId //'us-central1'

    if (!options.projectId || !options.locationId)
      throw new Error("Cannot Construct AutoML. Missing Project or Location")
    
    this.gcs = new CloudStorage(options);   
    this.client = new AutoMlClient();
    
    // Instantiates a client
    this.predictionClient = new PredictionServiceClient();
  }


  async listModels()  {

    //https://cloud.google.com/automl/docs/reference/rest/v1/projects.locations.models/list\
    const request = {
      parent: this.client.locationPath(this.projectId, this.locationId),
    }
    let [models] = await this.client.listModels(request);
    return models
  }

  /**
   * @param {{ documentName: any; modelId: any; }} params
   */
  async getPrediction(params)  {
    var documentName = params.documentName;
    var modelId = params.modelId ;
    
    if (! modelId) {
      throw new Error('Missing Model Id');
    }
    if (!documentName) {
       throw new Error('Missing Document Name');
    }
    var predictionFileName = `predictions/${modelId}/${documentName}.json`;
    let jsonFileExists= await this.gcs.fileExists(predictionFileName);
    let predictionData = []
    console.log("About to read document "+ predictionFileName)
    if (jsonFileExists){
      console.log("FIle exists, trying to read.")
      predictionData = await this.gcs.readJsonDocument(predictionFileName)   
    } else {
      predictionData = await this.downloadPrediction(params)
    }
    
    return predictionData
  }


  /**
   * @param {{ documentName: any; modelId: any; }} params
   */
  async downloadPrediction(params)  {

    var documentName = params.documentName;
    var modelId = params.modelId ;
    
    if (! modelId) {
      throw new Error('Missing Model Id');
    }
    if (!documentName) {
       throw new Error('Missing Document Name');
    }
    var predictionFileName = `predictions/${modelId}/${documentName}.json`;
    
    // first download the content
    var documentContent = await this.gcs.readDocument(documentName);
    var path  = modelId//this.client.modelPath(this.projectId, this.locationId, modelId)

    const request = {
      name: modelId,
      payload: {
        textSnippet: {
          content: documentContent,
          mimeType: 'text/plain', // Types: 'test/plain', 'text/html'
        },
      },
    };

    console.log(`about to Predict Post ${path}`)
    Dumper(request)
    const [response] = await this.predictionClient.predict(request);

    console.log("Got prediction response")
    let payload = JSON.stringify(response.payload)
    Dumper(payload)

    // now save in the predictions folder
    this.gcs.writeDocument(predictionFileName,payload);
    return response.payload

  }
}