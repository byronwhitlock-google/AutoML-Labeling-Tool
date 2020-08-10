require('app-module-path').addPath(__dirname);
const Dumper = require('dumper').dumper;

const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const CloudStorage = require('api/cloud-storage.js');
const UserConfig =  require('user-config.js')

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/list_documents', async (req, res) => {
    var gcs = new CloudStorage();    
    var data = await gcs.listDocuments();
    console.log(Dumper(data))
    res.send({'data': data});
});

app.get('/load_document', async (req, res) => {
    var gcs = new CloudStorage();    
    try {
        var data = await gcs.readDocument(req.query.d);
    } catch (e) {
        res.send({'error': e});
    }
    if (data.length > 9999) // we don't support documents > 10k chars
    {
        res.send({'error': 'Document length greater than 10,000 characters not supported'})
    }
    //console.log(Dumper(data))
    res.send({'data': data});
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

