const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://byteblog-da679.web.app',
    'https://byteblog-da679.firebaseapp.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('The-Tech-Insight server is running');
});

app.listen(port, () => {
  console.log('The-Tech-Insight server is running');
});
