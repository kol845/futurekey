
const express = require('express');
const PORT = 5000;

const app = express();

app.use(express.json());


const apiEndpoint = require('./net/apiEndpoint');

apiEndpoint.router(app);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})