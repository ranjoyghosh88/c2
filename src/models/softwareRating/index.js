var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  functionalRole: [{
      type: Number,
      ref: 'functionalRole',
    }, ],
});
module.exports = mongoose.model(
  'softwareRating',
  schema,
  'softwareRatings'
);