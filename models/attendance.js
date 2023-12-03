const { mongoose, Schema, ObjectId } = require('../config/database');

const AttendanceSchema = new Schema({
  employee: { type: ObjectId, ref: 'employees' },
  checkInTime: { type: Date, default: null },
  checkInImage: String,
  checkOutTime: { type: Date, default: null },
  checkOutImage: String,
  workDate: Date,
  workShift: { type: ObjectId, ref: 'work_shifts', default: null },
  status: {
    type: String,
    enum: ['NULL', 'ON LEAVE', 'WORKING', 'DONE'],
    default: 'NULL',
  },
});

/*
  'NULL': Mặc định.
  'WORKING': Nhân viên đang làm việc.
  'DONE': Hoàn thành.
*/

module.exports = mongoose.model('attendances', AttendanceSchema);
