var mongoose = require('mongoose');
var BPA = require('../businessProcessArea');
var async = require('async');
var schema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  accronym: {
    type: String,
  },
  businessProcessAreas: [{
      type: Number,
      ref: 'businessProcessArea',
    }, ],
  path: {
    type: String,
  },
});
schema.pre('save', function(next) {
  var self = this;
  var businessRef = self.businessProcessAreas;
  self.path = '';
  async.map(businessRef, function(bpaId, cb) {
    BPA.findById(bpaId, function(err, bpa) {
      if (err) {
        return cb(err);
      }
      self.path += bpa.path.replace(/;$/, '') + '/' + self.name + ';';
      cb();
    });
  }, next);
});
module.exports = mongoose.model(
  'enterpriseSoftwareWithinBPA',
  schema,
  'enterpriseSoftwareWithinBPAs'
);