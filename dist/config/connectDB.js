// const mongoose = require('mongoose');
// const config = require('./config');
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import config from './config';
const mongoURI = `mongodb+srv://${config.dbUser}:${config.dbPassword}@cluster0.4qgkjzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');
    }
    catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
});
export default connectDB;
