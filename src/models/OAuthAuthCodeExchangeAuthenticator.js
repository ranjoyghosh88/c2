var path = '../node_modules/stormpath/';
var fs = require('fs');
if (!fs.existsSync(__dirname + '/' + path)) {
  path = '../../node_modules/stormpath/';
}

var utils = require(path + '/lib/utils');
var jwt = require(path + '/node_modules/jwt-simple');
var ApiAuthRequestError =
 require(path + '/lib/error/ApiAuthRequestError');
var AuthenticationResult =
 require(path + '/lib/resource/AuthenticationResult');

var nowEpochSeconds = utils.nowEpochSeconds;

function OAuthAuthCodeExchangeAuthenticator(application,
 request, ttl, scopeFactory, requestedScope) {
  if (request.method !== 'POST') {
    return new ApiAuthRequestError('Must use POST for token exchange,' +
     ' see http://tools.ietf.org/html/rfc6749#section-3.2');
  }
  var temp = 'client_id';
  this.id = request.body[temp];
  temp = 'client_secret';
  this.secret = request.body[temp];
  this.code = request.body.code;
  this.application = application;
  this.ttl = ttl || 3600;
  this.scopeFactory = scopeFactory || this.defaultScopeFactory;
  this.requestedScope = requestedScope;
}

OAuthAuthCodeExchangeAuthenticator
.prototype.defaultScopeFactory = function defaultScopeFactory() {
  return '';
};

OAuthAuthCodeExchangeAuthenticator
.prototype.authenticate = function authenticate(callback) {
  var self = this;
  self.application.getApiKey(self.id, function(err, apiKey) {
    if (err) {
      callback(err.status === 404 ?
       new ApiAuthRequestError('Invalid Client Credentials', 401) : err);
    } else {
      if (
        (apiKey.secret === self.secret) &&
        (apiKey.status === 'ENABLED') &&
        (apiKey.account.status === 'ENABLED')
      ) {
        var result = new AuthenticationResult(apiKey,
         self.application.dataStore);
        result.forApiKey = apiKey;
        result.application = self.application;
        result.tokenResponse = self.buildTokenResponse(apiKey);
        callback(null, result);
      } else {
        callback(new ApiAuthRequestError('Invalid Client Credentials', 401));
      }
    }
  });
};

OAuthAuthCodeExchangeAuthenticator
.prototype.buildTokenResponse = function buildTokenResponse(apiKey) {
  var self = this;
  var scope = self.scopeFactory(apiKey.account, self.requestedScope);
  // TODO v1.0.0 - remove string option for tokens, should be array only
  var toRet = {};
  var temp = 'access_token';
  toRet[temp] = self.buildAccesstoken(apiKey.account);

  temp = 'access_token';
  toRet[temp] = self.buildAccesstoken(apiKey.account);

  temp = 'token_type';
  toRet[temp] = 'bearer';

  temp = 'expires_in';
  toRet[temp] = self.ttl;

  temp = 'scope';
  toRet[temp] = Array.isArray(scope) ? scope.join(' ') : scope;

  return toRet;
};

OAuthAuthCodeExchangeAuthenticator
.prototype.buildAccesstoken = function buildAccesstoken(account) {
  var self = this;

  var now = nowEpochSeconds();
  var _jwt = {
    sub: self.id,
    iss: self.application.href,
    iat: now,
    exp: now + self.ttl,
    code: self.code,
  };
  var scope = self.scopeFactory(account, self.requestedScope);
  if (scope) {
    // TODO v1.0.0 - remove string option, should be array only
    _jwt.scope = Array.isArray(scope) ? scope.join(' ') : scope;
  }
  self._token = jwt.encode(_jwt,
   self.application.dataStore.requestExecutor.options.apiKey.secret, 'HS256');
  return self._token;
};

module.exports = OAuthAuthCodeExchangeAuthenticator;