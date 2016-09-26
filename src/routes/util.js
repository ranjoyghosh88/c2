var cloudinary = require('cloudinary');
var _ = require('lodash');
var allRouter = '../routes/api';
var connectionRelationController = require(allRouter + '/connectionRelation/' +
  'controller');
var api = require('../routes/csquire-api/');
var async = require('async');
var queryParam = require('node-jquery-param');
var mongoose = require('mongoose');
exports.uploadImage = function(path, cb) {
  cloudinary.uploader.upload(path, function(result) {
    if (result) {
      return cb(null, result);
    } else {
      return cb('err', null);
    }
  });
};
exports.uploadBase64Image = function(path, cb) {
  cloudinary.uploader.upload('data:image/gif;base64,' + path, function(result) {
    if (result) {
      return cb(null, result);
    } else {
      return cb('err', null);
    }
  });
};

exports.formatTextCapitalize = function(x) {
  return x.replace(/\b\w/g , function(m) { return m.toUpperCase(); });
};

// Past company and product code ends
exports.shuffle = function(array) {
  array = array || [];
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

exports.setUserSessionVars = function(name, lastName, pictureUrl, req) {
  req.session.username = name + ' ' + lastName;
  req.session.Img = pictureUrl;
  console.log(req.session.username);
  return;
};
var CompanyModel = require('../models/companyProfile');
var ProductModel = require('../models/productProfile');
var PersonalModel = require('../models/personalProfile');
exports.search = function(req, res, next) {
  var regEx = new RegExp('^' + req.query.q, 'i');
  if (req.params.type === 'productProfile') {
    CompanyModel.find({
      name: {
        $regex: regEx,
        $options: 'i',
      },
    }).select('name').sort('name').lean().
    exec(function(err, data) {
      if (err) {
        return res.status(500).send(err.message);
      }
      for (var iIndex = 0; iIndex < data.length; iIndex++) {
        data[iIndex]._id = data[iIndex].name;
      }
      res.send(data);
    });
  } else if (req.params.type === 'addOrFindCompany') {
    CompanyModel.find({
      name: {
        $regex: regEx,
        $options: 'i',
      },
    }).select('name').sort('name').lean().
    exec(function(err, data) {
      if (err) {
        return res.status(500).send(err.message);
      }
      for (var iIndex = 0; iIndex < data.length; iIndex++) {
        data[iIndex]._id = data[iIndex].name;
      }
      data.push({ _id: req.query.q, isNew: true, name: req.query.q });
      res.send(data);
    });
  } else if (req.params.type === 'company') {
    CompanyModel.find({
      name: {
        $regex: regEx,
        $options: 'i',
      },
    }).select('name').sort('name').lean().
    exec(function(err, data) {
      if (err) {
        return res.status(500).send(err.message);
      }
      for (var iIndex = 0; iIndex < data.length; iIndex++) {
        data[iIndex]._id = data[iIndex].name;
      }
      res.send(data);
    });
  } else if (req.params.type === 'selectCompany') {
    CompanyModel.find({
      name: {
        $regex: regEx,
        $options: 'i',
      },
    }).select('_id name').sort('name').lean().
    exec(function(err, data) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.send(data);
    });
  }else {
    master = global.MasterCollection[req.params.type] || [];
    var searchResults = _(master).
  filter(function(character) {
    return character.name.match(regEx);
  }).value();
    if (req.params.type === 'jobTitle') {
      searchResults.push({ _id: req.query.q, name: req.query.q });
    }
    res.send(searchResults);
  }
};

