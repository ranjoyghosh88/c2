var StormpathApplication = require('../../node_modules/' +
 'stormpath/lib/resource/Application.js');

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
  /*
  // if (grantType && grantType !== 'client_credentials') {
  // return callback(new ApiAuthRequestError('Unsupported grant_type'));
  //}
  */
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
    if (!authenticator) {
      return callback(
        new ApiAuthRequestError('Must provide access_token.', 401));
    }
    if (authenticator instanceof Error) {
      return callback(authenticator);
    }
  }
  getAuthenticator();
  if (authenticator) {
    authenticator.authenticate(callback);
  }
};