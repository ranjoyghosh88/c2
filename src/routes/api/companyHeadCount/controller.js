/**
 * GET     /headCount              ->  index
 * POST    /headCount              ->  create
 * GET     /headCount/:id          ->  show
 * PUT     /headCount/:id          ->  update
 * DELETE  /headCount/:id          ->  destroy
 */
var _ = require('lodash');
var Headcount = require('../../../models/companyHeadCount');
var api = require('../../../routes/csquire-api');
// Get list of headCounts
exports.index = function(req, res, next) {
  Headcount.find(function(err, headcounts) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(headcounts);
    } else {
      res.locals.headcounts = _.sortByAll(headcounts, ['_id']);
      next();
    }
  });
};
// Get a single headcount
exports.show = function(req, res) {
  Headcount.findById(req.params.id, function(err, headcount) {
    if (err) { return handleError(res, err); }
    if (!headcount) { return res.send(404); }
    return res.json(headcount);
  });
};
// Creates a new headcount in the DB.
exports.create = function(req, res) {
  Headcount.create(req.body, function(err, headcount) {
    if (err) { return handleError(res, err); }
    return res.json(201, headcount);
  });
};
// Updates an existing headcount in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  Headcount.findById(req.params.id, function(err, headcount) {
    if (err) { return handleError(res, err); }
    if (!headcount) { return res.send(404); }
    var updated = _.merge(headcount, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, headcount);
    });
  });
};
// Deletes a headcount from the DB.
exports.destroy = function(req, res) {
  Headcount.findById(req.params.id, function(err, headcount) {
    if (err) { return handleError(res, err); }
    if (!headcount) { return res.send(404); }
    headcount.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
exports.checkNameAndInsert = function(sizename) {
  var cb = function() { };
  var result = _.find(global.MasterCollection.companyHeadCount,
  { name: sizename });
  if (typeof result === 'undefined') {
    api.companyHeadCount.create({
      _id: global.MasterCollection.companyHeadCount.length,
      name: sizename,
    }, null, function(err, res) {
      if (err) { return cb(err, null); }
      global.MasterCollection.companyHeadCount.push(res);
      return cb(null, result);
    });
  }
};
function handleError(res, err) {
  return res.send(500, err);
}