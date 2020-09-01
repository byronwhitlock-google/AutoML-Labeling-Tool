require('app-module-path').addPath(__dirname);
const Dumper = require('dumper').dumper;

const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const CloudStorage = require('lib/cloud-storage.js');
const AnnotatedDocument = require('lib/annotated-document.js');
const UserConfig =  require('user-config.js')
const BodyParser = require('body-parser');
app.use(BodyParser.json());

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/list_documents', async (req, res) => {
    try {
        var gcs = new CloudStorage();    
        var data = await gcs.listDocuments();
        console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
        Dumper(e)
        res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/load_document', async (req, res) => {
    var doc = new AnnotatedDocument();    
    try {
        var data = await doc.load(req.query.d);
        //console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
          Dumper(e)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.post('/save_document',async(req,res) =>{
    //Dumper(req.body)
    var doc = new AnnotatedDocument();    
    try {
        // TODO: validate json against schema        
        var data = await doc.save(req.query.d,req.body);
        //console.log(Dumper(data))
        res.send({'data': data});
    } catch (e) {
          Dumper(e)
          res.send({'error': e.message, 'trace':e.stack });
    }
});

app.get('/load_labels', async (req, res) => {
    var gcs = new CloudStorage();    
    var data = await gcs.readDocument('labels.json');
    //console.log(Dumper(data))
    res.send({'data': data});
});

app.get('/load_prediction', async (req, res) => {
    var gcs = new CloudStorage();    
    var data = await gcs.readDocument("prediction.json");
    //console.log(Dumper(data))
    res.send({'data': data});
});

