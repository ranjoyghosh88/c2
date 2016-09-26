var mongoose = require('mongoose');
var _ = require('lodash');
var util = require('./util');
var async = require('async');
var profileModels = {
  profile: require('./personalProfile'),
  company: require('./companyProfile'),
  product: require('./productProfile'),
};
mongoose.Model.getValidations = function(Schema) {
  var toRet = {};
  for (var path in this.schema.paths) {
    var jVal = this.schema.paths[path].options.jVal;
    if (jVal) {
      toRet[path] = jVal;
    }
  }
  return toRet;
};

function getVal(input, key) {
  var toRet = input;
  key = key.split('.');
  for (var i = 0; i < key.length; i++) {
    if (_.isArray(toRet)) {
      toRet = _.pluck(toRet, key[i]);
    } else {
      toRet = toRet[key[i]];
    }
  }
  return toRet;
}

var getOnMasterColl = function(searchOpt, search, path) {
  var temp = null;
  if (searchOpt.masterColleName) {
    var collData = global.MasterCollection[searchOpt.masterColleName];
    if (collData) {
      collData = _.pluck(_.filter(collData, function(info) {
        var fld = info[searchOpt.searchField];
        return fld && new RegExp(_.escapeRegExp(search), 'gi').test(fld);
      }), '_id');
      if (collData && collData.length) {
        temp = {};
        temp[path] = { $in: collData };
      }
    }
  }
  return temp;
};
mongoose.Model.getSearchQuery = function(search) {
  var toRet = [];
  if (search.indexOf(' ')) {
    search = search.split(' ');
  } else {
    search = [search];
  }
  for (var path in this.schema.paths) {
    var options = this.schema.paths[path].options;
    var searchOpt = null;
    if (_.isArray(options.type) && options.type.length) {
      searchOpt = options.type[0].isSearchable;
    } else {
      searchOpt = options.isSearchable;
    }
    if (!searchOpt) {
      continue;
    }
    toRet = getToRet1(searchOpt, search, path, toRet);
  }
  return toRet;
};
function getToRet1(searchOpt, search, path, toRet) {
  var temp = null;
  if (_.isObject(searchOpt)) {
    temp = getOnMasterColl(searchOpt, search, path);
    if (temp) {
      toRet.push(temp);
    }
  } else {
    temp = {};
    for (var i = 0; i < search.length; i++) {
      temp[path] = {
        $regex: _.escapeRegExp(search[i]),
        $options: 'i',
      };
      if (temp) {
        toRet.push(temp);
      }
    }
  }
  return toRet;
}
function findInModelseeAll(Model, refinmentValue, userId, search,
 searchFieldName, refModel, isNumeric, schemaFieldName, projectionField, cb) {
  var toRet = null;
  if (!refModel.requireLoggedIn) {
    if (!search || !search.length) {
      return cb();
    }
  }
  Model.findOne({ uid: userId }, function(err, res) {
    if (err) {
      return cb(err);
    }
    (function() {
      var query = {};
      if (!res) {
        var temp1 = {};
        temp1[schemaFieldName] = mongoose.Types.ObjectId();
        toRet = temp1;
        return cb(null, toRet, refinmentValue);
      }
      res.followers = res.followers || {};
      if (schemaFieldName.indexOf('.')) {
        toRet = util.getArrQuery(getVal(res, schemaFieldName), false, '_id');
      } else {
        toRet = util.getArrQuery(res[schemaFieldName]._id, false, '_id');
      }
      if (!toRet) {
        var temp2 = {};
        temp2[schemaFieldName] = mongoose.Types.ObjectId();
        toRet = temp2;
      }
    })();
    return cb(null, toRet, refinmentValue, searchFieldName);
  });
}
function findInModel(Model, search,
 searchFieldName, user , isNumeric, schemaFieldName,
 projectionField, callback) {
  var toRet = null;
  if (!search || !search.length) {
    return callback();
  }
  projectionField = projectionField || '_id';
  var query = {};
  if (typeof (search) !== 'string') {
    search = _.isArray(search)?search:[search];
    query[searchFieldName] = { $in: search };
  } else {
    if (searchFieldName !== '_id') {
      query[searchFieldName] = {
        $regex: _.escapeRegExp(search),
        $options: 'i',
      };
    } else {
      query[searchFieldName] = search;
    }
  }
  async.waterfall([function(cb) {
      if (!user) {
        return cb(null, null);
      }
      profileModels.profile.findOne({ uid: user }, function(err, res) {
        cb(err, res?res._id:null);
      });
    }, function(userId, cb) {
      Model.find(query, projectionField, function(err, comps) {
        if (err) {
          return cb(err);
        }
        if (comps && comps.length) {
          for (var iIndex = 0; iIndex < comps.length; iIndex++) {
            comps[iIndex] = comps[iIndex][projectionField];
          }
          if (userId && schemaFieldName.indexOf('.relation') !== -1) {
            (function() {
              schemaFieldName = schemaFieldName.replace('.relation', '');
              comps = _.uniq(comps);
              var filter = { $or: [] };
              _.each(comps, function(rel) {
                var temp = {};
                temp[schemaFieldName] = {
                  $elemMatch: {
                    relation: rel,
                    refId: userId,
                  },
                };
                filter.$or.push(temp);
              });
              toRet = filter;
            })();
          } else {
            filter = util.getArrQuery(comps, isNumeric, schemaFieldName);
            if (filter) {
              toRet = filter;
            }
          }
        } else {
          var temp1 = {};
          temp1[schemaFieldName] = mongoose.Types.ObjectId();
          toRet = temp1;
        }
        cb(null, toRet);
      }).lean();
    }, ], function(err) {
    callback(err, toRet);
  });
}
mongoose.Model.getFilterSearchQuery = function(query, callback) {
  var toRet = [];
  var tat = this;
  async.map(Object.keys(this.schema.paths), function(path, cb) {
    var opt = tat.schema.paths[path].options;
    var isNumeric = false;
    if (_.isArray(opt.type)) {
      refinment = opt.type[0].refinement;
      isNumeric = opt.type[0].type && opt.type[0].type.name?
        opt.type[0].type.name === 'Number':false;
      (function() {
        if (opt.type[0].paths) {
          (function() {
            if (query.seeAll) {
              for (var p in opt.type[0].paths) {
                if (opt.type[0].paths[p].options.refinement) {
                  refinment = opt.type[0].paths[p].options.refinement;
                  path = path + '.' + p;
                  isNumeric = opt.type[0].paths[p].options.type &&
            opt.type[0].paths[p].options.type.name?
            opt.type[0].paths[p].options.type.name === 'Number':false;
                }
              }
            }
          })();
        } else {
          if (query.seeAll) {
            var optTemp = opt.type[0];
            (function() {
              for (var p in optTemp) {
                var obj = optTemp[p];
                if (obj.refinement) {
                  refinment = obj.refinement;
                  path = path + '.' + p;
                  isNumeric = obj.type &&
            obj.type.name?
            obj.type.name === 'Number':false;
                }
              }
            })();
          }
        }
      })();
    } else {
      refinment = opt.refinement;
      isNumeric = opt.type && opt.type.name?opt.type.name === 'Number':false;
    }
    if (!refinment) {
      return cb();
    }
    if (refinment.refModel) {
      (function() {
        var Model = mongoose.model(refinment.refModel.ref);
        if (!refinment.refModel.requireLoggedIn) {
          var search = query[refinment.name];
          if (!(Model && search)) {
            return cb();
          }
        }
        if (query.user && refinment.refModel.requireLoggedIn &&
         refinment.name === query.seeAll) {
          var searchModel = null;
          if (query.type && query.uid) {
            searchModel = profileModels[query.type];
            query.user = query.uid;
          } else {
            searchModel = profileModels.profile;
          }
          return findInModelseeAll(searchModel,
          query[refinment.name], query.user, search,
       refinment.refModel.searchFieldName, refinment.refModel,
       isNumeric, path, refinment.refModel.projectionField,
       function(err, obj, refinmentName, searchOn) {
            if (err) {
              return cb(err);
            }
            if (obj) {
              toRet.push(obj);
            }
            (function() {
              if (refinmentName && searchOn) {
                searchOn = searchOn.split(' ');
                console.log(refinmentName);
                var temp3 = {};
                temp3.$and = [];
                var temp4 = {};
                for (var z = 0; z < searchOn.length; z++) {
                  temp4[searchOn[z]] = {
                    $regex: _.escapeRegExp(refinmentName[z]),
                    $options: 'i',
                  };
                  temp3.$and.push(temp4);
                  temp4 = {};
                }
                toRet.push(temp3);
              }
            })();
            cb();
          });
        }
        findInModel(Model, search,
       refinment.refModel.searchFieldName, query.user,
       isNumeric, path, refinment.refModel.projectionField, function(err, obj) {
          if (err) {
            console.log(search, err.stack);
            return cb(err);
          }
          if (obj) {
            toRet.push(obj);
          }
          cb();
        });
      })();
    } else if (refinment.isMultiple) { // Multiple array item
      (function() {
        var data = query[refinment.name];
        if (data) { // If not multiple then it will be text item to filter
          var temp = util.getArrQuery(data, isNumeric, path);
          if (temp) {
            toRet.push(temp);
          }
        }
        cb();
      })();
    } else {
      (function() {
        var data2 = query[refinment.name];
        if (data2) { // If not multiple then it will be text item to filter
          var temp2 = {};
          temp2[path] = {
            $regex: _.escapeRegExp(data2), $options: 'i',
          };
          toRet.push(temp2);
        }
        cb();
      })();
    }
  }, function(err) {
    callback(err, err?null:toRet);
  });
};
mongoose.Model.getRefinements = function(query, cb) {
  var toRet = [];
  var refinment;
  for (var path in this.schema.paths) {
    if (_.isArray(this.schema.paths[path].options.type)) {
      refinment = this.schema.paths[path].options.type[0].refinement;
      if (this.schema.paths[path].options.type[0].paths) {
        refinment = collectRef(query, this.schema.paths[path]
        .options.type[0].paths);
      } else {
        var ret = collRef2(query, this.schema.paths[path].options.type[0],
         path);
        refinment = ret.refinment ? ret.refinment : refinment;
        path = ret.path ? ret.path : path;
        isNumeric = ret.isNumeric ? ret.isNumeric : false;
      }
    } else {
      refinment = this.schema.paths[path].options.refinement;
    }
    toRet = getToRet(toRet, refinment, query);
  }
  toRet = _.sortByOrder(toRet, 'order');
  cb(null, toRet);
};
function collectRef(query, paths) {
  var refinment = null;
  if (query.seeAll) {
    for (var p in paths) {
      if (paths[p].options.refinement) {
        refinment = paths[p].options.refinement;
      }
    }
  }
  return refinment;
}
function collRef2(query, optTemp, path) {
  var ret = {};
  if (query.seeAll) {
    for (var p in optTemp) {
      var obj = optTemp[p];
      if (obj.refinement) {
        ret.refinment = obj.refinement;
        ret.path = path + '.' + p;
        ret.isNumeric = obj.type &&
            obj.type.name?
            obj.type.name === 'Number':false;
      }
    }
  }
  return ret;
}
function getToRet(toRet, refinment, query) {
  if (refinment) {
    var temp = {
      header: refinment.header,
      isMultiselect: refinment.isMultiple,
      name: refinment.name,
      order: refinment.order,
      autoSelectAll: refinment.autoSelectAll,
    };
    var toCheck;
    if (refinment.refModel) {
      toCheck = refinment.refModel.searchFieldName;
    }
    if (temp.isMultiselect) {
      temp.data = util.setSelectedData(
        global.MasterCollection[refinment.masterColleName],
        query[refinment.name], null, toCheck);
      temp.masterColleName = refinment.masterColleName;
    } else if (refinment.isTypehead) {
      temp = _.extend(temp, {
        isTypehead: refinment.isTypehead,
        value: query[refinment.name],
      });
    } else {
      temp.value = query[refinment.name];
    }
    toRet.push(temp);
  }
  return toRet;
}
