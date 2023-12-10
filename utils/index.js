const AttendanceModel = require('../models/attendance');

const validateEmail = (email) => {
  return String(email).match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

const isFloat = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value)) {
    return true;
  }

  return false;
};

// Hàm tạo một ca làm việc mới
async function createShift(registration, shift) {
  const newShift = {
    workShift: shift._id,
    employee: registration.employee._id,
    checkIn: {
      time: null,
      image: null,
      score: null,
    },
    checkOut: {
      time: null,
      image: null,
      score: null,
    },
    workDate: registration.workDate,
    status: 'NULL',
  };

  const attendance = new AttendanceModel(newShift);
  await attendance.save();
}

module.exports = {
  validateEmail,
  isFloat,
  createShift,
};
