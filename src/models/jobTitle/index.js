var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  name: { type: String, required: true, unique: true },
  isExcluded: Boolean,
});
module.exports = mongoose.model(
  'jobTitle',
  schema,
  'jobTitles'
);