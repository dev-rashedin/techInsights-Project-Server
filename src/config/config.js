const dotenv = require('dotenv');
dotenv.config();

// Load environment variables
const config = {
  port: process.env.PORT || 3008,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  transporterEmail: process.env.TRANSPORTER_EMAIL,
  transporterPass: process.env.TRANSPORTER_PASS,
};

module.exports = config;