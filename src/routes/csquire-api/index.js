var allMethods = require('./methodList');
var BaseApi = require('./base');
var _ = require('lodash');
var allApi = {};
_.each(allMethods, function(methos) {
  allApi[methos] = new BaseApi(methos);
});

module.exports = allApi;


