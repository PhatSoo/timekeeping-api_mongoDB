require('dotenv/config');
const express = require('express');
var cors = require('cors');
const path = require('path');

const APIRoute = require('./routes/api');
const MERoute = require('./routes/me');
const APPRoute = require('./routes/app');

var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
APPRoute(app);
APIRoute(app);
MERoute(app);

app.listen(process.env.PORT, () => {
  console.log('====================================');
  console.log(`Server starts on Port: ${process.env.PORT}`);
  console.log('====================================');
});
