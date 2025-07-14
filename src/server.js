const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/connectDB');


connectDB()

app.listen(config.port, () => {
  console.log(`The-Tech-Insight server is running on port: ${config.port}`);
});