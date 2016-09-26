/**
 * GET     /connectionRelation              ->  index
 * POST    /connectionRelation              ->  create
 * GET     /connectionRelation/:id          ->  show
 * PUT     /connectionRelation/:id          ->  update
 * DELETE  /connectionRelation/:id          ->  destroy
 */
var _ = require('lodash');
var relationTypes = require('../../../models/connectionRelation');
var opts = [
  {
    path: 'relationTypes',
  },
];
// Get list of connectionRelations
exports.index = function(req, res, next) {
  relationTypes.find(function(err, relationType) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(relationType);
    }else {
      res.locals.relationTypes = relationType;
      next();
    }
  });
};

exports.getRelationById = function(id, cb) {
  relationTypes.find().where('_id').in(id).exec(function(err, _relationType) {
    relationTypes.populate(_relationType, opts, function(err, _relationType) {

      return cb(err, _relationType);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}