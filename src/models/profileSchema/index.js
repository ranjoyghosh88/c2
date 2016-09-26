var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var RelationSchema = new Schema({
  relation: {
    type: String,
    refinement: {
      header: 'Relation',
      isMultiple: true,
      masterColleName: 'relationTypes',
      name: 'relation',
      order: 10,
    },
  },
  connectionDate: Date,
  connectionStatus: String,
  refId: Schema.Types.ObjectId,
});


var profileSchema = new Schema({
  favouritedBy: [Schema.Types.ObjectId],
  tags: [{
      type: Number,
      isSearchable: {
        searchField: 'name',
        masterColleName: 'tag',
      },
    }, ],
  externalSources: {
    linkedIn: { type: Schema.Types.Mixed },
  },
  testimonials: {
    personalProfile: {
      type: Schema.Types.ObjectId,
      ref: 'personalProfile',
    },
    text: String,
  },
  profileFollowers: [{
      type: Schema.Types.ObjectId,
      ref: 'personalProfile',
    }, ],
  uid: String,
});
module.exports = profileSchema;