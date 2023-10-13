const { mongoose, Schema, ObjectId } = require('../config/database');

const workDaySchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: 'employees' },
    workDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('work_days', workDaySchema);
