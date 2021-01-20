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
//const SimpleSplitter = require("split");
const SentenceSplitter = require ("sentence-splitter");

module.exports = class AnnotatedWordLabelDocument {
  constructor(options) {
    this.gcs = new CloudStorage(options);   
  }
  

/* JSONL automl  should look likee this
the document in this class is an array of these things.
[
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
]
*/

  // takes an annotated document (json automl format) and stores in the bucket as jsonl
  async save(filename,documents)
  {

     // do some basic checks
    if (typeof filename == "undefined" || typeof filename != "string" || filename =="")
    {
      throw new Error("Invalid Filename")
    }

    var jsonlFilename = `annotations/word-labels/${filename}.jsonl`;

    console.log(`in annotated-word-label-document:save(${jsonlFilename},...) `)
    console.log(documents)   
    var docToSave = []
    var found = false
    for(var i =0 ; i < documents.length;i++) {
      var document = documents[i]
      if (!document.hasOwnProperty('text_snippet') ||
          !document.hasOwnProperty('annotations') ||
          !Array.isArray(document.annotations) ||
          !document.text_snippet.hasOwnProperty('content'))
          {
            throw new Error("Cannot save word labels. Document format invalid.")
          }        

      // if there are no annotations, delete the document completely, otherwise write it out.
      if (document.annotations.length > 0) { found = true }
      docToSave.push(JSON.stringify(document))
    }
    
    // if there are no annotations, delete the document completely, otherwise write it out.
    if (!found) {
      console.log(`Sending delete for ${jsonlFilename}`)
      this.gcs.delete(jsonlFilename)
      return true;
    }
    else
      return this.gcs.writeDocument(jsonlFilename,docToSave.join("\n"))
  }

// Takes a filename to a text file in the users bucket, returns a json automl annotation object
  async load(filename)
  {
    var jsonlFilename = `annotations/word-labels/${filename}.jsonl`;
    // Check if JSONL file exists
    // If it does, read from cloud storage convert from JSON to object and return
    // if it does not, load the .txt file, generate a JSON object and return    
    let data =  ""
    let jsonFileExists= await this.gcs.fileExists(jsonlFilename)
    if (!jsonFileExists){
      console.log(`${jsonlFilename} does not exist`)      
    }
    
    if (jsonFileExists) {
      console.log(`jsonlFilename:${jsonlFilename}`)
      try 
      {
        return await this.gcs.readJsonLDocument(jsonlFilename)
      } catch (err) {
        // if we have a SyntaxError reading the json, we reload from the text file.
        if (err.message.includes("SyntaxError")){
          jsonFileExists = false
        } else {
          throw(err)
        }
      }
    } 
    
    if (!jsonFileExists) {
      // read the data
      // run through the sentence splitter
      //  reformat to jsonl format
      console.log("About to read document "+ filename)
      data = await this.gcs.readDocument(filename);
      console.log(`Got document length: ${data.length}`)
      if (data.length > 9999) // we don't support documents > 10k chars
      {
          throw new Error( 'Document length greater than 10,000 characters not supported')
      }
      // stolen from the front end to make sure we have the same offset ids when we split again.
      let actualSplit = this.splitText(data)

      var jsonLines=[]
      for(var i=0;i<actualSplit.length;i++) {
        let json = {}
        json.annotations = Array(); //annotations are empty
        json.text_snippet ={content: actualSplit[i].raw}; // full text escaped
        jsonLines.push(json)
      }
      return jsonLines;
    }
  }

  // flattens nodes, fixes punctionation when splitting
  splitText(text) {
    // first split the text
    let textSplit = SentenceSplitter.split(text)
    let actualSplit = []

    // next we need to get the child nodes if any and flatten. basically we are cleaning up  a funky artifact of sentence-splitter library
    // when you use split options, things come out in sentencesSplit[i].children
    for(var i =0;i<textSplit.length;i++) {
      if (textSplit[i].children) {
        actualSplit.push(...textSplit[i].children)
      } else {
        actualSplit.push(textSplit[i])
      }
    }

    // Now we have these wierd punctuation nodes seperate from our sentance.
    // if punctuation is not the first token in the document, 
    // then append the punctuation to the previous token, and update the offsets.
    // this has the effect of creating a overlapping token so we will need to ignore 
    // the punctionation token later on in RenderSentence::render()
    for(var i =0 ; i<actualSplit.length ; i++) {
      
      var sentence = actualSplit[i];

      if (sentence.type == "Punctuation" && i>0) {
        actualSplit[i-1].range[1]=sentence.range[1]
        actualSplit[i-1].value+= sentence.value
        actualSplit[i-1].raw+= sentence.raw
      }
    }

    return actualSplit
  }
}
