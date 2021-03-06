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
const AnnotatedWordLabelDocument = require('lib/annotated-word-label-document.js');
const AppConfig = require('lib/app-config.js');
const BodyParser = require('body-parser');
const axios = require('axios');

app.use(BodyParser.json());

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

async function get_header_options(req) {
    
  // Dumper(json)
    let options =  {
        //accessToken: req.header("X-Bearer-Token"),
        projectId: req.header("X-Project-Id"),
        locationId:req.header("X-Location-Id"),
        bucketName: req.header("X-Bucket-Name") ,
    };
    Dumper(options)
    return options
}
app.get('/list_documents', async (req, res) => {
    try {
        var options = await get_header_options(req)
        //console.log("trying to list docs")
        //console.log(options)

        var gcs = new CloudStorage(options);    

        var docs = await gcs.listDocuments();
        var labels = await gcs.listDocuments(".jsonl","annotations/");
        var data = []
        Dumper(labels)
        
        // merge labels and text so we know what is labeled
        for(var i=0 ; i<docs.length ; i++) {
            var found = labels.indexOf(`${docs[i]}.jsonl`) >=0 ? 1:0;
            data.push({name:docs[i], labeled:found })
        }
        Dumper(data)
        res.send({'data': data});
    } catch (e) {
     //   Dumper(e)
        console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/load_document', async (req, res) => {    
    try {
        var options = await  get_header_options(req);
        var doc = new AnnotatedDocument(options);    
        var sentenceDocData = doc.load(req.query.d);

        var options = await  get_header_options(req);
        var wordLabelDoc = new AnnotatedWordLabelDocument(options);    
        var wordLabelDocData =  wordLabelDoc.load(req.query.d);
        
        console.log("We got some data from AnnotatedDocument::load len:"+ sentenceDocData.length)
        console.log("We got some data from AnnotatedWordLabelDocument::load len:"+ wordLabelDocData.length)
        res.send(   
            {'data': {
                'sentenceDoc' : await sentenceDocData, 
                'wordLabelDoc': await wordLabelDocData
            }});

    } catch (e) {
        //  Dumper(e)
        console.error(`${e.message} ${e.stack}`)
          res.send({'error': e.message, 'trace':e.stack });
    }
});


app.post('/save_document',async(req,res) =>{
    //Dumper(req.body)
    try {
        var options = await  get_header_options(req);
        var doc = new AnnotatedDocument(options);      
        
        // TODO: validate json against schema        
        var data = await doc.save(req.query.d,req.body);
        //console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
       //   Dumper(e)
       console.error(`${e.message} ${e.stack}`)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.post('/save_word_label_document',async(req,res) =>{
    //Dumper(req.body)
    try {
        var options = await  get_header_options(req);
        var doc = new AnnotatedWordLabelDocument(options);      
        
        // TODO: validate json against schema        
        var data = await doc.save(req.query.d,req.body);
        //console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
       //   Dumper(e)
       console.error(`${e.message} ${e.stack}`)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/generate_csv', async (req, res) => {    
    try {
        var options = await  get_header_options(req);
        var csv = new DownloadCsv(options);   

        // persist downloads and saves to bucket
        var results = await csv.persist("training.csv");        
        var data = {'data': results}
        console.log (data);
        res.send(data);
        
    } catch (e) {
     //   Dumper(e);
     console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/list_models', async (req, res) => {
    try {        

        var options = await  get_header_options(req);
        console.log("trying to list models");
        console.log(options);

        var automl = new AutoML(options);
        var data = await automl.listModels();
        console.log("Got some data from listModels ");
        Dumper(data);
        res.send({'data': data});
    } catch (e) {
    //    Dumper(e);
    console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});


app.post('/get_prediction', async (req, res) => {
    try {        
   
        var options = await  get_header_options(req);
        console.log("trying to get_prediction");
        console.log(req.body);

        var automl = new AutoML(options);
        var data = await automl.getPrediction(req.body);
        console.log(`Got some data (${data.length}) from get_prediction `);
        res.send({'data': data});
    } catch (e) {
      //  Dumper(e);
      console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});
app.post('/get_word_label_prediction', async (req, res) => {
    try {        
   
        var options = await get_header_options(req);
        console.log("trying to get_word_label_prediction");
        Dumper(req.body);

        var automl = new AutoML(options);
        var data = await automl.getWordLabelPrediction(req.body);

        console.log(`Got some data (below) from get_word_label_prediction `);
        Dumper(data)
        res.send({'data': data});
    } catch (e) {
      //  Dumper(e);
      console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});
app.get('/get_config', async (req, res) => {
    try {
        var options = await get_header_options(req)
        //console.log("trying to list docs")
        //console.log(options)
        await sleep(500)
        var appConfig = new AppConfig(options)
        var data = await appConfig.getConfig()
        res.send({'data': data});
    } catch (e) {
     //   Dumper(e)
        console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }   
});

app.post('/save_config', async (req, res) => {
    try {        
   
        var options = await  get_header_options(req);
        console.log("trying to save_config");
        console.log(req.body);

        var appConfig = new AppConfig(options);
        await appConfig.saveConfig(req.body);
        res.send({'data': req.body}); // no errors? then we return the configuration we just saved.
    } catch (e) {
      //  Dumper(e);
      console.error(`${e.message} ${e.stack}`)
        res.send({'error': e.message, 'trace':e.stack });
    }
});
/**
 * @param {number} ms
 */
function sleep(ms) {
    return //new Promise(resolve => setTimeout(resolve, ms));
}

// production endpoint served from here
app.use(express.static(path.join(__dirname, '../browser/build')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../browser/build', 'index.html'));
});


