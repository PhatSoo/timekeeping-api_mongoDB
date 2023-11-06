const { mongoose, Schema, ObjectId } = require('../config/database');

const AttendanceSchema = new Schema({
  checkInTime: Date,
  checkOutTime: Date,
  status: Number,
  employeeId: { type: ObjectId, ref: 'employees' },
  workDate: Date,
});

module.exports = mongoose.model('attendances', AttendanceSchema);
