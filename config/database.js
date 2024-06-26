require('dotenv/config');

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_LINK, { dbName: process.env.DB_NAME });

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = {
  mongoose,
  Schema,
  ObjectId,
};
