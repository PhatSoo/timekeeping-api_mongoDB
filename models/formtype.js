const { mongoose, Schema } = require('../config/database');

const formTypeSchema = new Schema(
  {
    typeName: String,
  },
  {
    timestamps: true, // This will add fields "createdAt" and "updatedAt"
  }
);

module.exports = mongoose.model('form_types', formTypeSchema);
