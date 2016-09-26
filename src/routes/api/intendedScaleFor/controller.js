/**
 * GET     /intendedScale              ->  index
 * POST    /intendedScale              ->  create
 * GET     /intendedScale/:id          ->  show
 * PUT     /intendedScale/:id          ->  update
 * DELETE  /intendedScale/:id          ->  destroy
 */
var _ = require('lodash');
var IntendedScale = require('../../../models/intendedScaleModel');
// Get list of IntendedScales
exports.index = function(req, res, next) {
  IntendedScale.find(function(err, intendedScales) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(intendedScales);
    }else {
      res.locals.intendedScales = intendedScales;
      next();
    }
  });
};
// Get a single IntendedScale
exports.show = function(req, res) {
  IntendedScale.findById(req.params.id,
   function(err, intendedScale) {
    if (err) { return handleError(res, err); }
    if (!intendedScale) { return res.send(404); }
    return res.json(intendedScale);
  });
};
// Creates a new intendedScale in the DB.
exports.create = function(req, res) {
  IntendedScale.create(req.body, function(err, intendedScale) {
    if (err) { return handleError(res, err); }
    return res.json(201, intendedScale);
  });
};
// Updates an existing intendedScale in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  IntendedScale.findById(req.params.id,
   function(err, intendedScale) {
    if (err) { return handleError(res, err); }
    if (!intendedScale) { return res.send(404); }
    var updated = _.merge(intendedScale, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, intendedScale);
    });
  });
};
// Deletes a intendedScale from the DB.
exports.destroy = function(req, res) {
  IntendedScale.findById(req.params.id,
   function(err, intendedScale) {
    if (err) { return handleError(res, err); }
    if (!intendedScale) { return res.send(404); }
    intendedScale.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}