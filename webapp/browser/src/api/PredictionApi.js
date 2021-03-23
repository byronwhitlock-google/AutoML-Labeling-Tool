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

import BaseApi from './BaseApi.js'
var MemoryCache = require('memory-cache');

class PredictionApi extends BaseApi {
  constructor(accessToken){
    super(accessToken)
  }


  async loadAutoMLModelList () {
    return this.fetch("/list_models")
  }

  async requestAutoMLPrediction(modelId, documentName) {
    return this.post("/get_prediction",{documentName:documentName, modelId:modelId})
  }
/**
 * @param {[{text:string;startOffset:integer;endOffset:integer}]} words
 * @param {string} modelName
 **/
  async requestWordLabelModePredictions(words,modelName) {
    var modelId = await this.getModelIdCached(modelName)
    
    var documentContent = []
    for(var i =0;i<words.length;i++) {
      documentContent.push(words[i].text) 
    }

    // get the modelID for each sentence
    return await this.post("/get_word_label_prediction", {modelId:modelId,documentContent:documentContent.join(" ")})
  }

    /**
   * @summary Caching only doesnt work across construction
   * @param {string} modelName 
   * @returns Fully Qualified Model ID string
   */
  async getModelIdCached(modelName) {

    let modelId =  MemoryCache.get(`modelName:${modelName}`); 
    if (! modelId) {
      let models =  MemoryCache.get(`listModels`);

      if (!models || models.length ==0) {
        models = await this.loadAutoMLModelList()
        if (models) {
          MemoryCache.put(`listModels`, models); 
        }
      }

      for (var i=0;i<models.length;i++) {
        var model = models[i]
        if (model.displayName == modelName) {
          MemoryCache.put(`modelName:${modelName}`, model.name); 
          modelId = model.name
          break;
        }
      }
    }
    return  modelId
  }
}
export default PredictionApi