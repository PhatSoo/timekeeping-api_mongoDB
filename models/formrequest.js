const { mongoose, Schema, ObjectId } = require('../config/database');

const formRequestSchema = new Schema(
  {
    employee: { type: ObjectId, ref: 'employees' },
    startDate: Date,
    endDate: Date,
    workShift: { type: ObjectId, ref: 'work_shifts' },
    reason: String,
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DENIED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('form_requests', formRequestSchema);
