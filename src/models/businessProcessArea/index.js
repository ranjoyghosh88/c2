var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true},
  name: {type: String, required: true},
  accronym: {type: String, required: true},
  path: { type: String },
  isExcluded: Boolean,
});
schema.pre('save', function(next) {
  this.path = '/' + this.name + ';';
  next();
});
module.exports = mongoose.model(
  'businessProcessArea',
  schema,
  'businessProcessAreas'
);