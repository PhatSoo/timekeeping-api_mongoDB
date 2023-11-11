const { mongoose, Schema, ObjectId } = require('../config/database');

const shiftAttendanceSchema = new Schema({
  shiftRegistration: { type: ObjectId, ref: 'shift_registrations' },
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  status: {
    type: String,
    enum: ['NULL', 'WORKING', 'LATE', 'EARLY', 'DONE'],
    default: 'NULL',
  },
});

/*
  'NULL': Mặc định.
  'WORKING': Nhân viên đang làm việc.
  'LATE': Nhân viên đi muộn.
  'EARLY': Nhân viên về sớm.
  'DONE': Hoàn thành.
*/

module.exports = mongoose.model('shift_attendances', shiftAttendanceSchema);
