var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var profileSchema = require('../profileSchema');
var SearchPlugin = require('../mongoose-search-plugin');
var _ = require('lodash');
var util = require('../util');
var async = require('async');
var MasterCollection = {
  functionalRole: require('../functionalRole'),
  professionalLevel: require('../professionalLevel'),
  developmentSoftware: require('../developmentSoftware'),
  businessProcessArea: require('../businessProcessArea'),
  enterpriseSoftware: require('../enterpriseSoftware'),
  vendorService: require('../vendorService'),
};
var CompanyModel = require('../companyProfile');
var productModel = require('../productProfile');
var connectionRelations = require('../connectionRelation');
var RelationSchema = new Schema({
  relation: {
    type: String,
    refinement: {
      header: 'Connection Type',
      isMultiple: true,
      name: 'personrelation',
      masterColleName: 'relationTypes',
      autoSelectAll: false,
      order: 10,
      refModel: {
        ref: 'relationTypes',
        searchFieldName: 'connectedAs',
        projectionField: 'connectAs',
      },
    },
    isSearchable: {
      searchField: 'connectedAs',
      masterColleName: 'relationTypes',
    },
  },
  connectionDate: Date,
  connectionStatus: String,
  refId: Schema.Types.ObjectId,
});

var schema = profileSchema.extend({
  path: { type: String, isSearchable: true },
  email: { type: String, isSearchable: true },
  displayName: String,
  displayLastName: String,
  name: {
    type: String, required: true,
    jVal: JSON.stringify({
      rule: { name: 'required' },
      message: { name: 'First Name is required' },
    }),
    isSearchable: true,
  },
  lastName: {
    type: String, required: true,
    jVal: JSON.stringify({
      rule: { lastName: 'required' },
      message: { lastName: 'Last Name is required' },
    }),
    isSearchable: true,
  },
  profileId: String,
  professionalLevel: {
    type: Number,
    ref: 'professionalLevel',
    refinement: {
      header: 'Level',
      isMultiple: true,
      masterColleName: 'professionalLevel',
      name: 'levels',
      order: 3,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'professionalLevel',
    },
  },
  businessProcessAreas: [{
      type: Number,
      ref: 'businessProcessArea',
      refinement: {
        header: 'Business Process Knowledge',
        isMultiple: true,
        masterColleName: 'businessProcessArea',
        name: 'bpa',
        order: 5,
      },
    },
  ],
  functionalAreas: [{
      type: Number,
      ref: 'functionalArea',
      refinement: {
        header: 'Functional Areas',
        isMultiple: true,
        masterColleName: 'functionalArea',
        name: 'fa',
        order: 15,
      },
    },
  ],
  enterpriseSoftwares: [{
      type: Number,
      ref: 'enterpriseSoftware',
      refinement: {
        header: 'Enterprise Softwares',
        isMultiple: true,
        masterColleName: 'enterpriseSoftware',
        name: 'epsoft',
        order: 6,
      },
    },
  ],
  developmentSoftwares: [{
      type: Number,
      ref: 'developmentSoftware',
      refinement: {
        header: 'Software Knowledge',
        isMultiple: true,
        masterColleName: 'developmentSoftware',
        name: 'softwaredevs',
        order: 4,
      },
    },
  ],
  vendorServices: [{
      type: Number,
      ref: 'vendorService',
      refinement: {
        header: 'Vendor Service',
        isMultiple: true,
        masterColleName: 'vendorService',
        name: 'vservice',
        order: 7,
      },
    },
  ],
  jobTitle: {
    type: Number,
    ref: 'jobTitle',
    isSearchable: {
      searchField: 'name',
      masterColleName: 'jobTitle',
    },
    refinement: {
      header: 'Job Title',
      isMultiple: true,
      masterColleName: 'jobTitle',
      name: 'jobTitle',
      order: 18,
    },
  },
  location: {
    type: String,
    refinement: {
      header: 'Location',
      isMultiple: false,
      name: 'location',
      order: 1,
    },
    isSearchable: true,
  },
  functionalRole: {
    type: Number,
    ref: 'functionalRole',
    refinement: {
      header: 'Role',
      isMultiple: true,
      masterColleName: 'functionalRole',
      name: 'roles',
      order: 2,
    },
    isSearchable: {
      searchField: 'name',
      masterColleName: 'functionalRole',
    },
  },
  pictureUrl: String,
  company: [{
      type: Schema.Types.ObjectId,
      ref: 'companyProfile',
      required: true,
      jVal: JSON.stringify({
        rule: { currentCompany: 'required' },
        message: { currentCompany: 'Current Company is required' },
      }),
      refinement: {
        header: 'Current Company',
        isTypehead: {
          masterName: 'company',
        },
        name: 'curComp',
        order: 8,
        refModel: {
          ref: 'companyProfile',
          searchFieldName: 'name',
        },
      },
    },
  ],
  noteToCommunity: String,
  products: [{
      type: Schema.Types.ObjectId,
      ref: 'productProfile',
    }, ],
  pastCompany: [{
      type: Schema.Types.ObjectId,
      ref: 'companyProfile',
      refinement: {
        header: 'Past Company',
        isMultiple: false,
        name: 'pastComp',
        order: 9,
        refModel: {
          ref: 'companyProfile',
          searchFieldName: 'name',
        },
      },
    },
  ],
  favourites: {
    companies: [{
        type: Schema.Types.ObjectId,
      }, ],
    products: [{
        type: Schema.Types.ObjectId,
      }, ],
    profiles: [{
        type: Schema.Types.ObjectId,
      }, ],
  },
  claimed: {
    companies: [Schema.Types.ObjectId],
    products: [Schema.Types.ObjectId],
  },
  topManagement: Boolean,
  accountStatus: {
    type: String,
    default: util.EnumAccountStatus.UNVERIFIED,
  },
  phoneNumber: String,
  /* = profileView: [{
    pictureUrl: String,
    uid: String,
    name: String,
    dateViewed: { type: Date, required: true, default: Date.now },
  }],*/
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
  profileView: [{
      dateViewed: Date,
      optionIn: {
        type: String,
        default: 'ProfileData',
      },
      ProfileData: {
        type: Schema.Types.ObjectId,
        ref: 'personalProfile',
        refinement: {
          header: 'Who Viewed Your Profile',
          isMultiple: false,
          name: 'Who Viewed Your Profile',
          order: 10,
          refModel: {
            ref: 'personalProfile',
            searchFieldName: 'name lastName',
            requireLoggedIn: true,
          },
        },
        isSearchable: true,
      },
    }, ],
  followers: {
    companies: [Schema.Types.ObjectId],
    products: [Schema.Types.ObjectId],
    profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'personalProfile',
        refinement: {
          header: 'Followers',
          isMultiple: false,
          name: 'followers',
          order: 10,
          refModel: {
            ref: 'personalProfile',
            searchFieldName: 'name lastName',
            requireLoggedIn: true,
          },
        },
      }, ],
  },
  followingProfiles: {
    companies: [{
        type: Schema.Types.ObjectId,
        ref: 'companyProfile',
      }, ],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'productProfile',
      }, ],
    profiles: [{
        type: Schema.Types.ObjectId,
        ref: 'personalProfile',
        refinement: {
          header: 'Followings',
          isMultiple: false,
          name: 'followings',
          order: 10,
          refModel: {
            ref: 'personalProfile',
            searchFieldName: 'name lastName',
            requireLoggedIn: true,
          },
        },
      }, ],
  },
});
/* -
 * for parent: //(.*)area(.*)//
 * for skill :([^/])*([\w\s$&+,:;=?@#|'<>.^*()%!-]*my
 * [\w\s$&+,:;=?@#|'<>.^*()%!-]*)//exact match
 * */

