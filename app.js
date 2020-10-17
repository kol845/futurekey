
const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(express.static(__dirname + "/frontend")); 

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const apiEndpoint = require('./backend/net/apiEndpoint');

apiEndpoint.router(app);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});