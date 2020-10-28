
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
const GoogleCloud = require('./google-cloud-REST.js')
const CloudStorage = require('lib/cloud-storage.js');

//required options: accessToken, projectId, locationId
module.exports = class AutoML extends GoogleCloud {
  constructor(options) {
    options.hostName = 'automl.googleapis.com'
    super(options)
    this.projectId = options.projectId
    this.locationId = options.locationId //'us-central1'

    if (!options.projectId || !options.locationId)
      throw new Error("Cannot Construct AutoML. Missing Project or Location")
    
    this.gcs = new CloudStorage(options);   
  }


  // read from cloud storage syncronously.
  async listDatasets()  {

    //https://cloud.google.com/automl/docs/reference/rest/v1/projects.locations.datasets/list

    var path = `/v1/projects/${this.projectId}/locations/${this.locationId}/datasets`

    var res = await this.httpGet(path) ;
    var json = ""
    try {
      json = JSON.parse(res);
    } 
    catch (e) //catch the json parse error so we can return somthing meaningfull on non 200s
    {
      throw new Error(res)
    }
    
    //console.log(res);
    if (json.hasOwnProperty('error'))
      throw new Error(json.error.message)
    
    return json;

  }

  async listModels()  {

    //https://cloud.google.com/automl/docs/reference/rest/v1/projects.locations.models/list

    var path = `/v1/projects/${this.projectId}/locations/${this.locationId}/models`

    var res = await this.httpGet(path) ;
    var json = ""
    try {
      json = JSON.parse(res);
    } 
    catch (e) //catch the json parse error so we can return somthing meaningfull on non 200s
    {
      throw new Error(res)
    }
    
    //console.log(res);
    if (json.hasOwnProperty('error'))
      throw new Error(json.error.message)
    
    return json;

  }

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

    let jsonFileExists=false;
    let predictionData = {}
    try {
      console.log("About to read document "+ predictionFileName)
      predictionData = await this.gcs.readJsonDocument(predictionFileName)   
      
    } catch (e) {
      predictionData = await this.downloadPrediction(params)
    }
    return predictionData
  }


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
    
    // POST https://automl.googleapis.com/v1/{name}:predict
    var path = `https://automl.googleapis.com/v1/${modelId}:predict`
    var postData = {
      payload: {
       textSnippet: {
          content: documentContent,
          mimeType: 'text/plain'
        }
      },
      params: {}
    };
    console.log(`about to HTTP Post ${path}`)
    Dumper(postData)
    
    var res = await this.httpPost(path,postData) ;
    var json = ""
    try {
      json = JSON.parse(res);
      
    
      // now save in the predictions folder
      this.gcs.writeDocument(predictionFileName,json.payload);
      return json.payload;

    } 
    catch (e) //catch the json parse error so we can return somthing meaningfull on non 200s
    {
      throw new Error(res);
    }
    
    //console.log(res);
    if (json.hasOwnProperty('error'))
      throw new Error(json.error.message)

  }


}