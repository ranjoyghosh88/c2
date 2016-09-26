/**
 * GET     /vendorService              ->  index
 * POST    /vendorService              ->  create
 * GET     /vendorService/:id          ->  show
 * PUT     /vendorService/:id          ->  update
 * DELETE  /vendorService/:id          ->  destroy
 */
var _ = require('lodash');
var Vendorservice = require('../../../models/vendorService');
// Get list of vendorServices
exports.index = function(req, res, next) {
  Vendorservice.find(function(err, vendorServices) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(vendorServices);
    }else {
      res.locals.vendorservices = vendorServices;
      next();
    }
  });
};
// Get a single vendorservice
exports.show = function(req, res) {
  Vendorservice.findById(req.params.id, function(err, vendorservice) {
    if (err) { return handleError(res, err); }
    if (!vendorservice) { return res.send(404); }
    return res.json(vendorservice);
  });
};
// Creates a new vendorservice in the DB.
exports.create = function(req, res) {
  Vendorservice.create(req.body, function(err, vendorservice) {
    if (err) { return handleError(res, err); }
    return res.json(201, vendorservice);
  });
};
// Updates an existing vendorservice in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  Vendorservice.findById(req.params.id, function(err, vendorservice) {
    if (err) { return handleError(res, err); }
    if (!vendorservice) { return res.send(404); }
    var updated = _.merge(vendorservice, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, vendorservice);
    });
  });
};
// Deletes a vendorservice from the DB.
exports.destroy = function(req, res) {
  Vendorservice.findById(req.params.id, function(err, vendorservice) {
    if (err) { return handleError(res, err); }
    if (!vendorservice) { return res.send(404); }
    vendorservice.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}