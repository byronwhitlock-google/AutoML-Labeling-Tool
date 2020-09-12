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
const SimpleSplitter = require("split");

module.exports = class AnnotatedDocument {
  constructor(options) {
    this.gcs = new CloudStorage(options);   
  }
  

/* JSONL automl  should look likee this
{
  "annotations": [
     {
      "text_extraction": {
         "text_segment": {
            "end_offset": number, "start_offset": number
          }
       },
       "display_name": string
     },
     {
       "text_extraction": {
          "text_segment": {
             "end_offset": number, "start_offset": number
           }
        },
        "display_name": string
     },
   ...
  ],
  "text_snippet":
    {"content": string}
}
*/

  // takes an annotated document (json automl format) and stores in the bucket as jsonl
  async save(filename,document)
  {
    // make sure the filename ends in .jsonl
    // we ONLY save jsonl files.
    if (filename.indexOf(".jsonl") == -1)
      filename = `${filename}.jsonl`

    console.log(`in annotated-document:save(${filename},${document}) `)
    console.log(document)
    // do some basic checks
    if (typeof filename == "undefined" || typeof filename != "string" || filename =="")
    {
      throw new Error("Invalid Filename")
    }
    if (!document.hasOwnProperty('text_snippet') ||
        !document.hasOwnProperty('annotations') ||
        !Array.isArray(document.annotations) ||
        !document.text_snippet.hasOwnProperty('content'))
        {
          throw new Error("Cannot save, document format invalid.")
        }
    return this.gcs.writeDocument(filename,JSON.stringify(document))
  }

// Takes a filename to a text file in the users bucket, returns a json automl annotation object
  async load(filename)
  {
    var jsonlFilename = filename+".jsonl";
    // Check if JSONL file exists
    // If it does, read from cloud storage convert from JSON to object and return
    // if it does not, load the .txt file, generate a JSON object and return
    
    let data =  ""
    let jsonFileExists=true;
    try {
      console.error("About to read document "+ jsonlFilename)
      data = await this.gcs.readDocument(jsonlFilename)    
    } catch (e)
    {
      if (e.message == "not found") {
         jsonFileExists=false;;
      } else {
        throw new Error(e.message)
      }
    }
    
    if (jsonFileExists){      
      //return JSON.parse(data);
      return data;
      
    } else {
      // read the data
      // run through the sentence splitter
      //  reformat to jsonl format
      console.error("About to read document "+ filename)
      let data = await this.gcs.readDocument(filename);
      if (data.length > 9999) // we don't support documents > 10k chars
      {
          throw new Error( 'Document length greater than 10,000 characters not supported')
      }
      
      let jsonl = {}
      jsonl.annotations = Array(); //annotations are empty
      jsonl.text_snippet ={content: data}; // full text escaped
      return jsonl;
    }
  }
}
