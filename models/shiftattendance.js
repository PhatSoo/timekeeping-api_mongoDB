const { mongoose, Schema, ObjectId } = require('../config/database');

const ShiftAttendanceSchema = new Schema(
  {
    employee: { type: ObjectId, ref: 'employees' },
    workDate: Date,
    workShift: { type: ObjectId, ref: 'work_shifts' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('shift_attendances', ShiftAttendanceSchema);