// = -----------------------------------------
exports.searchToAdd = function(req, res, next) {
  var Model;
  switch (req.params.type) {
    case 'productProfile': {
      Model = ProductModel;
      break;
    }
    case 'compnayProfile': {
      Model = CompanyModel;
      break;
    }
    case 'personalProfile': {
      Model = PersonalModel;
      break;
    }
  }
  req.query.q = req.query.q.trim();
  var mongoQuery = {$and: [getQuery('name', req.query.q)]};

  (function() {
    if (req.params.type === 'personalProfile') {
      var arr = req.query.q.split(' ');
      if (arr.length > 1) {
        mongoQuery.$and.shift();
        mongoQuery.$and.push(getQuery('name', arr.shift()));
        mongoQuery.$and.push(getQuery('lastName', arr.join(' ')));
      }
      mongoQuery.$and.push({ accountStatus: 'ENABLED' });
      mongoQuery.$and.push({ email: { $ne: 'guest@user.com' } });
      mongoQuery.$and.push({ uid: { $ne: req.session.uid } });
    }
  })();

  Model
  .find(mongoQuery).sort('name lastName').lean().
  exec(function(err, data) {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (data.length) {
      res.send(data);
    } else {
      data = {
        isNew: true,
        item: req.query.q,
      };
      res.send(data);
    }
  });
};
exports.removeNullRelationUser = function(profiles) {
  if (profiles) {
    profiles = _.filter(profiles, function(profil) {
      return profil.refId != null;
    });
  }
  return profiles;
};

exports.removeDuplicate = function(myArray, profile) {
  myArray = exports.removeNullRelationUser(myArray);
  // AfterResult(myArray, profile);
  var uniqConnection = _.uniq(myArray, 'refId._id');
  _.each(uniqConnection, function(val, key) {
    uniqConnection[key].relation = _.uniq(
      _.pluck(_.filter(myArray, function(obj) {
      return obj.refId._id === val.refId._id;
    }), 'relation')).join(', ');
  });
  return uniqConnection;
};

function setRelation(profileId, connectedProfile) {
  if (connectedProfile) {
    return _.uniq(_.pluck(_.filter(connectedProfile,
            { refId: profileId }), 'relation')).join(', ');
  }
  return '';
}

var getModelByType = function(type) {
  switch (type) {
    case 'personalProfile': {
      return 'profiles';
    }
    case 'companyProfile': {
      return 'companies';
    }
    case 'productProfile': {
      return 'products';
    }
  }
};

function afterResult(searchData, connectedProfile) {
  if (!connectedProfile) {
    return;
  }
  var connectFrom = getModelByType(connectedProfile.__t);
  var tempArr = _.pluck(searchData, 'refId');
  _.each(tempArr, function(data, index) {
    if (data.connections && connectedProfile.connections) {
      if (data.connections[connectFrom]) {
        searchData[index].relation = setRelation(connectedProfile._id,
                         data.connections[connectFrom]);
      }
    }
  });
}

exports.removeDuplicateForPeople = function(myArray, id) {
  myArray = exports.removeNullRelationUser(myArray);
  var getUniq = _.uniq(myArray, 'refId._id');
  if (getUniq.length) {
    _.each(getUniq, function(val, key) {
      getUniq[key].relation = _.uniq(_.pluck(
        _.filter(val.refId.connections.profiles,
           { refId: id }), 'relation')).join(', ');
    });
  }
  return getUniq;
};

exports.setRelationForProfile = function(profileConnection, profileId, type) {
  return _.filter(profileConnection.refId.connections[type],
               { refId: profileId });
};

function getQuery(field, query) {
  var q = {};
  var regx = new RegExp('^' + query, 'i');
  q [field] = { $regex: regx, $options: 'i' };
  return q;
}
// = -----------------------------------------
exports.clearSearchQuery = function(input) {
  input = _.isArray(input) && input.length?input[0]:input;
  if (input) {
    input = input.replace(/[^\w\s\.]/gi, '');
  }
  if (!/[a-z0-9]/gi.test(input)) {
    return '';
  }
  return input;
};
/* =
exports.clientsProduct = function(req, profile, cb1) {
  profile.connections.companies = _.filter(profile.connections.companies,
   function(obj) {
     return obj.connectionStatus === 'APPROVED';
   });
  if (profile && profile.connections.companies &&
                      (req.session.customdata.
                      productConnectionType !== undefined)) {
    var _idConfiguration = req.session.customdata.
                      productConnectionType.clients._id;
    connectionRelationController.getRelationById(
   _idConfiguration, function(err, data) {
     if (err) {
       return res.status(404).send(err.message);
     }
     if (data) {
       var pastClietMgmtArray = [];
       pastClietMgmtArray = _.filter(
        profile.connections.companies,
                            function(obj) {
                              for (var ind = 0; ind < data.length; ind++) {
                                if (obj.relation === data[ind].connectedAs) {
                                  return true;
                                }
                              }
                              return false;
                            });
       return cb1(pastClietMgmtArray);
     } else {
       return cb1(null);
     }
     console.log('-------------->>>>>>>>>>>>>>');
     console.log(profile.connections.companies);
   });
  } else {
    return cb1(null);
  }
};
*/

