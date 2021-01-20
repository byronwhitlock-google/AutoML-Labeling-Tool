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

/* JSONL automl doc  should look likee this
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
  } */

  // flattens nodes, fixes punctionation when splitting
  async splitText(text,options) {
    // first split the text
    let textSplit = split(text, options)
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

  async parseDocument(doc) {
    if (doc.hasOwnProperty('text_snippet') && 
    doc.text_snippet.hasOwnProperty('content'))
    {
        var splitOptions = {
        SeparatorParser: {
        // separatorCharacters: ['\n','.','?','!']
        }
      }
      console.log("*****Reparsing sentence data from file****")
    
      var actualSplit = await this.splitText(doc.text_snippet.content, splitOptions)

      // now set the split to split on words. we will split each sentence into words and attach.
      splitOptions.SeparatorParser.separatorCharacters=[' ' ,'\t','\n']
      
      for(var i =0 ; i<actualSplit.length ; i++) {                 
        var sentence = actualSplit[i];        
        if (sentence.type == "Str"){
          actualSplit[i].wordData = await this.splitText(sentence.raw, splitOptions)
        }
      }
      console.log(actualSplit)
      return actualSplit
    }
    else
      throw new Error("Schema Validation Error: "+ JSON.stringify(doc).substr(0,500)+" ... ");
  }
  //changes from automl format to sentence split format we like for display
  /*[100]: {type: "WhiteSpace", raw: " ", value: " ", loc: {…}, range: Array(2)}
    [101]: loc: {start: {…}, end: {…}}
    range: Array(2)
    0: 328
    1: 337
    length: 2
    __proto__: Array(0)
    raw: "deformity"
    type: "Str"
    value: "deformity"
    */

  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  async loadDocumentContent (documentPath) {
    const doc = await this.fetch(`/load_document?d=${documentPath}`)    
     // dumb helper function 
     function isString (obj) {
        return (Object.prototype.toString.call(obj) === '[object String]');
      }
  
      if (isString(doc))
        doc = JSON.parse(doc)
  
      var sentenceData = await this.parseDocument(doc.sentenceDoc)
      return {
        documentData: doc.sentenceDoc, // automl format
        wordLabelDocumentData: doc.wordLabelDoc, // automl format, line by line for word labels
        sentenceData:  sentenceData // sentence splitter format for rendering internally
      }
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

  async saveWordLabelDocumentContent(documentPath,doc) {
    // save each json one line at a time.

    // simple type checking, 
    // TODO: json schema validation
    if (doc[0].hasOwnProperty('annotations') && 
        doc[0].hasOwnProperty('text_snippet') && 
        doc[0].text_snippet.hasOwnProperty('content'))
    {
       return this.post(`/save_word_label_document?d=${documentPath}`, doc)
    }
    else
    {

      throw new Error("Invalid Document.")
    }
  }
}
export default DocumentApi

/* setence splitter format
{
  "type": "Paragraph",
  "children": [
      {
          "type": "Sentence",
          "raw": "There it is!",
          "value": "There it is!",
          "loc": {
              "start": {
                  "line": 1,
                  "column": 0
              },
              "end": {
                  "line": 1,
                  "column": 12
              }
          },
          "range": [
              0,
              12
          ],
          "children": [
              {
                  "type": "Str",
                  "raw": "There it is",
                  "value": "There it is",
                  "loc": {
                      "start": {
                          "line": 1,
                          "column": 0
                      },
                      "end": {
                          "line": 1,
                          "column": 11
                      }
                  },
                  "range": [
                      0,
                      11
                  ]
              },
              {
                  "type": "Punctuation",
                  "raw": "!",
                  "value": "!",
                  "loc": {
                      "start": {
                          "line": 1,
                          "column": 11
                      },
                      "end": {
                          "line": 1,
                          "column": 12
                      }
                  },
                  "range": [
                      11,
                      12
                  ]
              }
          ]
      },
      {
          "type": "WhiteSpace",
          "raw": " ",
          "value": " ",
          "loc": {
              "start": {
                  "line": 1,
                  "column": 12
              },
              "end": {
                  "line": 1,
                  "column": 13
              }
          },
          "range": [
              12,
              13
          ]
      },
      {
          "type": "Sentence",
          "raw": "I found it.\nHello World.",
          "value": "I found it.\nHello World.",
          "loc": {
              "start": {
                  "line": 1,
                  "column": 13
              },
              "end": {
                  "line": 2,
                  "column": 12
              }
          },
          "range": [
              13,
              37
          ],
          "children": [
              {
                  "type": "Str",
                  "raw": "I found it.",
                  "value": "I found it.",
                  "loc": {
                      "start": {
                          "line": 1,
                          "column": 13
                      },
                      "end": {
                          "line": 1,
                          "column": 24
                      }
                  },
                  "range": [
                      13,
                      24
                  ]
              },
              {
                  "type": "WhiteSpace",
                  "raw": "\n",
                  "value": "\n",
                  "loc": {
                      "start": {
                          "line": 1,
                          "column": 24
                      },
                      "end": {
                          "line": 2,
                          "column": 0
                      }
                  },
                  "range": [
                      24,
                      25
                  ]
              },
              {
                  "type": "Str",
                  "raw": "Hello World",
                  "value": "Hello World",
                  "loc": {
                      "start": {
                          "line": 2,
                          "column": 0
                      },
                      "end": {
                          "line": 2,
                          "column": 11
                      }
                  },
                  "range": [
                      25,
                      36
                  ]
              },
              {
                  "type": "Punctuation",
                  "raw": ".",
                  "value": ".",
                  "loc": {
                      "start": {
                          "line": 2,
                          "column": 11
                      },
                      "end": {
                          "line": 2,
                          "column": 12
                      }
                  },
                  "range": [
                      36,
                      37
                  ]
              }
          ]
      },
      {
          "type": "WhiteSpace",
          "raw": " ",
          "value": " ",
          "loc": {
              "start": {
                  "line": 2,
                  "column": 12
              },
              "end": {
                  "line": 2,
                  "column": 13
              }
          },
          "range": [
              37,
              38
          ]
      },
      {
          "type": "Sentence",
          "raw": "My name is Jonas.",
          "value": "My name is Jonas.",
          "loc": {
              "start": {
                  "line": 2,
                  "column": 13
              },
              "end": {
                  "line": 2,
                  "column": 30
              }
          },
          "range": [
              38,
              55
          ],
          "children": [
              {
                  "type": "Str",
                  "raw": "My name is Jonas",
                  "value": "My name is Jonas",
                  "loc": {
                      "start": {
                          "line": 2,
                          "column": 13
                      },
                      "end": {
                          "line": 2,
                          "column": 29
                      }
                  },
                  "range": [
                      38,
                      54
                  ]
              },
              {
                  "type": "Punctuation",
                  "raw": ".",
                  "value": ".",
                  "loc": {
                      "start": {
                          "line": 2,
                          "column": 29
                      },
                      "end": {
                          "line": 2,
                          "column": 30
                      }
                  },
                  "range": [
                      54,
                      55
                  ]
              }
          ]
      }
  ],
  "loc": {
      "start": {
          "line": 1,
          "column": 0
      },
      "end": {
          "line": 2,
          "column": 30
      }
  },
  "range": [
      0,
      55
  ],
  "raw": "There it is! I found it.\nHello World. My name is Jonas."
}
*/