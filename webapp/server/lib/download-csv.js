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
    this.options=options
    console.log(options)
  }

  async download()
  {
    var csv = []

    var docs = await this.gcs.listDocuments(".jsonl","annotations/");

    for (var i = 0;i<docs.length;i++)
    {
      csv.push(`,gs://${this.gcs.bucketName}/annotations/${docs[i]}`);
    }

    if (!csv.length > 0)
    {
      throw new error("No Labeled Documents Found")
    }
    return csv.join("\n")
  }

  async downloadWordLabels()
  {
    var csvMap = []

    var docs = await this.gcs.listDocuments(".jsonl","annotations/word-labels/");
    var found =false
    for (var i = 0;i<docs.length;i++)
    {
      var docName = docs[i]
      let [junk, label] = docName.split(/--/ig)
      if (label)
      {
        var cleanLabel = label.replace(/\.jsonl$/,"")
        found=true
        if (!csvMap[cleanLabel]) {
          csvMap[cleanLabel] = []
        }
        csvMap[cleanLabel].push(`,gs://${this.gcs.bucketName}/annotations/word-labels/${docName}`);
      }
    }

    if (!found)
    {
      console.log("****No WORD Labeled Documents Found****")
    } else {
      console.log("Got some word label docs")
      console.log(csvMap)
    }
    return csvMap;// .join("\n")
  }
  
  async persist(name)
  {
    var numRecords = 0
    var toReturn   =[]
    
    var csvData = await this.download()    
    numRecords = csvData.split(/\r\n|\r|\n/).length

    console.log("About to persist main csv data")
    console.log(csvData)
    toReturn.push({"label":name, "path": `${this.options.bucketName}/${name}`, "numRecords":numRecords})
    
    this.gcs.writeDocument(name,csvData)
    
    var wordLabelCsvData = await this.downloadWordLabels()
    for(var label in wordLabelCsvData)
    {      
      console.log(`About to persist ${label}-${name} csv data`)
      console.log(wordLabelCsvData[label])
      numRecords = wordLabelCsvData[label].length
      toReturn.push({"label":label, "path": `${this.options.bucketName}/${label}-${name}`, "numRecords":numRecords})

      this.gcs.writeDocument(`${label}-${name}`,wordLabelCsvData[label].join("\n"))
    }
  
    return toReturn
  }
  
}
