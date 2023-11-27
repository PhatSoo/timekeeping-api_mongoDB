const multer = require('multer');
const path = require('path');

const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/avatars');
  },
  filename: (req, file, cb) => {
    const { _id } = req.body;

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, 'AV-' + _id + '-' + uniqueSuffix + extension);
  },
});

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: { fieldSize: 10000000 /* 10MB */ },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      console.log('====================================');
      console.log('Only jpg & png file supported1');
      console.log('====================================');

      cb(null, false);
    }
  },
});

const storageAttendance = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/attendances');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, 'AT-' + req.userId + '-' + uniqueSuffix + extension);
  },
});

const uploadAttendance = multer({
  storage: storageAttendance,
  limits: { fieldSize: 10000000 /* 10MB */ },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      console.log('====================================');
      console.log('Only jpg & png file supported1');
      console.log('====================================');

      cb(null, false);
    }
  },
});

module.exports = {
  uploadAvatar,
  uploadAttendance,
};
