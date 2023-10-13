require('dotenv/config');

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_LINK);

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {
  mongoose,
  Schema,
  ObjectId,
};
