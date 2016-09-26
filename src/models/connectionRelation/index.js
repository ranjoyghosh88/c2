var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true},
  connectionFrom: { type: String, required: true},
  connectionTo: { type: String, required: true},
  connectAs: { type: String, required: true},
  connectedAs: { type: String, required: true},
});
module.exports = mongoose.model(
  'relationTypes',
  schema,
  'relationTypes'
);