function getCustomdataConType(type) {
  var customDatConType;
  switch (type) {
    case 'companyProfile': {
      customDatConType = 'companyConnectionType';
      break;
    }
    case 'productProfile': {
      customDatConType = 'productConnectionType';
      break;
    }
    case 'personalProfile': {
      customDatConType = 'connectionType';
      break;
    }
  }
  return customDatConType;
}

exports.pastClietMgmt = function(req, profile, cb1) {
  profile.connections.companies = _.filter(profile.connections.companies,
   function(obj) {
    return obj.connectionStatus === 'APPROVED';
  });
  var conType = getCustomdataConType(profile.__t);
  if (profile && profile.connections.companies &&
              (req.session.customdata[conType] !== undefined)) {
    var _idConfiguration = req.session.customdata[conType]
                                      .pastClient._id;
    connectionRelationController.getRelationById(
      _idConfiguration, function(err, data) {
        if (err) {
          return res.status(404).send(err.message);
        }
        if (!data) {
          return cb1(null);
        }
        var pastClietMgmtArray = exports.setPopulate(
          profile.connections.companies, data);
        return cb1(exports.getSlicedData(pastClietMgmtArray));
      });
  } else {
    return cb1(null);
  }
};

exports.specializationMgmt = function(req, profile, cb2) {
  if (profile && profile.connections.products &&
                              (req.session.customdata.
                                  connectionType !== undefined)) {
    var _idConfiguration2 = req.session.customdata.
                                          connectionType.specialisation._id;
    connectionRelationController.getRelationById(
   _idConfiguration2, function(err, data) {
     if (err) {
       return res.status(404).send(err.message);
     }
     if (data) {
       return cb2(exports.setPopulate(
         profile.connections.products, data));
     } else {
       return cb2(null);
     }
   });
  } else {
    return cb2(null);
  }
};
// =======================================================
exports.getColleague = function(req, profile, cb1) {
  profile.connections.profiles = _.filter(profile.connections.profiles,
   function(obj) {
    return obj.connectionStatus === 'APPROVED';
  });
  if (profile && profile.connections.profiles &&
                              (req.session.customdata.
                              connectionType !== undefined)) {
    var _idConfiguration = req.session.customdata.
                                        connectionType.colleague._id;
    connectionRelationController.getRelationById(
      _idConfiguration, function(err, data) {
        if (err) {
          return res.status(404).send(err.message);
        }
        if (data) {
          return cb1(exports.setPopulate(
            profile.connections.profiles, data));
        } else {
          return cb1(null);
        }
      });
  } else {
    return cb1(null);
  }
};
exports.setPopulate = function(profiles, data, searchIn) {
  var toRet = [];
  var tempIds = [];
  searchIn = searchIn || 'connectedAs';
  _.each(profiles, function(obj) {
    for (var ind = 0; ind < data.length; ind++) {
      if (obj.relation !== data[ind][searchIn]) {
        continue;
      }
      obj.isPopulate = true;
      toRet.push(obj);
      if (obj.refId) {
        var refId = obj.refId._id || obj.refId;
        refId = refId || '';
        tempIds.push(refId.toString());
        if (_.uniq(tempIds).length > 2) {
          return false;
        }
      }
    }
  });
  return toRet;
};

