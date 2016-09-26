/**
 * GET     /jobTitle              ->  index
 * POST    /jobTitle              ->  create
 * GET     /jobTitle/:id          ->  show
 * PUT     /jobTitle/:id          ->  update
 * DELETE  /jobTitle/:id          ->  destroy
 */
var _ = require('lodash');
var Jobtitle = require('../../../models/jobTitle');
var api = require('../../../routes/csquire-api');
// Get list of jobTitles
exports.index = function(req, res, next) {
  Jobtitle.find(function(err, jobTitles) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(jobTitles);
    }else {
      res.locals.jobtitles = jobTitles;
      next();
    }
  });
};
// Get a single jobTitle
exports.show = function(req, res) {
  Jobtitle.findById(req.params.id, function(err, jobTitle) {
    if (err) { return handleError(res, err); }
    if (!jobTitle) { return res.send(404); }
    return res.json(jobTitle);
  });
};
// Creates a new jobTitle in the DB.
exports.create = function(req, res) {
  Jobtitle.create(req.body, function(err, jobTitle) {
    if (err) { return handleError(res, err); }
    return res.json(201, jobTitle);
  });
};
exports.checkNameAndInsert = function(jobname, cb) {
  var result = _.find(global.MasterCollection.jobTitle, { name: jobname });
  if (typeof result === 'undefined') {
    api.jobTitle.create({ name: jobname }, null, function(err, res) {
      if (err) { return cb(err); }
      global.MasterCollection.jobTitle.push(res);
      return cb(null, result);
    });
  }
};
// Updates an existing jobTitle in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  Jobtitle.findById(req.params.id, function(err, jobTitle) {
    if (err) { return handleError(res, err); }
    if (!jobTitle) { return res.send(404); }
    var updated = _.merge(jobTitle, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, jobTitle);
    });
  });
};
// Deletes a jobTitle from the DB.
exports.destroy = function(req, res) {
  Jobtitle.findById(req.params.id, function(err, jobTitle) {
    if (err) { return handleError(res, err); }
    if (!jobTitle) { return res.send(404); }
    jobTitle.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}