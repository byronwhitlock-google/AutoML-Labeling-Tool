// Byron Whitlock byronwhitlock@google.com 
"use strict";
const UserConfig =  require('user-config.js')
const Dumper = require('dumper').dumper;

const {Storage} = require('@google-cloud/storage');
//https://googleapis.dev/nodejs/storage/latest/index.html
module.exports = class CloudStorage {
  constructor() {
    this.config = new UserConfig();
    this.storage = new Storage({projectId: this.config.projectId})
    this.bucket = this.storage.bucket(this.config.bucketName);
  }

  // List documents annotate if jsonl file exists too.
  /*function ListDocuments(){}
  function ReadDocument(documentName){}
  function WriteDocument(documentName,content){}*/

  // read from cloud storage syncronously.
  async readDocument(documentName)  {

    let buffer = "";
    // Return file contents
    return this.bucket
      .file(documentName)
      .download()
      .then (contents=> {
          //console.log("file data: "+contents);   
          return (contents.toString('utf-8'));
      })
      .catch( (err) => {
        let errorMessage = "Cannot read cloud storage object: " + err.message
        console.error(errorMessage)
        throw new Error(errorMessage)

        // TODO Return error code
        //return (errorMessage);
      });
  }

  async writeDocument(documentName, contents) {
    return this.bucket
      .file(documentName)
      .save(contents);
  }
  
  // read from cloud storage syncronously.
  async listDocuments()  {

    // Lists files in the bucket
    const [files] = await this.bucket.getFiles();

    let documentList = []
    console.log('Files:');
    files.forEach(file => {
      if (file.name.endsWith(this.config.sourceDocumentType))
        documentList.push(file.name);
    });
    return documentList
  }

  async fileExists(filename)
  {
    let file = this.bucket.file(filename);
    let res = await file.exists();
    return res[0];
  }
}