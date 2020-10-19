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

require('app-module-path').addPath(__dirname);
const Dumper = require('dumper').dumper;
const CloudStorage = require('./lib/cloud-storage.js')

const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

const AutoML = require('lib/automl.js');
const DownloadCsv = require('lib/download-csv');
const AnnotatedDocument = require('lib/annotated-document.js');
const BodyParser = require('body-parser');

app.use(BodyParser.json());

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/list_documents', async (req, res) => {
    try {        

        var options ={
            accessToken: req.header("X-Bearer-Token"),
            projectId: req.header("X-Project-Id"),
            bucketName: req.header("X-Bucket-Name"),
        }
        //console.log("trying to list docs")
        //console.log(options)

        var gcs = new CloudStorage(options);    

        var data = await gcs.listDocuments();
        res.send({'data': data});
    } catch (e) {
        Dumper(e)
        console.error(e.message)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/load_document', async (req, res) => {    
    try {
        var doc = new AnnotatedDocument({
            accessToken: req.header("X-Bearer-Token"),
            projectId: req.header("X-Project-Id"),
            bucketName: req.header("X-Bucket-Name"),
        });    

        var data = await doc.load(req.query.d);
        console.log("We got some data from load_document len:"+ data.length)
        res.send({'data': data});
    } catch (e) {
          Dumper(e)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.post('/save_document',async(req,res) =>{
    //Dumper(req.body)
    try {
        var doc = new AnnotatedDocument({
            accessToken: req.header("X-Bearer-Token"),
            projectId: req.header("X-Project-Id"),
            bucketName: req.header("X-Bucket-Name"),
        });    
        
        // TODO: validate json against schema        
        var data = await doc.save(req.query.d,req.body);
        //console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
          Dumper(e)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/generate_csv', async (req, res) => {    
    try {
        const bucketName = req.header("X-Bucket-Name") 
        var csv = new DownloadCsv({
            accessToken: req.header("X-Bearer-Token"),
            projectId: req.header("X-Project-Id"),
            bucketName: bucketName,
        });   
        
        // persist downloads and saves to bucket
        var numRecords = await csv.persist("training.csv");        
        var data = {'data': {"path": `${bucketName}/training.csv`, "numRecords":numRecords}}
        console.log (data)
        res.send(data)
        
    } catch (e) {
        Dumper(e)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/list_datasets', async (req, res) => {
    try {        

        var options ={
            accessToken: req.header("X-Bearer-Token"),
            projectId: req.header("X-Project-Id"),
            locationId:req.header("X-Location-Id"),
        }
        console.log("trying to list datasets")
        console.log(options)

        var automl = new AutoML(options);
        var data = await automl.listDatasets();
        res.send({'data': data});
    } catch (e) {
        Dumper(e)
        console.error(e.message)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

// production endpoint served from here
app.use(express.static(path.join(__dirname, '../browser/build')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../browser/build', 'index.html'));
});


