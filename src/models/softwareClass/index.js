var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  path: {type: String},
});
schema.pre('save', function(next) {
  this.path = '/' + this.name + ';';
  next();
});
module.exports = mongoose.model(
  'softwareClass',
  schema,
  'softwareClass'
);