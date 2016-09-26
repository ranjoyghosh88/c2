var async = require('async');
var _ = require('underscore');
var http = require('http');
var stormpath = require('stormpath');
var PersonalProfile = require('./personalProfile/controller.js');
var _password = '';
var apiKey = new stormpath.ApiKey(
  process.env.STORMPATH_API_KEY_ID,
  process.env.STORMPATH_API_KEY_SECRET
);

var client = new stormpath.Client({ apiKey: apiKey });
var appHref = process.env.STORMPATH_HREF;
var baseHref = 'https://api.stormpath.com/v1/accounts/';
var freeDirectory = null;
var stormpathApplication;
client.getApplication(appHref, function(err, app) {
  if (err) {
    throw err;
  }
  stormpathApplication = app;
});

var allowScopeForAccount = function(account, scope) {
  switch (scope) {
    case 'user:basic-info': {
      return true;
    }
  }
  return false;
};

var scopeFactory = function(account, requestedScopes) {
  var allowedScopes = [];
  for (var scope in requestedScopes) {
    if (allowScopeForAccount(account, scope)) {
      allowedScopes.push(scope);
    }
  }
  return allowedScopes;
};
exports.getAccessToken = function(req, res , next) {
  stormpathApplication.authenticateApiRequest({
    request: req,
    ttl: 3600,
    scopeFactory: scopeFactory,
  },
   function(err, authResult) {
    if (!err) {
      res.send(authResult.tokenResponse);
    } else {
      console.log(err, err.stack || err.message);
      res.status(400).send(err);
    }
  });
};

exports.authenticateUserAPI = function(req, res , next) {
  stormpathApplication.authenticateApiRequest({ request: req },
   function(err, authResult) {
    if (!err) {
      PersonalProfile.getProfileById({params: {id: authResult.jwtObject.code}},
          function(usr) {
          if (!usr) {
            return res.status(400).send({});
          }
          res.json({
            uid: usr.uid,
            username: usr.name + ' ' + usr.lastName,
            Img: usr.pictureUrl || '',
            email: usr.email,
          });
        });
    } else {
      res.status(400).send(err);
    }
  });
};