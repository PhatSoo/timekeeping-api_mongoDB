const { mongoose, Schema, ObjectId } = require('../config/database');

const shiftAttendanceSchema = new Schema({
  workShift: { type: ObjectId, ref: 'work_shifts' },
  employee: { type: ObjectId, ref: 'employees' },
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  workDate: Date,
  status: {
    type: String,
    enum: ['NULL', 'WORKING', 'DONE'],
    default: 'NULL',
  },
});

/*
  'NULL': Mặc định.
  'WORKING': Nhân viên đang làm việc.
  'DONE': Hoàn thành.
*/

module.exports = mongoose.model('shift_attendances', shiftAttendanceSchema);
