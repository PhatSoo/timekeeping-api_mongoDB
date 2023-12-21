const express = require('express');
const router = express.Router();

const MeController = require('../controllers/MeController');
const authenticate = require('../middlewares/CheckLogin');

const MERoute = (app) => {
  router.get('/image', MeController.getImageForCheckAttendance);
  router.put('/', MeController.updateMe);
  router.get('/schedule', MeController.getSchedule);
  router.get('/attendance', MeController.getAttendance);
  router.get('/existing-shift/:shiftId', MeController.getExistingShiftInCurrent);
  router.get('/', MeController.getMe);
  router.post('/form', MeController.form);
  router.get('/form', MeController.getRequest);

  return app.use('/me', authenticate, router);
};

module.exports = MERoute;
