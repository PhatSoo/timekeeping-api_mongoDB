const express = require('express');
const router = express.Router();

const HomeController = require('../controllers/HomeController');

const APPRoute = (app) => {
  router.post('/login', HomeController.login);

  return app.use('/', router);
};

module.exports = APPRoute;
