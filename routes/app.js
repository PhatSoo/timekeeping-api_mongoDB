const express = require('express');
const router = express.Router();

const HomeController = require('../controllers/HomeController');

const APPRoute = (app) => {
  router.post('/login', HomeController.login);
  router.get('/', (req, res) => {
    res.render('index');
  });

  return app.use('/', router);
};

module.exports = APPRoute;
