// const mongoose = require('mongoose');
// const config = require('./config');

import mongoose, { Error } from "mongoose";
import config from "./config";

const mongoURI = `mongodb+srv://${config.dbUser}:${config.dbPassword}@cluster0.4qgkjzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (err: Error | any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
