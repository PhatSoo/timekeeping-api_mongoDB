const express = require('express');
const router = express.Router();

const MeController = require('../controllers/MeController');
const { uploadAvatar, uploadAttendance } = require('../middlewares/Uploads');
const authenticate = require('../middlewares/CheckLogin');

const MERoute = (app) => {
  router.post('/avatar', uploadAvatar.single('avatar'), MeController.uploadAvatar);
  router.post('/image', uploadAttendance.single('image'), MeController.uploadImage);
  router.get('/image', MeController.getImageForCheckAttendance);
  router.put('/', MeController.updateMe);
  router.get('/schedule', MeController.getSchedule);
  router.get('/attendance', MeController.getAttendance);
  router.get('/existing-shift/:shiftId', MeController.getExistingShiftInCurrent);
  router.get('/', MeController.getMe);
  router.put('/check', MeController.check);

  return app.use('/me', authenticate, router);
};

module.exports = MERoute;
