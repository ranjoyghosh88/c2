var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: false},
  name: {type: String, required: false},
});
module.exports = mongoose.model(
  'tag',
  schema,
  'tags'
);