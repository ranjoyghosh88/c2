var mongoose = require('mongoose');
var softwareClass = require('../softwareClass');
var enterpriseSoftwareWithinBPA = require('../enterpriseSoftwareWithinBPA');
var schema = new mongoose.Schema({
  _id: {type: Number, required: true, unique: true},
  name: {type: String, required: true},
  softwareClass: {type: Number},
  enterpriseSoftwareWithinBPA: {type: Number,
   ref: 'enterpriseSoftwareWithinBPA', },
  path: { type: String },
  isExcluded: Boolean,
});
schema.pre('save', function(next) {
  var self = this;
  self.path = '';
  softwareClass.findById(self.softwareClass,
   function(err, data) {
    enterpriseSoftwareWithinBPA.findById(self.enterpriseSoftwareWithinBPA,
     function(err, bpa) {
      if (data && bpa) {
        self.path = bpa.path.replace(/;$/, '') +
        data.path.replace(/;$/, '') + '/' + self.name + ';';
      }
      next();
    });
  });
});
module.exports = mongoose.model(
  'enterpriseSoftware',
  schema,
  'enterpriseSoftwares'
);