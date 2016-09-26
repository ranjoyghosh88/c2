/**
 * GET     /Profile             ->  index
 * POST    /Profile              ->  create
 * GET     /profile/:id          ->  show
 * PUT     /profile/:id          ->  update
 * DELETE  /profile/:id          ->  destroy
 */
var _ = require('lodash');
var Profile = require('../../../models/personalProfile');
var companyProfile = require('../../../models/companyProfile');
var RelationType = require('../../../models/connectionRelation');
var utils = require('../../../models/util');
var async = require('async');
var masterModels = {
  enterpriseSoftwares: require('../../../models/enterpriseSoftware'),
  developmentSoftwares: require('../../../models/developmentSoftware'),
  vendorServices: require('../../../models/vendorService'),
  businessProcessAreas: require('../../../models/businessProcessArea'),
  functionalAreas: require('../../../models/functionalArea'),
  jobTitle: require('../../../models/jobTitle'),
};
var multiplePopulate = {
  path: 'developmentSoftwares' +
      ' vendorServices professionalLevel' +
      ' businessProcessAreas ' +
      'enterpriseSoftwares ' +
      'jobTitle functionalRole',
};
var opts = [{
    path: 'developmentSoftwares',
  }, {
    path: 'vendorServices',
  }, {
    path: 'professionalLevel',
  }, {
    path: 'businessProcessAreas',
  }, {
    path: 'enterpriseSoftwares',
  }, {
    path: 'jobTitle',
  }, {
    path: 'functionalRole',
  }, {
    path: 'followingProfiles.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
  }, {
    path: 'followers.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
  }, {
    path: 'company',
  }, {
    path: 'connections.profile',
  }, {
    path: 'connections.companies',
  },
  {
    path: 'connections.profiles.refId',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.companies.refId',
    model: 'companyProfile',
  },
  {
    path: 'connections.products.refId',
    model: 'productProfile',
  },
];
// Get list of profiles
exports.index = function(req, res) {
  Profile.find(function(err, profiles) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, profiles);
  });
};
// Get a single profile
exports.show = function(req, res) {
  Profile.findById(req.params.id, function(err, profile) {
    Profile.populate(profile, opts, function(err, profile) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, profile);
    });
  });
};
// Creates a new profile in the DB.
exports.create = function(req, res) {
  Profile.create(req.body, function(err, profile) {
    Profile.populate(profile, opts, function(err, profile) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, profile);
    });
  });
};
// Updates an existing profile in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Profile.findById(req.params.id, function(err, profile) {
    if (err) {
      return handleError(res, err);
    }
    if (!profile) {
      return res.send(404);
    }
    var updated = _.merge(profile, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, profile);
    });
  });
};
exports.updatePersonalProfile = function(perosnalProfile, perosnalID, cb) {
  if (perosnalProfile._id) {
    delete perosnalProfile._id;
  }
  Profile.findById(perosnalID, function(err, profile) {
    if (err) {
      return cb(err, null);
    }
    if (!profile) {
      return cb(err, null);
    }
    var updated = _.merge(profile, perosnalProfile);
    updated.save(function(err) {
      if (err) {
        return cb(err, null);
      }
      return cb(null, profile);
    });
  });
};
exports.updatePersonalProfileByEmail = function(perosnalProfile, emID, cb) {
  if (perosnalProfile._id) {
    delete perosnalProfile._id;
  }
  Profile.findOne({
    email: emID,
  },
        function(err, profile) {
    if (err) {
      return cb(err, null);
    }
    if (!profile) {
      return cb(err, null);
    }
    var updated = _.merge(profile, perosnalProfile);
    profile = updated;
    profile.markModified('businessProcessAreas');
    profile.markModified('enterpriseSoftwares');
    profile.markModified('developmentSoftwares');
    profile.markModified('vendorServices');
    profile.save(function(err, data) {
      console.log('profile updated===');
      if (err) {
        return cb(err, null);
      }
      return cb(null, data);
    });
  });
};
exports.updatePersonalProfileByUid = function(perosnalProfile, uid, cbk) {
  if (perosnalProfile._id) {
    delete perosnalProfile._id;
  }
  Profile.findOne({
    uid: uid,
  },
        function(err, profile) {
    if (err) {
      return cbk(err, null);
    }
    if (!profile) {
      return cbk(err, null);
    }
    var user = profile;
    var userData = perosnalProfile;
    function generateAccronyms(newEntry, subDoc, cb) {
      var accr = newEntry.name.substring(0, 3);
      masterModels[subDoc].count({
        accronym: {
          $regex: '^' + accr,
          $options: 'i',
        },
      }, function(err, c) {
        if (err) {
          return cb(err);
        }
        if (c > 0) {
          newEntry.accronym = accr + c;
        } else {
          newEntry.accronym = accr;
        }
        return cb(null, newEntry);
      });
    }
    function insertNewEntry(tat, newEntry, userData,
     user, subDoc, entry, callback) {
      newEntry.isExcluded = true;
      newEntry.save(function(err, data) {
        if (err) {
          return callback(err);
        }
        if (Array.isArray(userData[subDoc])) {
          userData[subDoc][tat[subDoc].indexOf(entry)] = data._id;
          user[subDoc] = userData[subDoc];
          user.markModified(subDoc);
        } else {
          userData[subDoc] = data._id;
          user[subDoc] = userData[subDoc];
        }
        callback(null, tat[subDoc]);
      });
    }
    var updateMasterCollection = function(tat, subDoc, cb) {
      if (tat[subDoc]) {
        var newEntry = null;
        var entry = null;
        if (subDoc === 'jobTitle') {
          entry = tat[subDoc];
          if (entry && isNaN(entry)) {
            masterModels[subDoc].count({}, function(err, c) {
              if (err) {
                return cb(err);
              }
              newEntry = new masterModels[subDoc]({
                name: entry,
                _id: parseInt(c) + 1,
              });
              masterModels[subDoc].findOne({ name: entry },
                 function(err, c1) {
                if (err) {
                  return cb(err);
                }
                if (c1) {
                  userData[subDoc] = c1._id;
                  user[subDoc] = userData[subDoc];
                  user.markModified(subDoc);
                  cb(null, tat[subDoc]);
                } else {
                  insertNewEntry(tat, newEntry, userData,
                 user, subDoc, entry, cb);
                }

              });
            });
          } else {
            cb();
          }
        } else {
          tat[subDoc] = Array.isArray(tat[subDoc])?tat[subDoc]:[tat[subDoc]];
          async.eachSeries(tat[subDoc], function(entry, callback) {
            var newEntry = null;
            if (entry && isNaN(entry)) {
              masterModels[subDoc].count({}, function(err, c) {
                if (err) {
                  return callback(err);
                }
                newEntry = new masterModels[subDoc]({
                  name: entry,
                  _id: parseInt(c) + 1,
                });
                masterModels[subDoc].findOne({ name: entry },
                 function(err, c1) {
                  if (err) {
                    return callback(err);
                  }
                  if (c1) {
                    userData[subDoc][tat[subDoc].indexOf(entry)] = c1._id;
                    user[subDoc] = userData[subDoc];
                    user.markModified(subDoc);
                    callback(null, tat[subDoc]);
                  } else {
                    if (subDoc === 'businessProcessAreas') {
                      generateAccronyms(newEntry, subDoc,
                     function(err, newEntry) {
                        if (err) {
                          return callback(err);
                        }
                        insertNewEntry(tat, newEntry, userData,
                     user, subDoc, entry, callback);
                      });
                    } else {
                      insertNewEntry(tat, newEntry, userData,
                   user, subDoc, entry, callback);
                    }
                  }

                });
              });
            } else {
              callback();
            }
          }, cb);
        }
      } else {
        cb();
      }
    };
    async.parallel([
      function(cb) {
        updateMasterCollection(userData, 'developmentSoftwares', function() {
          cb();
        });
      },
      function(cb) {
        updateMasterCollection(userData, 'enterpriseSoftwares', function() {
          cb();
        });
      },
      function(cb) {
        updateMasterCollection(userData, 'vendorServices', function() {
          cb();
        });
      },
      function(cb) {
        updateMasterCollection(userData, 'businessProcessAreas', function() {
          cb();
        });
      },
      function(cb) {
        updateMasterCollection(userData, 'jobTitle', function() {
          cb();
        });
      },
    ],
    function(err , cb) {
      if (err) {
        return cbk(err);
      }
      if (perosnalProfile && perosnalProfile.currentCompany) {
        perosnalProfile.company = [perosnalProfile.currentCompany];
      }
      var updated = _.extend(user, perosnalProfile);
      user = updated;
      if (perosnalProfile && perosnalProfile.currentCompany) {
        user.markModified('currentCompany');
        if (checkExist(user.connections.companies, 31,
         perosnalProfile.currentCompany) === 0) {
          user.connections.companies.push({
            relation: 'Employer', connectionStatus: 'APPROVED',
            refId: perosnalProfile.currentCompany, relationId: 31,
          });
        }
        user.markModified('connections.companies');
      }
      (function() {
        user.markModified('businessProcessAreas');
        user.markModified('enterpriseSoftwares');
        user.markModified('developmentSoftwares');
        user.markModified('vendorServices');
      })();
      user.save(function(err, data) {
        if (err) {
          return cbk(err, null);
        }
        data.name = data.displayName; data.lastName = data.displayLastName;
        if (perosnalProfile && perosnalProfile.currentCompany) {
          companyProfile.findOne({ _id: perosnalProfile.currentCompany },
           function(err, com) {
            if (err) {
              return cbk(err, null);
            }
            if (checkExist(com.connections.profiles, 31, user._id) === 0) {
              com.connections.profiles.push({
                relation: 'Employee',
                connectionStatus: 'APPROVED',
                refId: user._id, relationId: 31,
              });
            }
            com.markModified('connections.profiles');
            com.save(function(err, doc) {
              if (err) {
                return cbk(err, null);
              }
              return cbk(null, data);
            });
          });
        } else {
          return cbk(null, data);
        }
      });
    });
  });
};

