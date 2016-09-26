var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var profileSchema = require('../profileSchema');
var SearchPlugin = require('../mongoose-search-plugin');

var _ = require('lodash');
var util = require('../util');
var async = require('async');
var MasterCollection = {
  industry: require('../industry'),
  companyHeadCount: require('../companyHeadCount'),
  vendorType: require('../vendorType'),
  speciality: require('../speciality'),
  enterpriseSoftware: require('../enterpriseSoftware'),
};
var RelationSchema = new Schema({
  relation: {
    type: String,
    refinement: {
      header: 'Connection Type',
      isMultiple: true,
      masterColleName: 'relationTypes',
      autoSelectAll: false,
      name: 'relation',
      order: 7,
      refModel: {
        ref: 'relationTypes',
        searchFieldName: 'connectedAs',
        projectionField: 'connectAs',
      },
    },
  },
  connectionDate: Date,
  connectionStatus: String,
  refId: Schema.Types.ObjectId,
});

var schema = profileSchema.extend({
  path: { type: String, isSearchable: true },
  employees: [{
      type: String,
      ref: 'personalProfile',
    }, ],
  products: [{
      type: Schema.Types.ObjectId,
      ref: 'productProfile',
    }, ],
  headCount: {
    type: Number,
    ref: 'companyHeadCount',
    refinement: {
      header: 'Company Size',
      isMultiple: true,
      masterColleName: 'companyHeadCount',
      name: 'headCount',
      order: 4,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'companyHeadCount',
    },

  },
  name: {
    type: String,
    trim: true,
    isSearchable: true,
  },
  displayName: String,
  logo: String,
  admin: [{
      type: String,
      ref: 'personalProfile',
    }, ],
  description: String,
  annualRevenue: {
    type: Number,
    ref: 'companyAnnualRevenue',
  },
  companyLocations: {
    type: String,
    isSearchable: true,
    refinement: {
      header: 'Location',
      isMultiple: false,
      isTypeahead: true,
      name: 'location',
      order: 5,
    },
  },
  companyWebsite: {
    type: String,
    isSearchable: true,
  },
  industry: [{
      type: Number,
      ref: 'industry',
      refinement: {
        header: 'Industry Served',
        isMultiple: true,
        masterColleName: 'industry',
        name: 'industry',
        order: 3,
      },
      isSearchable: {
        searchField: 'name',
        masterColleName: 'industry',
      },

    }, ],
  type: {
    type: Number,
    ref: 'vendorType',
    default: 1,
    refinement: {
      header: 'Type of Companies',
      isMultiple: true,
      masterColleName: 'vendorType',
      name: 'ctypes',
      order: 1,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'vendorType',
    },
  },
  ratings: {
    type: Number,
    ref: 'ratings',
    refinement: {
      header: 'Rating',
      isMultiple: true,
      masterColleName: 'companyRating',
      name: 'ratings',
      order: 2,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'companyRating',
    },

  },
  claimedBy: {
    profiles: [{
        _id: false,
        profileId: {
          type: Schema.Types.ObjectId, required: true,
          ref: 'personalProfile',
        },
        status: { type: String, lowercase: true, trim: true },
        date: { type: Date, default: Date.now },
        modifiedBy: { type: Schema.Types.ObjectId, ref: 'personalProfile', },
        modifiedDate: { type: Date, default: Date.now },
      }, ],
  },
  ownerId: {
    profileId: {
      _id: false, type: Schema.Types.ObjectId,
      ref: 'personalProfile',
    },
  },
  connections: {
    companies: [{
        relation: String,
        connectionDate: Date,
        connectionStatus: String,
        refId: Schema.Types.ObjectId,
      }, ],
    products: [{
        relation: String,
        connectionDate: Date,
        connectionStatus: String,
        refId: Schema.Types.ObjectId,
      }, ],
    profiles: [RelationSchema],
  },
  followers: {
    companies: [{
        type: Schema.Types.ObjectId,
        ref: 'companyProfile',
        refinement: {
          header: 'Followers',
          isMultiple: false,
          name: 'followers',
          order: 10,
          refModel: {
            ref: 'companyProfile',
            searchFieldName: 'name',
            requireLoggedIn: true,
          },
        },
      }, ],
    products: [Schema.Types.ObjectId],
    profiles: [Schema.Types.ObjectId],
  },
  followingProfiles: {
    companies: [{
        type: Schema.Types.ObjectId,
        ref: 'companyProfile',
        refinement: {
          header: 'Followings',
          isMultiple: false,
          name: 'followings',
          order: 10,
          refModel: {
            ref: 'companyProfile',
            searchFieldName: 'name',
            requireLoggedIn: true,
          },
        },
      }, ],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productProfile',
      }, ],
    profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'personalProfile',
      }, ],
  },
  speciality: [{
      type: Number,
      ref: 'enterpriseSoftware',
      refinement: {
        header: 'Specialties',
        isMultiple: true,
        masterColleName: 'specialities',
        name: 'spl',
        order: 6,
      },
      isSearchable: {
        searchField: 'name',
        masterColleName: 'specialities',
      },
    }, ],
  software: Boolean,
  hardware: Boolean,
  SAAS: Boolean,
  businessModel: String,
  professionalService: Boolean,
  level: String,
  tarketMarket: String,
  phoneNumber: String,
  companyFollowers: {
    profiles: [Schema.Types.ObjectId],
  },
});