var multiplePopulate = {
  path: 'developmentSoftwares' +
    ' vendorServices professionalLevel' +
    ' businessProcessAreas ' +
    'enterpriseSoftwares ' +
    'jobTitle functionalRole ' +
    'company',
};

schema.plugin(SearchPlugin, {
  beforeExecQuery: function(query, mongoQuery, callback) {
    if (mongoQuery && mongoQuery.$and && mongoQuery.$and.length) {
      if (query.seeAll !== 'Who Viewed Your Profile') {
        mongoQuery.$and.push({ accountStatus: util.EnumAccountStatus.ENABLED });
        mongoQuery.$and.push({ email: { $ne: 'guest@user.com' } });
      } else {
        mongoQuery.$and.push({ accountStatus: util.EnumAccountStatus.ENABLED });
      }
    }
    if (query.seeAll === 'connections' && query.user) {
      (function() {
        var pro = Model;
        if (query.connectionFrom === 'product') {
          pro = require('../productProfile');
        } else if (query.connectionFrom === 'company') {
          pro = require('../companyProfile');
        }
        pro.findOne({ uid: query.user }, function(err, prof) {
          if (err || !prof) {
            return callback(err ||
             { message: 'Resource not found', status: 404 });
          }
          var ids = [];
          var rids = [];
          if (prof.connections && prof.connections.profiles) {
            for (var i = 0; i < prof.connections.profiles.length; i++) {
              rids.push(_.pick(prof.connections.profiles[i], 'refId'));
              if (prof.connections.profiles[i].
               connectionStatus === 'APPROVED') {
                ids.push(rids[i].refId);
              }
            }
          }
          if (ids.length) {
            mongoQuery.$and.push({ _id: { $in: ids } });
            mongoQuery.$and.push({
              accountStatus: util.EnumAccountStatus.ENABLED,
            });
            mongoQuery.$and.push({ email: { $ne: 'guest@user.com' } });
          }
          callback(null, mongoQuery);
        });
      })();
    } else if (query.seeAll === 'Employees' && query.user) {
      (function() {
        CompanyModel.findOne({ uid: query.uid }, function(err, prof) {
          if (err) {
            return callback(err);
          }
          var ids = [];
          var rids = [];
          if (prof.employees) {
            for (var i = 0; i < prof.employees.length; i++) {
              ids.push(prof.employees[i]);
            }
          }
          if (ids.length) {
            mongoQuery.$and.push({ _id: { $in: ids } });
          }
          callback(null, mongoQuery);
        });
      })();
    } else if (query.seeAll === 'favourites' && query.user) {
      (function() {
        Model.findOne({ uid: query.user }, function(err, prof) {
          if (err) {
            return callback(err);
          }
          var ids = [];
          var rids = [];
          if (prof.favourites && prof.favourites.profiles) {
            for (var i = 0; i < prof.favourites.profiles.length; i++) {
              ids.push(prof.favourites.profiles[i]);
            }
          }
          if (ids.length) {
            mongoQuery.$and.push({ _id: { $in: ids } });
            mongoQuery.$and.push({
              accountStatus: util.EnumAccountStatus.ENABLED,
            });
            mongoQuery.$and.push({ email: { $ne: 'guest@user.com' } });
          }
          callback(null, mongoQuery);
        });
      })();
    } else if (query.seeAll === 'similarProffessionals' && query.uid) {
      (function() {
        mongoQuery.$and.push({ uid: { $ne: query.uid } });
        var $or = [];
        if (query.jTitle) {
          $or.push({
            jobTitle: query.jTitle,
          });
        }
        if (query.Proflevels) {
          $or.push({
            professionalLevel: query.Proflevels,
          });
        }
        if (query.farea) {
          $or.push({
            functionalAreas: query.farea,
          });
        }
        mongoQuery.$and.push({ $or: $or });
        callback(null, mongoQuery);
      })();
    } else if (query.seeAll === 'Product Experts' && query.uid) {
      (function() {
        productModel.findOne({ uid: query.uid }, function(err, prod) {
          if (err || !prod || !prod.connections || !prod.connections.profiles) {
            return callback(err ||
             { message: 'Resource not found', status: 404 });
          }
          var reltns = _.map(_.filter(prod.connections.profiles,
             function(obj) {
            if (obj.refId) {
              return obj.relation.toLowerCase() === 'technology expert';
            }
          }), 'refId');
          mongoQuery.$and.push({ _id: { $in: reltns } });
          mongoQuery.$and.push({
            accountStatus: util.EnumAccountStatus.ENABLED,
          });
          mongoQuery.$and.push({ email: { $ne: 'guest@user.com' } });
          callback(null, mongoQuery);
        });
      })();
    } else {
      callback(null, mongoQuery);
    }
  },
  // Modifiy results as required, depending on userData(premium/public etc)
  // Show only data which user has access to.
  processData: function(result, userData, callback) {
    this.populate(result.data, multiplePopulate, function(err, data) {
      result.data = data;
      for (var iIndex = 0; iIndex < result.data.length; iIndex++) {
        result.data[iIndex] =
        util.deepPick(result.data[iIndex].toJSON(), _.defaults({}, userData));
      }
      callback(err, result);
    });
  },
});

