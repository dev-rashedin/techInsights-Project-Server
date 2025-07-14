import express, { Application } from "express";

const app: Application = express();
const cors = require("cors");

app.use(express.json());

app.use(cors());

export default app;
