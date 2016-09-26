var mongoose = require('mongoose');
var developmentSoftwareType = require('../developmentSoftwareType');
var developmentLanguage = require('../developmentLanguage');
var softwareClass = require('../softwareClass');
var schema = new mongoose.Schema({
  _id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  developmentSoftwareType: {
    type: Number,
    ref: 'developmentSoftwareType',
  },
  developmentLanguage: {
    type: Number,
    ref: 'developmentLanguage',
  },
  softwareClass: {
    type: Number,
    ref: 'softwareClass',
  },
  path: { type: String },
  isExcluded: Boolean,
});
schema.pre('save', function(next) {
  var self = this;
  self.path = '';
  developmentSoftwareType.findById(self.developmentSoftwareType,
   function(err, data) {
    developmentLanguage.findById(self.developmentLanguage,
     function(err, language) {
      // === //
      softwareClass.findById(self.softwareClass,
           function(err, sClass) {
            if (data) {
              self.path += '/' + data.name;
            }
            if (language) {
              self.path += '/' + language.name;
            }
            if (sClass) {
              self.path += sClass.path.replace(/;$/, '');
            }
            if (self.name) {
              self.path += '/' + self.name + ';';
            }
            next();
          });
      // === //
    });
  });
});
module.exports = mongoose.model(
  'developmentSoftware',
schema,
'developmentSoftwares'
);