var Model = mongoose.model(
  'personalProfile',
  schema,
  'personalProfiles'
);
module.exports = Model;


var savePath = function(model, callback) {
  var populateFields = [{
      Model: MasterCollection.businessProcessArea,
      idList: model.businessProcessAreas,
    },
  {
      Model: MasterCollection.enterpriseSoftware,
      idList: model.enterpriseSoftwares,
    },
    {
      Model: MasterCollection.developmentSoftware,
      idList: model.developmentSoftwares,
    },
    {
      Model: MasterCollection.vendorService,
      idList: model.vendorServices,
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
var saveUID = function(model, callback) {
  if (model.uid) {
    return callback();
  } else {
    var uid = (model.name || '') + '.' + (model.lastName || '');
    if (!uid.length) {
      return callback(new Error('Profile Name not found!!'));
    }
    uid = util.getStringForUId(uid);
    var tat = model;
    util.getUid(Model, uid, { uid: uid }, 0, function(err, resUid) {
      if (err) {
        return callback(err);
      }
      tat.uid = resUid;
      callback();
    });
  }
};
schema.post('init', function(doc) {
  doc.name = doc.displayName || doc.name;
  doc.lastName = doc.displayLastName || doc.lastName;
});
schema.pre('save', function(next) {
  if (this.professionalLevel &&
    this.professionalLevel._id === 1) {
    this.topManagement = false;
  } else {
    this.topManagement = true;
  }
  next();
});

schema.pre('update', function(next) {
  if (this.professionalLevel._id === 1) {
    this.topManagement = false;
  } else {
    this.topManagement = true;
  }
  next();
});


schema.pre('save', function(next) {
  var tat = this;
  this.displayName = this.name;
  this.displayLastName = this.lastName;
  this.name = this.name.toLowerCase();
  this.lastName = this.lastName.toLowerCase();
  async.parallel([
    function(cb) {
      savePath(tat, cb);
    },
    function(cb) {
      saveUID(tat, cb);
    },
  ], next);
});
