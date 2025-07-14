

const express = require('express');

const app: Express = express();
const cors = require('cors');

app.use(express.json());

app.use(cors());

module.exports = app;
