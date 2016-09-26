/**
 * GET     /functionalrole             ->  index
 * POST    /functionalrole              ->  create
 * GET     /functionalrole/:id          ->  show
 * PUT     /functionalrole/:id          ->  update
 * DELETE  /functionalrole/:id          ->  destroy
 */
var _ = require('lodash');
var functionalrole = require('../../../models/functionalRole');
// Get list of functionalroles
exports.index = function(req, res, next) {
  functionalrole.find(function(err, functionalroles) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(functionalroles);
    }else {
      res.locals.functionalroles = functionalroles;
      next();
    }
  });
};
// Get a single functionalrole
exports.show = function(req, res) {
  functionalrole.findById(req.params.id, function(err, functionalrole) {
    if (err) { return handleError(res, err); }
    if (!functionalrole) { return res.send(404); }
    return res.json(functionalrole);
  });
};
// Creates a new functionalrole in the DB.
exports.create = function(req, res) {
  functionalrole.create(req.body, function(err, functionalrole) {
    if (err) { return handleError(res, err); }
    return res.json(201, functionalrole);
  });
};
// Updates an existing functionalrole in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  functionalrole.findById(req.params.id, function(err, functionalrole) {
    if (err) { return handleError(res, err); }
    if (!functionalrole) { return res.send(404); }
    var updated = _.merge(functionalrole, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, functionalrole);
    });
  });
};
// Deletes a functionalrole from the DB.
exports.destroy = function(req, res) {
  functionalrole.findById(req.params.id, function(err, functionalrole) {
    if (err) { return handleError(res, err); }
    if (!functionalrole) { return res.send(404); }
    functionalrole.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
exports.getRoleByid = function(id, cb) {
  functionalrole.findById(id, function(err, functionalrole) {
    if (err) {  return cb(null);}
    if (!functionalrole) { return cb(null);}
    return cb(functionalrole);
  });
};
function handleError(res, err) {
  return res.send(500, err);
}