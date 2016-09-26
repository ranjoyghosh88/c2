var _ = require('lodash');
var async = require('async');

module.exports = exports = function(Schema, options) {
  // Options.processData = options.processData || function () { }
  Schema.statics.beforeExecQuery = options.beforeExecQuery ||
  function(query, monoQuery, cb) {
    cb(null, monoQuery);
  };
  Schema.statics.makeMongoQuery = function makeMongoQuery(query, callback) {
    var toRet = { $and: [] };
    if (query.search && query.search.length) {
      var orQuery = this.getSearchQuery(query.search);
      if (orQuery.length) {
        toRet.$and.push({ $or: orQuery });
      }
    }
    // ========= Filters ===========
    var tat = this;
    this.getFilterSearchQuery(query, function(err, res) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      toRet.$and = toRet.$and.concat(res);
      tat.beforeExecQuery(query, toRet, function(err, q) {
        callback(err, q);
      });
    });
  };
  var makeSearchQuery = function(query) {
    var toRet = _.defaults({
      start: 0,
      length: 5,
      order: query.order || null,
      search: query.search || null,
      filter: query.filter || null,
    }, query);
    if (query.start) {
      var start = parseInt(query.start);
      if (!isNaN(start)) {
        toRet.start = start;
      }
    }
    if (query.length) {
      var length = parseInt(query.length);
      if (!isNaN(length)) {
        toRet.length = length;
      }
    }
    return toRet;
  };
  Schema.statics.makeSearchQuery = options.makeSearchQuery || makeSearchQuery;
  var search = function(query, userData, callback) {
    var tat = this;
    query = this.makeSearchQuery(query);
    this.makeMongoQuery(query, function(err, mongoQuery) {
      if (err) {
        return callback(err);
      }
      if (_.isEmpty(mongoQuery) || !mongoQuery.$and.length) {
        // ==== var errStatus = new Error('Nothing to search!!');
        // === errStatus.status = 400;
        return callback(null, { recordsTotal: 0, data: [] });
      }
      async.parallel({
        recordsTotal: function(cb) {
          tat.count(mongoQuery, cb);
        },
        data: function(cb) {
          tat.find(mongoQuery)
                        .limit(query.length)
                        .sort(query.order)
                        .skip(query.start)
                        .exec(cb);
        },
      }, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (options.processData) {
          return options.processData.call(tat, result, userData, callback);
        }
        callback(null, result);
      });
    });
  };
  var searchCount = function(query, userData, callback) {
    var tat = this;
    query = this.makeSearchQuery(query);
    this.makeMongoQuery(query, function(err, mongoQuery) {
      if (err) {
        return callback(err);
      }
      if (_.isEmpty(mongoQuery) || !mongoQuery.$and.length) {
        return callback(null, 0);
      }
      tat.count(mongoQuery, callback);
    });
  };
  Schema.statics.search = options.search || search;
  Schema.statics.searchCount = options.searchCount || searchCount;
};