exports.getEmployee = function(req, profile, cb1) {
  profile.connections.profiles = _.filter(profile.connections.profiles,
   function(obj) {
    return obj.connectionStatus === 'APPROVED';
  });
  if (profile && profile.connections.profiles &&
                              (req.session.customdata.
                              connectionType !== undefined)) {
    var _idConfiguration;
    if (req.session.customdata.connectionType.employee) {
      _idConfiguration = req.session.customdata.
                                                    connectionType.employee._id;
    }
    connectionRelationController.getRelationById(
      _idConfiguration, function(err, data) {
        if (err) {
          return res.status(404).send(err.message);
        }
        if (data) {
          var employeeArray = exports.setPopulate(
            profile.connections.profiles, data, 'connectAs');
          return cb1(exports.getSlicedData(exports.removeDuplicate(
            employeeArray, profile)));
        } else {
          return cb1(null);
        }
        console.log('-------------->>>>>>>>>>>>>>');
        console.log(profile.connections.profiles);
      });
  } else {
    return cb1(null);
  }
};

// = -----------------------------------------
exports.getSlicedData = function(temp) {
  var profiles = [];
  profiles = exports.shuffle(temp);
  profiles = profiles.slice(0, 3);
  return profiles;
};
exports.getSlicedCompanyData = function(temp, currentCompany) {
  var profiles = [];
  var currentCompanyId = (currentCompany && currentCompany.length)?
    currentCompany[0]._id:null;
  var foundComp = _.find(temp, function(obj) {
    return obj.refId._id === currentCompanyId &&
             obj.relation.indexOf('Employee') > -1;
  });
  if (foundComp) {
    _.remove(temp, { _id: foundComp._id });
  }
  profiles = exports.shuffle(temp);
  if (profiles.length && foundComp) {
    profiles.unshift(foundComp);
  }
  profiles = profiles.slice(0, 3);
  return profiles;
};
// = -----------------------------------------

/* =
  exports.getServicePartnerForProduct = function(req, profile, cb1) {
  profile.connections.companies = _.filter(profile.connections.companies,
   function(obj) {
     return obj.connectionStatus === 'APPROVED';
   });
  if (profile && profile.connections.companies &&
                    (req.session.customdata.
                    productConnectionType !== undefined)) {
    var companies =
_.uniq(profile && profile.connections.companies, 'refId');
    var _idConfiguration = req.session.customdata.
                  productConnectionType.servicePartners._id;
    connectionRelationController.getRelationById(
            _idConfiguration, function(err, data) {
              if (err) {
                return res.status(404).send(err.message);
              }
              if (data) {
                var technologyPartnerArray = [];
                technologyPartnerArray = _.filter(
                    companies,
                        function(obj) {
                          for (var ind = 0; ind < data.length; ind++) {
                            if (obj.relation === data[ind].connectedAs) {
                              return true;
                            }
                          }
                          return false;

                        });
                return cb1(technologyPartnerArray);
              } else {
                return cb1(null);
              }
              console.log('-------------->>>>>>>>>>>>>>');
              console.log(profile.connections.companies);
            });
  } else {
    return cb1(null);
  }
};*/
exports.getTechnologyPartner = function(req, profile, cb1) {
  profile.connections.companies = _.filter(profile.connections.companies,
   function(obj) {
     return obj.connectionStatus === 'APPROVED';
   });
  var conType = getCustomdataConType(profile.__t);
  if (profile && profile.connections.companies &&
            (req.session.customdata[conType] !== undefined)) {
    var _idConfiguration = req.session.customdata[conType]
                                        .technologyPartner._id;
    connectionRelationController.getRelationById(
   _idConfiguration, function(err, data) {
     if (err) {
       return res.status(404).send(err.message);
     }
     if (data) {
       var technologyPartnerArray = exports.setPopulate(
            profile.connections.companies, data);
       return cb1(exports.removeDuplicate(technologyPartnerArray, profile));
     } else {
       return cb1(null);
     }
     console.log('-------------->>>>>>>>>>>>>>');
     console.log(profile.connections.companies);
   });
  } else {
    return cb1(null);
  }
};

