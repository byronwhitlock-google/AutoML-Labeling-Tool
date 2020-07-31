const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/load_document', (req, res) => {
  console.log(`mock_data/${req.query}`)
  // just mock this out for now
  fs.readFile(`mock_data/${req.query.d}`, 'utf8', (err, data) => {
    res.send({'data': data});
  });
});
