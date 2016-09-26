/**
 * GET     /revenues              ->  index
 * POST    /revenues              ->  create
 * GET     /revenues/:id          ->  show
 * PUT     /revenues/:id          ->  update
 * DELETE  /revenues/:id          ->  destroy
 */
var _ = require('lodash');
var Annualrevenue = require('../../../models/companyAnnualRevenue');
// Get list of revenues
exports.index = function(req, res, next) {
  Annualrevenue.find(function(err, revenues) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(revenues);
    }else {
      res.locals.revenues = _.sortByAll(revenues, ['_id']);
      next();
    }
  });
};
// Get a single revenue
exports.show = function(req, res) {
  Annualrevenue.findById(req.params.id, function(err, revenue) {
    if (err) { return handleError(res, err); }
    if (!revenue) { return res.send(404); }
    return res.json(revenue);
  });
};
// Creates a new revenue in the DB.
exports.create = function(req, res) {
  Annualrevenue.create(req.body, function(err, revenue) {
    if (err) { return handleError(res, err); }
    return res.json(201, revenue);
  });
};
// Updates an existing revenue in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  Annualrevenue.findById(req.params.id, function(err, revenue) {
    if (err) { return handleError(res, err); }
    if (!revenue) { return res.send(404); }
    var updated = _.merge(revenue, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, revenue);
    });
  });
};
// Deletes a revenue from the DB.
exports.destroy = function(req, res) {
  Annualrevenue.findById(req.params.id, function(err, revenue) {
    if (err) { return handleError(res, err); }
    if (!revenue) { return res.send(404); }
    revenue.remove(function(err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
function handleError(res, err) {
  return res.send(500, err);
}