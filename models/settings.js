const { mongoose, Schema } = require('../config/database');

const settingsSchema = new Schema(
  {
    _id: false,
    workDays: [String],
    workHours: {
      startTime: String,
      endTime: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('settings', settingsSchema);
