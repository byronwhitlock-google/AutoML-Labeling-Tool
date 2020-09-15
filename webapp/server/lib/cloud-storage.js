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
//https://cloud.google.com/storage/docs/json_api/v1/objects/get
"use strict";
const Dumper = require('dumper').dumper;
const GoogleCloud = require('./google-cloud.js')

//https://googleapis.dev/nodejs/storage/latest/index.html

module.exports = class CloudStorage extends GoogleCloud {
  constructor(options) {
    options.hostName = 'storage.googleapis.com'
    super(options)
    this.projectId = options.projectId
    this.bucketName = options.bucketName
  }

  async readJsonDocument(documentName,metadataOnly=false) {
    var res = await this.readDocument(documentName,metadataOnly) 
    var json = {}
    try {
      json = JSON.parse(res);
    } 
    catch (e) 
    {
      throw new Error(e)
    }
    
    //console.log(res);
    if (json.hasOwnProperty('error'))
      throw new Error(json.error.message)
    
    return json;
  }
  // read from cloud storage syncronously.
  async readDocument(documentName,metadataOnly=false)  {

    //https://cloud.google.com/storage/docs/json_api/v1/objects/get

    // serously cant do ouath flow usign the standard lib? wtf? annoying as heck.
    var path = `/storage/v1/b/${this.bucketName}/o/${documentName}`

    if (metadataOnly)
      path += "?alt=json"
    else
      path += "?alt=media"

    var res = await this.httpGet(path);
    /// since we didn't check the http return code look at the text to see if we got not found
    // AND since we aren't looking at json for errors do this funky monkey
    if (res.startsWith("No such object: ") || res.startsWith("Not Found"))
    {
      throw new Error(res)
      return "";
    }

    //Dumper(res)
    return res;

  }
//https://cloud.google.com/storage/docs/json_api/v1/objects/insert
  async writeDocument(documentName, contents) {
    var path = `/upload/storage/v1/b/${this.bucketName}/o?uploadType=media&name=${documentName}`
    var res = await this.httpPost(path,contents);
    var json = ""
    try {
      json = JSON.parse(res);
    } 
    catch (e) 
    {
      throw new Error(res)
    }
    
    //console.log(res);
    if (json.hasOwnProperty('error'))
      throw new Error(json.error.message)
    
    return json;
  }
  
  // read from cloud storage syncronously.
  async listDocuments(suffix=".txt")   {

    //https://cloud.google.com/storage/docs/json_api/v1/objects/get
    //TODO: Fetch next page tokens. rightn now buggy doesn't work. only fetches 1000 items maxs
    // we would ues the standard libaray that handles this but it doesn't support oauth 
    var path = `/storage/v1/b/${this.bucketName}/o/`
    var documentList = []
    var maxItems = 2000;
    try {
      //do
      {
        console.log("About to list documents")
        var res = await this.httpGet(path);
        var json = JSON.parse(res);
        if (json.hasOwnProperty('error'))
          throw new Error(json.error.message)
    
        for(var i=0;i<json.items.length;i++)
        {
          if (json.items[i].name.endsWith(suffix))
          {
            documentList.push(json.items[i].name)
          }
        }
      }
      //while (json.nextPageToken != "" || documentList.length < maxItems)
    } 
    catch (e) 
    {
      throw new Error(e.message)
    }
    Dumper(documentList)
    return documentList;
  }

}