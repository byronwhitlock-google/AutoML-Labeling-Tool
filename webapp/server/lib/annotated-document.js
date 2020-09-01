// Byron Whitlock byronwhitlock@google.com 
"use strict";
const UserConfig =  require('user-config.js')
const Dumper = require('dumper').dumper;
const CloudStorage = require('lib/cloud-storage.js');
const SimpleSplitter = require("split");

module.exports = class AnnotatedDocument {
  constructor() {
    this.config = new UserConfig();
    this.gcs = new CloudStorage();   
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
    
    let jsonFileExists = await this.gcs.fileExists(jsonlFilename)    
    
    if (jsonFileExists){      
      console.error("About to read document "+ jsonlFilename)
      let data = await this.gcs.readDocument(jsonlFilename);
      return JSON.parse(data);
      /* This is not needed. json files will only contain a single record, no need to stream it in!
      // jsonl files have to be parsed line by line.
      // https://www.npmjs.com/package/split#ndj---newline-delimited-json
      let fs = this.gcs.bucket.file(jsonlFilename);
      fs.createReadStream()
        .pipe(SimpleSplitter(JSON.parse))
        .on('data', function (obj) {
          //each chunk now is a a js object
          jsonlArray.push(obj)
        })
        .on('error', function (err) {
          //syntax errors will land here
          //note, this ends the stream.
          throw new Error(err);
        })*/
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
