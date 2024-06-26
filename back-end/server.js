const express = require('express');
const cors = require('cors');
const app = express();
const port = 5050;
// add AWS sdk
const AWS = require('aws-sdk');
// add .env support - may only need this for development? If so we can add a flag
const dotenv = require('dotenv');
dotenv.config();

const openAiRequest = require('./openAiRequest');


// get AWS config keys and set them
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env;
AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: 'us-west-2' });

// import image2Text gen function using Textract
// currently this is an async function which returns a string
const image2Text = require('./image2Text');


// add support for JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cors())
app.get('/', (req, res) => {
  res.send("Hello World");
});

// create a post route
app.post('/gen', async (req, res) => {
  const { fileAsString } = req.body;
  const result = await image2Text(fileAsString);
  res.json({ result });
});

// open ai route
app.post('/openai', async (req, res) => {
  const { input } = req.body;
  const { raw } = req.query;

  try{
    const response = await openAiRequest(input);

    if(raw){
      res.json({ response });
      return;
    }
  
    const result = JSON.parse(response.choices[0].message.content);
    res.json({ response: result });
  }catch(e){
    res.json({ error: e.message, response: null });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});