var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var profileSchema = require('../profileSchema');
var SearchPlugin = require('../mongoose-search-plugin');
var _ = require('lodash');
var util = require('../util');
var async = require('async');
var CompanyModel = require('../companyProfile');
var MasterCollection = {
  productType: require('../productType'),
  intendedFor: require('../intendedScaleModel'),
  enterpriseSoftware: require('../enterpriseSoftware'),
};
var RelationSchema = new Schema({
  relation: {
    type: String,
    refinement: {
      header: 'Connection Type',
      isMultiple: true,
      masterColleName: 'relationTypes',
      name: 'productrelation',
      autoSelectAll: false,
      order: 4,
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
  company: [{
      type: Schema.Types.ObjectId,
      ref: 'companyProfile',
      refinement: {
        header: 'Company',
        isMultiple: false,
        name: 'pcomp',
        order: 2,
        refModel: {
          ref: 'companyProfile',
          searchFieldName: 'name',
        },
      },
    }, ],
  name: { type: String, isSearchable: true },
  displayName: String,
  logo: String,
  versionNumber: String,
  userCount: String,
  description: String,
  productWebsite: String,
  type: {
    type: Number,
    ref: 'productType',
    refinement: {
      header: 'Type of Product',
      isMultiple: true,
      masterColleName: 'productType',
      name: 'ptypes',
      order: 1,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'productType',
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
  demo: [{
      url: String,
      desc: String,
      date: { type: Date, default: Date.now },
    }, ],
  followers: {
    companies: [Schema.Types.ObjectId],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productProfile',
        refinement: {
          header: 'Followers',
          isMultiple: false,
          name: 'followers',
          order: 10,
          refModel: {
            ref: 'productProfile',
            searchFieldName: 'name',
            requireLoggedIn: true,
          },
        },
      }, ],
    profiles: [Schema.Types.ObjectId],
  },
  followingProfiles: {
    companies: [{
        type: Schema.Types.ObjectId,
        ref: 'companyProfile',
      }, ],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productProfile',
        refinement: {
          header: 'Followings',
          isMultiple: false,
          name: 'followings',
          order: 10,
          refModel: {
            ref: 'productProfile',
            searchFieldName: 'name',
            requireLoggedIn: true,
          },
        },
      }, ],
    profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'personalProfile',
      }, ],
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
  admin: [{
      type: String,
      ref: 'personalProfile',
    }, ],
  intendedFor: [{
      type: Number,
      ref: 'intendedScaleModel',
      refinement: {
        header: 'Intended for',
        isMultiple: true,
        masterColleName: 'intendedScaleModel',
        name: 'intdFor',
        order: 3,
      },
      isSearchable: {
        searchField: 'name',
        masterColleName: 'intendedScaleModel',
      },
    }, ],
  goodFor: [{
      type: Number,
      ref: 'enterpriseSoftware',
    }, ],
  softwareClass: {
    type: String,
    ref: 'softwareClass',
  },
  enterpriseSoftwareWithinBPA: {
    type: String,
    ref: 'enterpriseSoftwareWithinBPA',
  },
});

var multiplePopulate = {
  path: 'company',
};
schema.plugin(SearchPlugin, {
  beforeExecQuery: function(query, mongoQuery, callback) {
    var personalProfile = require('../personalProfile');
    var productProfile = require('../productProfile');
    var companyProfile = require('../companyProfile');
    var pro = personalProfile;
    if (query.seeAll === 'connections' && query.user) {
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
        if (prof.connections && prof.connections.products) {
          for (var i = 0; i < prof.connections.products.length; i++) {
            rids.push(_.pick(prof.connections.products[i], 'refId'));
            if (prof.connections.products[i].connectionStatus === 'APPROVED' ||
             !prof.connections.products[i].connectionStatus) {
              ids.push(rids[i].refId);
            }
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
    } else if (query.seeAll === 'products' && query.user) {
      CompanyModel.findOne({ uid: query.uid }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        var ids = [];
        var rids = [];
        if (prof.products) {
          for (var i = 0; i < prof.products.length; i++) {
            ids.push(prof.products[i]);
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else if (query.seeAll === 'favourites' && query.user) {
      personalProfile.findOne({ uid: query.user }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        var ids = [];
        var rids = [];
        if (prof.connections && prof.favourites.products) {
          for (var i = 0; i < prof.favourites.products.length; i++) {
            ids.push(prof.favourites.products[i]);
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else if (query.seeAll === 'connectionsCompany' && query.user) {
      CompanyModel.findOne({ uid: query.user }, function(err, prof) {
        if (err) {
          return callback(err);
        }
        var ids = [];
        var rids = [];
        if (prof.connections && prof.connections.products) {
          for (var i = 0; i < prof.connections.products.length; i++) {
            ids.push(prof.connections.products[i].refId);
          }
        }
        if (ids.length) {
          mongoQuery.$and.push({ _id: { $in: ids } });
        }
        callback(null, mongoQuery);
      });
    } else {
      callback(null, mongoQuery);
    }
  },
  // Modifiy results as required, depending on userData(premium/public etc)
  // Show only data which user has access to.
  processData: function(result, userData, callback) {
    console.log('Got Product search results');
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
  'productProfile',
  schema,
  'productProfiles'
);
module.exports = Model;
schema.post('init', function(doc) {
  doc.name = doc.displayName || doc.name;
});
schema.pre('save', function(next) {
  this.displayName = this.name;
  this.name = this.name.toLowerCase();
  if (this.uid) {
    return next();
  } else {
    var uid = (this.name || '').toLowerCase();
    if (!uid.length) {
      return next(new Error('Product Name not found!!'));
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
      idList: model.goodFor,
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
