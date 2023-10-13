require('dotenv/config');
const express = require('express');
const APIRoute = require('./routes/api');

var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

APIRoute(app);

app.listen(process.env.PORT, () => {
  console.log('====================================');
  console.log(`Server starts on Port: ${process.env.PORT}`);
  console.log('====================================');
});