var multiplePopulate = {
  path: 'type',
};
schema.plugin(SearchPlugin, {
  beforeExecQuery: function(query, mongoQuery, callback) {
    var personalProfile = require('../personalProfile');
    if (query.seeAll === 'connections' && query.user) {
      var productProfile = require('../productProfile');
      var companyProfile = require('../companyProfile');
      var pro = personalProfile;
      if (query.connectionFrom === 'product') {
        pro = productProfile;
      } else if (query.connectionFrom === 'company') {
        pro = companyProfile;
      }
      pro.findOne({ uid: query.user }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        if (!prof) {
          return callback({ message: 'Resource not found', status: 404 });
        }
        var ids = [];
        var rids = [];
        if (prof.connections && prof.connections.companies) {
          for (var i = 0; i < prof.connections.companies.length;) {
            rids.push(_.pick(prof.connections.companies[i], 'refId'));
            if (prof.connections.companies[i].connectionStatus === 'APPROVED' ||
             !prof.connections.companies[i].connectionStatus) {
              ids.push(rids[i].refId);
            }
            i++;
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else if (query.seeAll === 'claimed' && query.user) {
      personalProfile.findOne({ uid: query.user }, '_id', function(err, prof) {
        if (err) {
          return callback(err);
        }
        var claimQuery = {};
        if (query.claimStatus === 'pending') {
          claimQuery = {
            'claimedBy.profiles': {
              $elemMatch: {
                profileId: prof._id,
                status: query.claimStatus,
              },
            },
          };
        } else if (query.claimStatus === 'approved') {
          claimQuery = {
            'ownerId.profileId': prof._id,
            'claimedBy.profiles.0': { $exists: true },
          };
        }
        Model.find(claimQuery, '_id', function(err, ids) {
          ids = _.pluck(ids, '_id');
          if (ids.length) {
            mongoQuery.$and.push({ _id: { $in: ids } });
          }
          callback(null, mongoQuery);
        }).lean();
      });
    } else if (query.seeAll === 'favourites' && query.user) {
      personalProfile.findOne({ uid: query.user }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        if (!prof) {
          return callback(null);
        } else {
          var ids = [];
          var rids = [];
          if (prof.favourites && prof.favourites.companies) {
            for (var i = 0; i < prof.favourites.companies.length; i++) {
              ids.push(prof.favourites.companies[i]);
            }
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else if (query.seeAll === 'connectionsCompany' && query.user) {
      Model.findOne({ uid: query.user }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        var ids = [];
        var rids = [];
        if (prof.connections && prof.connections.companies) {
          for (var i = 0; i < prof.connections.companies.length; i++) {
            ids.push(prof.connections.companies[i].refId);
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else if (query.seeAll === 'Similar Companies' && query.uid) {
      Model.findOne({ uid: query.uid }, function(err, resultData) {
        if (err) {
          return callback(err);
        }
        var annualRevenue =
 resultData.annualRevenue?resultData.annualRevenue._id:null;
        var headCount = resultData.headCount?resultData.headCount._id:null;
        var type = resultData.type?resultData.type._id:null;
        var nin = [resultData._id];
        var $or = [{ annualRevenue: annualRevenue },
{ headCount: headCount },
{ type: type }, ];
        mongoQuery.$and.push({ $or: $or });
        mongoQuery.$and.push({ uid: { $nin: nin } });
        callback(null, mongoQuery);
      });
    } else {
      callback(null, mongoQuery);
    }
  },
  // Modifiy results as required, depending on userData(premium/public etc)
  // Show only data which user has access to.
  processData: function(result, userData, callback) {
    console.log('Got Company search results');
    this.populate(result.data, multiplePopulate, function(err, data) {
      result.data = data;
      for (var iIndex = 0; iIndex < result.data.length; iIndex++) {
        result.data[iIndex] =
                  util.deepPick(result.data[iIndex].toJSON(),
                    _.defaults({}, userData));
      }
      callback(null, result);
    });
  },
});

var Model = mongoose.model(
  'companyProfile',
  schema,
  'companyProfiles'
);
module.exports = Model;
schema.post('init', function(doc) {
  doc.name = doc.displayName || doc.name;
});
// Save unique id for public view
schema.pre('save', function(next) {
  this.displayName = this.name;
  this.name = this.name.toLowerCase();
  if (this.uid) {
    return next();
  } else {
    var uid = (this.name || '').toLowerCase();
    if (!uid.length) {
      return next(new Error('Company Name not found!!'));
    }
    uid = util.getStringForUId(uid);
    var tat = this;
    util.getUid(Model, uid, { uid: uid }, 0, function(err, resUid) {
      if (err) {
        return next(err);
      }
      tat.uid = resUid;
      next();
    });
  }
});

var savePath = function(model, callback) {
  var populateFields = [{
      Model: MasterCollection.enterpriseSoftware,
      idList: model.speciality,
    },
  ];
  model.path = '';
  var tat = model;
  async.map(populateFields, function(obj, cb) {
    obj.Model.find({ _id: { $in: obj.idList } }, cb).lean();
  },
   function(err, res) {
    if (err) {
      return callback(err);
    }
    _.each(res, function(arrList) {
      _.each(arrList, function(obj) {
        if (obj.path) {
          tat.path += obj.path;
        }
      });
    });
    callback();
  });
};
schema.pre('save', function(next) {
  savePath(this, next);
});

