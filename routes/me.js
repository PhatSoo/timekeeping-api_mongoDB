const express = require('express');
const router = express.Router();

const MeController = require('../controllers/MeController');
const { uploadAvatar } = require('../middlewares/Uploads');
const authenticate = require('../middlewares/CheckLogin');

const MERoute = (app) => {
  router.post('/avatar', uploadAvatar.single('avatar'), MeController.uploadAvatar);
  router.put('/', MeController.updateMe);
  router.get('/schedule', MeController.getSchedule);
  router.get('/attendance', MeController.getAttendance);
  router.get('/', MeController.getMe);

  return app.use('/me', authenticate, router);
};

module.exports = MERoute;
