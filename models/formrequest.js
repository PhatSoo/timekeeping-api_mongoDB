const { mongoose, Schema, ObjectId } = require('../config/database');

const formRequestSchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: 'employees' },
    formTypeId: { type: ObjectId, ref: 'form_types' },
    startDate: Date,
    endDate: Date,
    isFullDay: Boolean,
    workShiftId: { type: ObjectId, ref: 'work_shifts' },
    reason: String,
    status: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('form_requests', formRequestSchema);
