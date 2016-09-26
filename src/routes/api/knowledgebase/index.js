var requestify = require('requestify');
var _ = require('lodash');
var methods = require('./methods');
var url = require('url');
var config = require('../../../config').knowldgebase;

_.each(Object.keys(methods), function(method) {
  var ansData = methods[method];
  exports[method] = function(data, callback) {
    var params = ansData.options? ansData.options.body:{};
    params = _.assign(params || {}, data);
    var path = url.resolve(config.baseUrl, ansData.url);
    var options = ansData.options || {
      method: 'GET',
    };
    params.format = 'json';
    params.apikey = config.apiKey;
    options.params = params;
    requestify
    .request(path, options)
    .then(function(res) {
      var body = res.getBody();
      switch (res.getCode()) {
        case 200: {
          return callback(null, body);
        }
        case 400: {
          return callback(body);
        }
        case 401: {
          return callback(body);
        }
        case 500: {
          return callback(body);
        }
      }
    })
    .fail(function(res) {
      return callback(res.body);
    });
  };
});