var checkExist = function(connectionData, relationid, refid) {
  return _.filter(connectionData, {
    refId: refid,
    relationId: relationid,
  }).length;
};

exports.updatePastcompany = function(pastCompany, id, cb) {
  Profile.update(
    id, {
      $addToSet: {
        pastCompany: pastCompany,
      },
    }, {
      safe: true,
    },
        function(err, profile) {
      console.log(err);
      if (err) {
        return cb(err, null);
      }
      return cb(null, profile);
    }
  );

};
exports.updateProduct = function(product, id, cb) {
  Profile.update(
    id, {
      $addToSet: {
        products: product,
      },
    }, {
      safe: true,
    },
       cb
  );
};
/* = exports.userProfileView = function(id,
 pictureUrl, uid, fullName, dateViewed, cb) {
  var query = { uid: id };
  var options = {};
  var profileView = {
              pictureUrl: pictureUrl,
              uid: uid,
              name: fullName,
            }
  Profile.update(
      query,
      {$push: {profileView: profileView}},
      {safe: true},
    function(err, profile) {
      console.log(err);
      console.log(profile);
      if (err) {
        return cb(err, null);
      }
      return cb(null, profile);
    }
);
};
*/
exports.insertGuestUser = function(app) {
  Profile.update({ email: 'guest@user.com' },
   {
    uid: 'guest',
    name: 'Anonymous',
    lastName: 'User',
    email: 'guest@user.com',
    accountStatus: 'ENABLED',
    pictureUrl: '/anonymous.jpg',
  }, {
    upsert: true,
  }, function(err, profile) {
    if (err) {
      return err;
    }
    Profile.findOne({ name: 'Anonymous' }, function(err, _profile) {
      if (err) {
        return handleError(err);
      }
      global.guestUserId = _profile._id;
    });
  });
};
exports.userProfileView = function(uid, id, cb) {
  var query = {
    uid: uid,
  };
  var date = new Date();
  var options = {};
  Profile.update(
    query, {
      $push: {
        profileView: {
          dateViewed: date.toUTCString(),
          ProfileData: id,
        },
      },
    }, {
      safe: true,
    },
        function(err, profile) {
      console.log(err);
      if (err) {
        return cb(err, null);
      }
      return cb(null, profile);
    }
  );
};

