/**
 * GET     /businessArea              ->  index
 * POST    /businessArea              ->  create
 * GET     /businessArea/:id          ->  show
 * PUT     /businessArea/:id          ->  update
 * DELETE  /businessArea/:id          ->  destroy
 */
var _ = require('lodash');
var BPA = require('../../../models/businessProcessArea');
// Get list of businessAreas
exports.index = function(req, res, next) {
  BPA.find(function(err, businessAreas) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(businessAreas);
    }else {
      res.locals.businessprocess = businessAreas;
      next();
    }
  });
};
// Get a single businessArea
exports.show = function(req, res) {
  BPA.findById(req.params.id, function(err, businessArea) {
    if (err) { return handleError(res, err); }
    if (!businessArea) { return res.send(404); }
    return res.json(businessArea);
  });
};
// Creates a new businessArea in the DB.
exports.create = function(req, res) {
  BPA.create(req.body, function(err, businessArea) {
    if (err) { return handleError(res, err); }
    return res.json(201, businessArea);
  });
};
// Updates an existing businessArea in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  BPA.findById(req.params.id, function(err, businessArea) {
    if (err) { return handleError(res, err); }
    if (!businessArea) { return res.send(404); }
    var updated = _.merge(businessArea, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, businessArea);
    });
  });
};
// Deletes a businessArea from the DB.
exports.destroy = function(req, res) {
  BPA.findById(req.params.id, function(err, businessArea) {
    if (err) { return handleError(res, err); }
    if (!businessArea) { return res.send(404); }
    businessArea.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}