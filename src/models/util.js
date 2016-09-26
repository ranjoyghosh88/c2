var _ = require('lodash');
var fs = require('fs');
var path = '../node_modules/stormpath/lib';
if (!fs.existsSync(__dirname + '/' + path)) {
  path = '../../node_modules/stormpath/lib';
}
var StormpathApplication =
 require(path + '/resource/Application.js');
var InstanceResource =
 require(path + '/resource/InstanceResource');
var AuthRequestParser =
 require(path + '/authc/AuthRequestParser');
var ApiKeyEncryptedOptions =
 require(path + '/authc/ApiKeyEncryptedOptions');
var BasicApiAuthenticator =
 require(path + '/authc/BasicApiAuthenticator');
var ApiAuthRequestError =
 require(path + '/error/ApiAuthRequestError');
var OAuthBasicExchangeAuthenticator =
 require(path + '/authc/OAuthBasicExchangeAuthenticator');
var OauthAccessTokenAuthenticator =
 require(path + '/authc/OauthAccessTokenAuthenticator');
var AuthenticationResult =
 require(path + '/resource/AuthenticationResult');
var Account = require(path + '/resource/Account');
var errorMessages = require(path + '/error/messages');
var utils = require(path + '/utils');
var OAuthAuthCodeExchangeAuthenticator =
 require('./OAuthAuthCodeExchangeAuthenticator');

var _deepPick = function(src, dest) {
  for (var prop in dest) {
    if (_.isObject(dest[prop])) {
      dest[prop] = exports.deepPick(src[prop], dest[prop]);
    } else {
      try {
        dest[prop] = src[prop];
      }
      catch (e) {
        console.log('===exception caught===');
        console.log(e);
      }
    }
  }
  return dest;
};
exports.deepPick = function(src, dest) {
  if (_.isEmpty(dest)) {
    return src;
  }
  return _deepPick(src, _.defaults({ _id: null, connections: null }, dest));
};



StormpathApplication.prototype.authenticateApiRequest =
function authenticateApiRequest(options, callback) {
  var self = this;
  function check() {
    if (typeof options !== 'object') {
      throw new ApiAuthRequestError('options must be an object');
    }
    if (typeof options.request !== 'object') {
      throw new ApiAuthRequestError('options.request must be an object');
    }
    if (options.ttl && (typeof options.ttl !== 'number')) {
      throw new ApiAuthRequestError('ttl must be a number');
    }
  }
  check();
  var locationsToSearch;
  function getLocationToSearch() {
    var validAccessTokenRequestLocations = ['header', 'body', 'url'];
    var defaultAccessTokenRequestLocations = ['header', 'body'];
    if (Array.isArray(options.locations)) {
      locationsToSearch = options.locations.filter(function(location) {
        return validAccessTokenRequestLocations.indexOf(location) > -1;
      });
    } else {
      locationsToSearch = defaultAccessTokenRequestLocations;
    }
  }
  getLocationToSearch();
  var ttl = options.ttl;
  var application = self;
  var req = options.request;
  var scopeFactory = typeof options.scopeFactory === 'function' ?
  options.scopeFactory : null;
  var authenticator;
  function getAuthenticator() {
    var parser, authHeaderValue, accessTokenm, grantType;
    function setparams() {
      parser = new AuthRequestParser(req, locationsToSearch);
      authHeaderValue = parser.authorizationValue;
      accessToken = parser.accessToken;
      grantType = parser.grantType;
    }
    setparams();
    if (authHeaderValue) {
      if (authHeaderValue.match(/Basic/i)) {
        if (grantType) {
          authenticator = new OAuthBasicExchangeAuthenticator(
            application,
          req,
          ttl,
          scopeFactory,
          parser.requestedScope
          );
        } else {
          authenticator = new BasicApiAuthenticator(
            application,
          authHeaderValue
          );
        }
      } else if (authHeaderValue.match(/Bearer/i)) {
        authenticator = new OauthAccessTokenAuthenticator(
          self,
        authHeaderValue.replace(/Bearer /i, ''),
        callback
        );
      } else {
        return callback(
          new ApiAuthRequestError('Invalid Authorization value', 400));
      }
    } else if (accessToken) {
      authenticator = new OauthAccessTokenAuthenticator(
        self, accessToken, callback);
    }
    (function() {
      if (!authenticator) {
        if (grantType === 'authorization_code') {
          authenticator = new OAuthAuthCodeExchangeAuthenticator(
            application,
          req,
          ttl,
          scopeFactory,
          parser.requestedScope
          );
        }
        if (!authenticator) {
          return callback(
            new ApiAuthRequestError('Must provide access_token.', 401));
        }
      }
      if (authenticator instanceof Error) {
        return callback(authenticator);
      }
    })();
  }
  getAuthenticator();
  if (authenticator) {
    authenticator.authenticate(callback);
  }
};
exports.setSelectedData = function(masterData, selected, existingPathRegEx,
 toCheck) {
  if (!masterData) {
    return [];
  }
  toCheck = toCheck || '_id';
  masterData = _.cloneDeep(masterData);
  var arrSelected = _.isArray(selected)?selected:[selected];
  for (var iIndex = 0; iIndex < masterData.length; iIndex++) {
    var data = masterData[iIndex];
    for (var jIndex = 0; jIndex < arrSelected.length; jIndex++) {
      var temp = arrSelected[jIndex];
      if (temp === (data[toCheck] + '')) {
        data.selected = true;
      }/* -else if (data.path && existingPathRegEx &&
       existingPathRegEx.test(data.path)) {
        data.selected = true;
      }*/
    }
  }
  return masterData;
};
exports.getArrQuery = function(arr, isNum, field) {
  if (arr) {
    arr = _.isArray(arr)?arr:[arr];
    var filter1 = { $or: [] };
    _.each(arr, function(val) {
      var isAdd = true;
      if (isNum) {
        val = parseInt(val);
        isAdd = !isNaN(val);
      }
      if (isAdd) {
        var temp = {};
        temp[field] = val;
        filter1.$or.push(temp);
      }
    });
    if (filter1.$or.length) {
      return filter1;
    }
  }
  return null;
};
exports.getFilterdString = function(str, regExSplitter, joinWith) {
  var temp = str.split(regExSplitter).filter(function(e) {
    return e.replace(/(\r\n|\n|\r)/gm, '');
  });
  var toRet = [];
  for (var iIndex = 0; iIndex < temp.length; iIndex++) {
    var data = temp[iIndex];
    if (data.trim().length) {
      toRet.push(data);
    }
  }
  if (toRet.length) {
    return toRet.join('|');
  }
  return null;
};
exports.EnumAccountStatus = {
  UNVERIFIED: 'UNVERIFIED',
  DISABLED: 'DISABLED',
  ENABLED: 'ENABLED',
};
exports.EnumConnectionStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
};
exports.getUid = function(Model, uid, query, counter, callback) {
  counter = counter || 0;
  Model.count(query, function(err, count) {
    if (err) {
      return callback(err);
    }
    if (count <= 0) {
      return callback(null, query.uid);
    } else {
      query.uid = uid + '.' + _.padLeft(++counter, 3, '0');
      exports.getUid(Model, uid, query, counter, callback);
    }
  });
};
exports.getStringForUId = function(str) {
  var toRet = '';
  if (str && str.length) {
    for (var iIndex = 0; iIndex < str.length; iIndex++) {
      if (/[a-zA-Z0-9\.]/.test(str[iIndex])) {
        toRet += str[iIndex];
      }
    }
  }
  if (!toRet.length) {
    toRet = Math.random().toString(36).substr(2, 5);
  }
  return toRet;
};