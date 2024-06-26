const { mongoose, Schema, ObjectId } = require('../config/database');

const employeeSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    isPartTime: Boolean,
    CCCD: Number,
    sex: Boolean,
    phone: String,
    avatar: String,
    role: {
      type: ObjectId,
      ref: 'roles',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('employees', employeeSchema);
