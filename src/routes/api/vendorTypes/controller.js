/**
 * GET     /vendorType              ->  index
 * POST    /vendorType              ->  create
 * GET     /vendorType/:id          ->  show
 * PUT     /vendorType/:id          ->  update
 * DELETE  /vendorType/:id          ->  destroy
 */
var _ = require('lodash');
var VendorType = require('../../../models/vendorType');
// Get list of vendorTypes
exports.index = function(req, res, next) {
  VendorType.find(function(err, vendorTypes) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(vendorTypes);
    }else {
      res.locals.vendorTypes = vendorTypes;
      next();
    }
  });
};
// Get a single vendorType
exports.show = function(req, res) {
  VendorType.findById(req.params.id,
   function(err, vendorType) {
    if (err) { return handleError(res, err); }
    if (!vendorType) { return res.send(404); }
    return res.json(vendorType);
  });
};
// Creates a new vendorType in the DB.
exports.create = function(req, res) {
  VendorType.create(req.body, function(err, vendorType) {
    if (err) { return handleError(res, err); }
    return res.json(201, vendorType);
  });
};
// Updates an existing vendorType in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  VendorType.findById(req.params.id,
   function(err, vendorType) {
    if (err) { return handleError(res, err); }
    if (!vendorType) { return res.send(404); }
    var updated = _.merge(vendorType, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, vendorType);
    });
  });
};
// Deletes a vendorType from the DB.
exports.destroy = function(req, res) {
  VendorType.findById(req.params.id,
   function(err, vendorType) {
    if (err) { return handleError(res, err); }
    if (!vendorType) { return res.send(404); }
    vendorType.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}