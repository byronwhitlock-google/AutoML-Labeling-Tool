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
import {split, Syntax} from "sentence-splitter";

class DocumentApi extends BaseApi {
  constructor(accessToken){
    super(accessToken)
  }
  //changes from automl format to sentence split format we like for display
  async parseDocument(doc)
  {
    // dumb helper function 
    function isString (obj) {
      return (Object.prototype.toString.call(obj) === '[object String]');
    }

    if (isString(doc))
      doc = JSON.parse(doc)
    
    if (doc.hasOwnProperty('text_snippet') && 
        doc.text_snippet.hasOwnProperty('content'))
    {
      console.log("*****Reparsing data from file****")
      let sentencesSplit = split(doc.text_snippet.content)
      console.log(sentencesSplit)

     return {
        documentData: doc,
        sentenceData: sentencesSplit 
      }
    }
    else
      throw new Error("Schema Validation Error: "+ JSON.stringify(doc).substr(0,500)+" ... ");
  }

  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  async loadDocumentContent (documentPath) {
    const doc = await this.fetch(`/load_document?d=${documentPath}`)    
    return this.parseDocument(doc);
  }
  
  async saveDocumentContent(documentPath,doc) {
    // simple type checking, 
    // TODO: json schema validation
    if (doc.hasOwnProperty('annotations') && 
        doc.hasOwnProperty('text_snippet') && 
        doc.text_snippet.hasOwnProperty('content'))
    {
      return this.post(`/save_document?d=${documentPath}`, doc)
    }
    else
    {

      throw new Error("Invalid Document.")
    }
  }

}
export default DocumentApi