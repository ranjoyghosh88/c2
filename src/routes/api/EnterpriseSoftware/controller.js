/**
 * GET     /enterpriseSoftware              ->  index
 * POST    /enterpriseSoftware              ->  create
 * GET     /enterpriseSoftware/:id          ->  show
 * PUT     /enterpriseSoftware/:id          ->  update
 * DELETE  /enterpriseSoftware/:id          ->  destroy
 */
var _ = require('lodash');
var EnterpriseSoftware = require('../../../models/enterpriseSoftware');
// Get list of enterpriseSoftwares
exports.index = function(req, res, next) {
  EnterpriseSoftware.find(function(err, enterpriseSoftwares) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(enterpriseSoftwares);
    }else {
      res.locals.enterpriseSoftwares = enterpriseSoftwares;
      next();
    }
  });
};
// Get a single enterpriseSoftware
exports.show = function(req, res) {
  EnterpriseSoftware.findById(req.params.id,
   function(err, enterpriseSoftware) {
    if (err) { return handleError(res, err); }
    if (!enterpriseSoftware) { return res.send(404); }
    return res.json(enterpriseSoftware);
  });
};
// Creates a new enterpriseSoftware in the DB.
exports.create = function(req, res) {
  EnterpriseSoftware.create(req.body, function(err, enterpriseSoftware) {
    if (err) { return handleError(res, err); }
    return res.json(201, enterpriseSoftware);
  });
};
// Updates an existing enterpriseSoftware in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  EnterpriseSoftware.findById(req.params.id,
   function(err, enterpriseSoftware) {
    if (err) { return handleError(res, err); }
    if (!enterpriseSoftware) { return res.send(404); }
    var updated = _.merge(enterpriseSoftware, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, enterpriseSoftware);
    });
  });
};
// Deletes a enterpriseSoftware from the DB.
exports.destroy = function(req, res) {
  EnterpriseSoftware.findById(req.params.id,
   function(err, enterpriseSoftware) {
    if (err) { return handleError(res, err); }
    if (!enterpriseSoftware) { return res.send(404); }
    enterpriseSoftware.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}