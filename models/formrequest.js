const { mongoose, Schema, ObjectId } = require('../config/database');

const formRequestSchema = new Schema(
  {
    employee: { type: ObjectId, ref: 'employees' },
    startDate: Date,
    endDate: Date,
    isFullDay: Boolean,
    workShift: { type: ObjectId, ref: 'work_shifts' },
    reason: String,
    status: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('form_requests', formRequestSchema);
