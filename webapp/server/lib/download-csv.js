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
"use strict";
const Dumper = require('dumper').dumper;
const CloudStorage = require('lib/cloud-storage.js');

module.exports = class DownloadCsv {
  constructor(options) {
    this.gcs = new CloudStorage(options);   
    console.log(options)
  }

  async download()
  {
    var csv = []
    
    var docs = await this.gcs.listDocuments(".jsonl");

    for (var i = 0;i<docs.length;i++)
    {
      csv.push(`,gs://${this.gcs.bucketName}/${docs[i]}`);
    }

    if (!csv.length > 0)
    {
      throw new error("No Labeled Documents Found")
    }
    return csv.join("\n")
  }

  async persist(name)
  {
    var csvData = await this.download()
    var numRecords = csvData.split(/\r\n|\r|\n/).length
    
    console.log("About to persist csv data")
    console.log(csvData)
    this.gcs.writeDocument(name,csvData)
        
    return numRecords
  }
  
}
