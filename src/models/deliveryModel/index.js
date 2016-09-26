var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  name: {type: String, required: true, unique: true},
});
module.exports = mongoose.model(
  'deliveryModel',
  schema,
  'deliveryModels'
);