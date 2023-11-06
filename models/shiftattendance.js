const { mongoose, Schema, ObjectId } = require('../config/database');

const shiftAttendanceSchema = new Schema({
  shiftRegistration: { type: ObjectId, ref: 'shift_registrations' },
  employee: { type: ObjectId, ref: 'employees' },
  checkInTime: Date,
  checkOutTime: Date,
  status: String,
});

module.exports = mongoose.model('shift_attendances', shiftAttendanceSchema);