exports.getProfileByEmail = function(email, cb) {
  Profile.findOne({
    email: email,
  },
        function(err, profile) {
    Profile.populate(
      profile, multiplePopulate,
                function(err, profile) {
        if (err) {
          return cb(null);
        }
        return cb(profile);
      });
  });
};
exports.getProfileById = function(req, cb) {
  Profile.findById(req.params.id, function(err, profile) {
    Profile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};

exports.createAccount = function(req, cb) {
  Profile.create(req, function(err, profile) {
    Profile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(err, null);
      }
      return cb(null, profile);
    });
  });
};
exports.getProfileByUId = function(req, cb) {
  Profile.findOne({
    uid: req.params.uid,
  }, function(err, profile) {
    Profile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};
// Deletes a profile from the DB.
exports.destroy = function(req, res) {
  Profile.findById(req.params.id, function(err, profile) {
    if (err) {
      return handleError(res, err);
    }
    if (!profile) {
      return res.send(404);
    }
    profile.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

var CompanyModel = require('../../../models/companyProfile');
var ProductModel = require('../../../models/productProfile');
var getModelByType = function(type) {
  switch (type) {
    case 'people': {
      return { Model: Profile, type: 'profiles' };
    }
    case 'company': {
      return { Model: CompanyModel, type: 'companies' };
    }
    case 'product': {
      return { Model: ProductModel, type: 'products' };
    }
  }
};

exports.setFavouritesApi = function(loggedUid, favUid, type, isAdd, callback) {
  isAdd = isAdd === 'true';
  async.parallel({
    loggedUser: function(cb) {
      Profile.findOne({ uid: loggedUid }, cb);
    },
    fav: function(cb) {
      var data = getModelByType(type);
      if (!data) {
        return cb(new Error('Type not found!!'));
      }
      data.Model.findOne({ uid: favUid }, function(err, obj) {
        cb(err, err || !obj ?null:{
          doc: obj,
          type: data.type,
        });
      });
    },
  }, function(err, res) {
    if (err) {
      return callback(err);
    }
    if (!res.loggedUser || !res.fav) {
      return callback(new Error('not found!!'));
    }
    async.parallel([
      function(cb) {
        var toPush = {};
        toPush['favourites.' + res.fav.type] = res.fav.doc._id;
        if (isAdd) {
          res.loggedUser.update({ $addToSet: toPush }, cb);
        } else {
          res.loggedUser.update({ $pull: toPush }, cb);
        }
      },
      function(cb) {
        if (isAdd) {
          res.fav.doc.update({
            $addToSet: {
              favouritedBy: res.loggedUser._id,
            },
          }, cb);
        } else {
          res.fav.doc.update({
            $pull: {
              favouritedBy: res.loggedUser._id,
            },
          }, cb);
        }
      }, ], function(err, res) {
      return callback(err, err?null:true);
    });
  });
};

// Fetching relation data for UI

exports.fetchRelationData = function(loggedUid,
 conUid, connectionFromType, connectionToType, callback) {
  async.parallel({
    loggedUser: function(cb) {
      Profile.findOne({ uid: loggedUid }, cb);
    },
    con: function(cb) {
      var data = getModelByType(connectionToType);
      if (!data) {
        return cb(new Error('Type not found!!'));
      }
      data.Model.findOne({ uid: conUid }, function(err, obj) {
        cb(err, err || !obj ? null : {
          doc: obj,
          type: data.type,
        });
      });
    },
    relationTypes: function(cb) {
      RelationType.find({
        connectionFrom: connectionFromType,
        connectionTo: connectionToType,
      }, cb);
    },
  }, function(err, res) {
    if (err) {
      return callback(err);
    }
    if (!res.loggedUser || !res.con) {
      return callback(new Error('not found!!'));
    }
    console.log(res.relationTypes);
    callback(null, res);
  });
};

// Connection API
exports.setConnectionsApi = function(loggedUid,
 conUid, connectionFromType, connectionToType, connectAs, connectedAs,
 isAdd, isMail, callback) {
  isAdd = isAdd === 'true';
  async.parallel({
    loggedUser: function(cb) {
      Profile.findOne({ uid: loggedUid }, cb);
    },
    con: function(cb) {
      var data = getModelByType(connectionToType);
      if (!data) {
        return cb(new Error('Type not found!!'));
      }
      data.Model.findOne({ uid: conUid }, function(err, obj) {
        cb(err, err || !obj ? null : {
          doc: obj,
          type: data.type,
        });
      });
    },
  }, function(err, res) {
    if (err) {
      return callback(err);
    }
    if (!res.loggedUser || !res.con) {
      return callback(new Error('not found!!'));
    }
    async.series([
      function(cb) {
        var data = getModelByType(connectionToType);
        if (!data) {
          return cb(new Error('Type not found!!'));
        }
        var profileType = data.type;
        var toPush = {
          relation: connectedAs,
          connectionDate: (new Date()).toUTCString(),
          connectionStatus: utils.EnumConnectionStatus.APPROVED,
          refId: res.con.doc._id,
        };
        if (isAdd) {
          (function() {
            var temp = {};
            temp['connections.' + profileType] = toPush;
            arr = res.loggedUser.connections.profiles.concat(res.loggedUser
          .connections.companies).concat(res.loggedUser.connections.products);
            var p = _.filter(arr, _.matches({ refId: res.con.doc._id }));
            if (!p.length) {
              res.loggedUser.update({ $addToSet: temp, }, cb);
            } else {
              return cb(true);
            }
          })();
        } else {
          temp = {};
          temp['connections.' + profileType] = { refId: res.con.doc._id };
          res.loggedUser.update({ $pull: temp }, cb);
        }
      },
      function(cb) {
        var data = getModelByType(connectionFromType);
        if (!data) {
          return cb(new Error('Type not found!!'));
        }
        var profileType = data.type;
        var toPush = {
          relation: connectAs,
          connectionDate: (new Date()).toUTCString(),
          connectionStatus: utils.EnumConnectionStatus.APPROVED,
          refId: res.loggedUser._id,
        };
        (function() {
          if (isAdd) {
            var temp = {};
            temp['connections.' + profileType] = toPush;
            arr = res.con.doc.connections.profiles.concat(res.con.doc
          .connections.companies).concat(res.con.doc.connections.products);
            var p = _.filter(arr, _.matches({ refId: res.con.doc._id }));
            if (!p.length) {
              res.con.doc.update({ $addToSet: temp, }, cb);
            } else {
              console.log('already there');
              return cb(true);
            }
          } else {
            temp = {};
            temp['connections.' +
                 profileType] = { refId: res.loggedUser._id };
            res.con.doc.update({ $pull: temp }, cb);
          }
        })();
      },
    ], function(err, result) {
      if (err === true) {
        return callback(null, null, true);
      }
      return callback(err, err?null:true);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
