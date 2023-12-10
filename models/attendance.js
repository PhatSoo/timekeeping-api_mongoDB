const { mongoose, Schema, ObjectId } = require('../config/database');

const AttendanceSchema = new Schema(
  {
    employee: { type: ObjectId, ref: 'employees' },
    checkIn: {
      time: Date,
      image: String,
      score: Number,
    },
    checkOut: {
      time: Date,
      image: String,
      score: Number,
    },
    workDate: Date,
    workShift: { type: ObjectId, ref: 'work_shifts', default: null },
    status: {
      type: String,
      enum: ['NULL', 'ON LEAVE', 'WORKING', 'DONE'],
      default: 'NULL',
    },
  },
  {
    timestamps: true,
  }
);

/*
  'NULL': Mặc định.
  'WORKING': Nhân viên đang làm việc.
  'DONE': Hoàn thành.
*/

module.exports = mongoose.model('attendances', AttendanceSchema);
