const app = require('./app');
const port = process.env.PORT || 3006;

app.listen(port, () => {
  console.log(`The-Tech-Insight server is running on port: ${port}`);
});