exports.getServicePartner = function(req, profile, cb1) {
  profile.connections.companies = _.filter(profile.connections.companies,
   function(obj) {
     return obj.connectionStatus === 'APPROVED';
   });
  var conType = getCustomdataConType(profile.__t);
  if (profile && profile.connections.companies &&
               (req.session.customdata[conType] !== undefined)) {
    var _idConfiguration = req.session.customdata[conType]
                                          .servicePartner._id;
    connectionRelationController.getRelationById(
   _idConfiguration, function(err, data) {
     if (err) {
       return res.status(404).send(err.message);
     }
     if (data) {
       var servicePartnerArray = exports.setPopulate(
            profile.connections.companies, data);
       return cb1(exports.removeDuplicate(servicePartnerArray, profile));
     } else {
       return cb1(null);
     }
   });
  } else {
    return cb1(null);
  }
};

exports.productsUsed = function(req, profile, cb1) {
  var conType = getCustomdataConType(profile.__t);
  if (profile && profile.connections.products &&
                    (req.session.customdata[conType] !== undefined)) {
    var _idConfiguration = req.session.customdata[conType].productsUsed._id;
    connectionRelationController.getRelationById(
   _idConfiguration, function(err, data) {
     if (err) {
       return res.status(404).send(err.message);
     }
     if (data) {
       var productsUsedArray = exports.setPopulate(
            profile.connections.products, data);
       return cb1(exports.removeDuplicate(productsUsedArray, profile));
     } else {
       return cb1(null);
     }
     console.log('-------------->>>>>>>>>>>>>>');
     console.log(profile.connections.companies);
   });
  } else {
    return cb1(null);
  }
};
// =======================================================
exports.getRelation = function(arr) {
  var rel = _.uniq(arr, 'relation');
  var relation = '';
  for (var Index = 0; Index < rel.length; Index++) {
    relation = relation + '&relation=' + rel[Index].relation;
  }
  return relation;
};
exports.getProductRelation = function(arr) {
  var rel = _.uniq(arr, 'relation');
  var relation = '';
  for (var Index = 0; Index < rel.length; Index++) {
    relation = relation + '&productrelation=' + rel[Index].relation;
  }
  return relation;
};
exports.getPersonRelation = function(arr) {
  var rel = _.uniq(arr, 'relation');
  var relation = '';
  for (var Index = 0; Index < rel.length; Index++) {
    relation = relation + '&personrelation=' + rel[Index].relation;
  }
  return relation;
};
// = -------------------------

// = ---------------------------------
exports.getMaster = function(req, res, next) {
  var master = global.MasterCollection[req.params.type] || [];
  res.send(master);
};

exports.sortBy = function() {
  var _toString = Object.prototype.toString;
  var _parser = function(x) { return x; };
  var _getItem = function(x) {
    var k = '[object Object]';
    return this.parser((_toString.call(x) === k && x[this.prop]) || x);
  };
  return function(array, o) {
    if (!(array instanceof Array) || !array.length) {
      return [];
    }
    if (_toString.call(o) !== '[object Object]') {
      o = {};
    }
    if (typeof o.parser !== 'function') {
      o.parser = _parser;
    }
    o.desc = [1, -1][+!!o.desc];
    return array.sort(function(a, b) {
      a = _getItem.call(o, a);
      b = _getItem.call(o, b);
      return ((a > b) - (b > a)) * o.desc;
    });
  };
}();

exports.populateConnection = function(profile, req, callback) {
  async.parallel({
    comapnies: function(cb) {
      profile.connections.companies =
      _.filter(profile.connections.companies, function(data) {
        return data.refId && data.refId._id;
      });
      profile.connections.companies = _.filter(profile.connections.companies,
        { isPopulate: true });
      var $ids = _.pluck(profile.connections.companies, 'refId._id');
      if (!$ids.length) {
        return cb();
      }
      api.companyProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'speciality type',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        var temp = [];
        _.each(res, function(data) {
          _.each(profile.connections.companies, function(compData) {
            if (compData.refId._id === data._id) {
              compData.refId = data;
            }
          });
        });
        cb();
      });
    },
    products: function(cb) {
      profile.connections.products =
      _.filter(profile.connections.products, function(data) {
        return data.refId && data.refId._id;
      });
      profile.connections.products = _.filter(profile.connections.products,
        { isPopulate: true });
      var $ids = _.pluck(profile.connections.products, 'refId._id');
      if (!$ids.length) {
        return cb();
      }
      api.productProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'goodFor company',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        _.each(res, function(data) {
          var prodData = _.find(profile.connections.products,
          function(prodData) {
            return prodData.refId._id === data._id;
          });
          if (prodData) {
            prodData.refId = data;
          } else {
            console.log(' ');
          }
        });
        cb();
      });
    },
    profiles: function(cb) {
      profile.connections.profiles =
      _.filter(profile.connections.profiles, function(data) {
        return data.refId && data.refId._id;
      });
      var $ids = _.pluck(profile.connections.profiles, 'refId._id');
      if (!$ids.length) {
        return cb();
      }
      $ids = _.uniq($ids);
      $ids = exports.getSlicedData($ids);
      api.personalProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'jobTitle company',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        _.each(res, function(data) {
          var perData = _.find(profile.connections.profiles,
          function(perData) {
            return perData.refId._id === data._id;
          });
          if (perData) {
            perData.refId = data;
          }
        });
        cb();
      });
    },
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, profile);
  });
};

