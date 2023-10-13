const { mongoose, Schema } = require('../config/database');

const workShiftSchema = new Schema(
  {
    shiftName: String,
    startTime: Number,
    endTime: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('work_shifts', workShiftSchema);
