/**
 * GET     /companyProfile             ->  index
 * POST    /companyProfile              ->  create
 * GET     /companyProfile/:id          ->  show
 * PUT     /companyProfile/:id          ->  update
 * DELETE  /companyProfile/:id          ->  destroy
 */
var _ = require('lodash');
var companyProfile = require('../../../models/companyProfile');
var async = require('async');
var utils = require('../../../models/util');
var masterModels = {
  speciality: require('../../../models/enterpriseSoftware'),
};
var companyPopulate = [
{ path: 'employees'},
{ path: 'headCount'},
{ path: 'annualRevenue'},
{ path: 'products'},
{ path: 'speciality'},
{ path: 'type'},
];
// Get list of companyprofiles
exports.index = function(req, res, next) {
  companyProfile.find(function(err, companyprofiles) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(companyprofiles);
    } else {
      res.locals.companyprofiles = companyprofiles;
      next();
    }
  });
};
// Get a single companyProfile
exports.show = function(req, res) {
  companyProfile.findById(req.params.id, function(err, companyprofile) {
    companyProfile.populate(companyprofile,
        companyPopulate,
            function(err, companyprofile) {
              if (err) {
                return handleError(res, err);
              }
              return res.json(201, companyprofile);
            });
  });
};
// Creates a new companyprofile in the DB.
exports.create = function(req, res) {
  companyProfile.create(req.body, function(err, companyprofile) {
    companyProfile.populate(companyprofile, companyPopulate,
            function(err, companyprofile) {
              if (err) {
                return handleError(res, err);
              }
              return res.json(201, companyprofile);
            });
  });
};

// Creates a new companyprofile in the DB.
exports.createAPI = function(data, cb) {
  console.log(data);
  companyProfile.create(data, function(err, data) {
    if (data) {
      // = global.MasterCollection.companies.push(data);
      // = global.MasterCollection.companiesDic[data._id] = data;
    }
    cb(err, data);
  });
};

// Past company
exports.addEditCompany = function(company, masterColComp, cb) {
  var result = _.findWhere(masterColComp, {name: company.name});
  if (result) {
    return cb(null, result);
  }else {
    masterColComp.push(company);
    exports.createAPI(company, function(err, res) {
      if (err) {
        cb(err);
      }else {
        cb(null, res);
      }
    });
  }
};
exports.getProfileByUId = function(req, cb) {
  companyProfile.findOne({
    uid: req.params.uid,
  }, function(err, profile) {
    console.log('===');
    console.log('===');
    companyProfile.populate(profile, companyPopulate, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};
// Updates an existing companyProfile in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  companyProfilefindById(req.params.id, function(err, companyprofile) {
    if (err) {
      return handleError(res, err);
    }
    if (!companyprofile) {
      return res.send(404);
    }
    var updated = _.merge(companyprofile, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, companyprofile);
    });
  });
};

exports.findByName = function(nm, cb) {
  companyProfile.findOne({name: nm.toLowerCase()}, cb);
};
exports.findById = function(id, cb) {
  companyProfile.findById(id, cb).lean();
};
exports.updateProfileByName = function(perosnalProfile, nm, cb) {
  if (perosnalProfile._id) {
    delete perosnalProfile._id;
  }
  var cmprNm = perosnalProfile.name?perosnalProfile.name.
  toLowerCase():nm.toLowerCase();
  companyProfile.findOne({name: cmprNm},
     function(err, profile1) {
       if (err) {
         return cb(err, null);
       }
       companyProfile.findOne({name: nm.toLowerCase()},
     function(err, profile) {
       if (err) {
         return cb(err, null);
       }
       if (!profile) {
         return cb('no record found', null);
       }
       if (throwErr(profile1, profile, cb)) {
         return cb('Company with that name already exists', null);
       }
       var user = profile;
       var userData = perosnalProfile;
       function insertNewEntry(tat, newEntry,
         userData, user, subDoc, entry, callback) {
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
        if (!tat[subDoc]) {
          return cb();
        }
        var entry = null;
        tat[subDoc] = tat[subDoc] &&
          Array.isArray(tat[subDoc])?tat[subDoc]:[tat[subDoc]];
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
                    insertNewEntry(tat, newEntry, userData,
                         user, subDoc, entry, callback);
                  }
                });
              });
            } else {
              callback();
            }
          }, cb);
      };
       updateMasterCollection(userData,
         'speciality', function() {
          var updated = _.merge(profile, perosnalProfile);
          profile = updated;
          profile.markModified('employees');
          profile.markModified('products');
          profile.markModified('admin');
          profile.markModified('companyLocations');
          profile.markModified('speciality');
          console.log(profile);
          profile.save(function(err, data) {
            console.log(data);
            if (err) {
              return cb(err, null);
            }
            return cb(null, data);
          });
        });
     });
     });
};
function throwErr(profile1, profile, cb) {
  if (profile1) {
    console.log(profile1._id + '--' + profile._id);
    if (!profile1._id.equals(profile._id)) {
      return true;
    }
    return false;
  }
}
// Deletes a companyProfile from the DB.
exports.destroy = function(req, res) {
  companyProfile.findById(req.params.id, function(err, companyprofile) {
    if (err) {
      return handleError(res, err);
    }
    if (!companyprofile) {
      return res.send(404);
    }
    companyprofile.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};
exports.deleteCompny = function(id, cb) {
  companyProfile.remove({_id: id}, function(err, res) {
    if (!err) {
      console.log('deleted');
      return cb(null, res);
    }else {
      console.log('error');
    }
  });
};
exports.getCompanyByName = function(name, cb) {
  console.log('+++++++++++++++++++++++++++++++++++++++');
  exports.findByName(name, cb);
};
function handleError(res, err) {
  return res.send(500, err);
}
exports.getComapnyDetailsById = function(arr, cb) {
  var companies = [];
  companyProfile.find({ _id: { $in: arr } }, function(err, docs) {
    if (err) {
      return cb(err);
    }
    for (var i = 0; i < docs.length; i++) {
      var company = {
        name: docs[i].uid,
        type: 'companies',
        logo: docs[i].log ? docs[i].logo : null,
      };
      companies.push(company);
    }
    cb(null, companies);
  });
};