exports.getcompanyData = function(profile, req, callback) {
  async.parallel({
    productsUsed: function(cb) {
      profile.connections.products =
      _.filter(profile.connections.products, function(data) {
        return data.refId && data.refId._id;
      });
      var $ids = _.pluck(profile.connections.products, 'refId._id');
      if (!$ids.length) {
        return cb();
      }
      api.productProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'goodFor company',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        _.each(res, function(data) {
          var prodData = _.find(profile.connections.products,
          function(prodData) {
            return prodData.refId._id === data._id;
          });
          if (prodData) {
            prodData.refId = data;
          } else {
            console.log(' ');
          }
        });
        cb();
      });
    },
    products: function(cb) {
      var $ids = profile.products;
      if (!$ids.length) {
        return cb();
      }
      api.productProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'goodFor company',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        cb();
      });
    },
    profiles: function(cb) {
      var $ids = _.pluck(profile.employees, '_id');
      if (!$ids.length) {
        return cb();
      }
      api.personalProfile.getAll({
        q: { _id: { $in: $ids } },
        populate: 'jobTitle company',
      }, req.session, function(err, res) {
        if (err) {
          return cb(err);
        }
        cb();
      });
    },
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, profile);
  });
};
exports.getSimillarCompanies = function(specialities, req, cb) {
  api.companyProfile.getAll({
    q: {
      speciality: { $in: specialities },
      limit: '3',
    },
  }, req.session, function(err, result) {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });

};
exports.filterApproved = function(pfiles) {
  pfiles = pfiles || [];
  return _.filter(pfiles, function(data) {
    return data.connectionStatus === 'APPROVED';
  });
};

exports.filterConnection = function(profile) {
  profile.connections.profiles =
          exports.filterApproved(profile.connections.profiles);
  profile.connections.products =
          exports.filterApproved(profile.connections.products);
  profile.connections.companies =
          exports.filterApproved(profile.connections.companies);
  return profile;
};

function filterArray(test, recurse) {
  for (var iIndex = 0; iIndex < test.length;) {
    if (test[iIndex] === null || test[iIndex] === undefined) {
      test.splice(iIndex, 1);
      continue;
    } else if (recurse && _.isObject(test[iIndex])) {
      filterObject(test[iIndex], recurse);
    }
    iIndex++;
  }
  return test;
}
function filterObject(test, recurse) {
  for (var i in test) {
    if (test[i] === null || test[i] === undefined) {
      delete test[i];
    } else if (recurse) {
      if (_.isArray(test[i])) {
        filterArray(test[i], recurse);
      } else if (_.isObject(test[i])) {
        filterObject(test[i], recurse);
      }
    }
  }
  return test;
}

exports.querystring = function(obj) {
  return queryParam(filterObject(obj, true));
};
exports.isFeatureAvailable = function(name) {
  return function(req, res, next) {
    var disabledFeatures = global.MasterCollection.disabledFeatures;
    if (disabledFeatures &&
                   disabledFeatures.indexOf(name) >= 0) {
      res.status(404);
      var error = new Error('The error message');
      res.status(error.status || 404);
      return res.render('error', {
        message: error.message,
        error: {},
      });
    }
    next();
  };
};
