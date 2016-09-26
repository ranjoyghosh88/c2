/**
 * GET     /professionalLevels              ->  index
 * POST    /professionalLevels              ->  create
 * GET     /professionalLevels/:id          ->  show
 * PUT     /professionalLevels/:id          ->  update
 * DELETE  /professionalLevels/:id          ->  destroy
 */
var _ = require('lodash');
var ProfessionalLevel = require('../../../models/professionalLevel');
// Get list of professionalLevels
exports.index = function(req, res, next) {
  ProfessionalLevel.find(function(err, professionalLevels) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(professionalLevels);
    }else {
      res.locals.professionallevels = professionalLevels;
      next();
    }
  });
};
// Get a single professionalLevel
exports.show = function(req, res) {
  ProfessionalLevel.findById(req.params.id, function(err, professionalLevel) {
    if (err) { return handleError(res, err); }
    if (!professionalLevel) { return res.send(404); }
    return res.json(professionalLevel);
  });
};
// Creates a new professionalLevel in the DB.
exports.create = function(req, res) {
  ProfessionalLevel.create(req.body, function(err, professionalLevel) {
    if (err) { return handleError(res, err); }
    return res.json(201, professionalLevel);
  });
};
// Updates an existing professionalLevel in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  ProfessionalLevel.findById(req.params.id, function(err, professionalLevel) {
    if (err) { return handleError(res, err); }
    if (!professionalLevel) { return res.send(404); }
    var updated = _.merge(professionalLevel, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, professionalLevel);
    });
  });
};
// Deletes a professionalLevel from the DB.
exports.destroy = function(req, res) {
  ProfessionalLevel.findById(req.params.id, function(err, professionalLevel) {
    if (err) { return handleError(res, err); }
    if (!professionalLevel) { return res.send(404); }
    professionalLevel.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}