const { mongoose, Schema } = require('../config/database');

const roleSchema = new Schema(
  {
    typeName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('roles', roleSchema);
