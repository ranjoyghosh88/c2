var express = require('express');
var requestify = require('requestify');
var requestify2 = require('requestify');
var requestify3 = require('requestify');
var _ = require('lodash');
var app = express.Router();
require('dotenv').load();
var requireDir = require('require-dir');
middleware = require('./middleware');
// === var logger = require('./logHandler');
var allRouter =  '../routes/api';
var profileModel = require('../models/personalProfile');
var headCountController = require(allRouter + '/companyHeadCount/controller');
var profileController = require('./api/personalProfile/controller');
var jobtitleController = require(allRouter + '/jobTitle/controller');
var Linkedin = require('node-linkedin')(
    process.env.LINKEDIN_API_KEYID,
    process.env.LINKEDIN_API_KEY_SECRET,
    process.env.LOCALHOST + '/oauth/linkedin/callback');
var _path = 'developmentSoftwares' +
    ' vendorServices professionalLevel' +
    ' businessProcessAreas ' +
    'enterpriseSoftwares ' +
    'jobTitle functionalRole';
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
  },
  views: requireDir('./views/'),
};
// Linkedin
app.get('/oauth/linkedin',
    function(req, res) {
      req.session.query = req.query;
      // This will ask for permisssions
      // etc and redirect to callback url.
      Linkedin.auth.authorize(res, ['r_basicprofile', 'r_emailaddress']);
    });
app.get('/oauth/linkedin/callback',
 function(req, res) {
   if (req.body.error)   {
   }
   Linkedin.auth.getAccessToken(
      res,
      req.query.code,
      req.query.state,
        function(err, results) {
          var query = '?';
          if (err) {
            res.redirect('/login');
            return console.error(err);
          }
          // ========== Linkedin Premium Auth ======================//
          linkedinContent();
          // =========== Linkedin Content =================================//
          function linkedinContent() {
            var accessToken = 'access_token';
            var linkedin = Linkedin.init(results[accessToken]);
            linkedin.people.me(function(err, _linkedinParam) {
              // ---------------------
              if (!_linkedinParam) {
                res.redirect('/login');
                return;
              }
              var email = checkAndUpdate(_linkedinParam.emailAddress);
              var name = checkAndUpdate(_linkedinParam.firstName) +
              ' ' + _linkedinParam.lastName;
              // ===================end requestify for account data=============
              requestify2.request(process.env.STORMPATH_LINKEDIN_D +
                '/accounts?q=' + email, {
                method: 'GET',
                auth: {
                  username: process.env.STORMPATH_API_KEY_ID,
                  password: process.env.STORMPATH_API_KEY_SECRET,
                },
              })
.then(function(response) {
  if (response.getCode() === 200 || 201) {
    var _findStatus = response.body;
    var statusJson = JSON.parse(_findStatus);
    var strings = JSON.stringify(statusJson);
    if (statusJson.items.length === 0) {
      profileView();
    }    else if (statusJson.items.length > 0 &&
     statusJson.items[0].status === 'UNVERIFIED') {
      res.render('pages/emailverifyMsg');
    }    else {
      var _customDataObj = statusJson.items[0].customData;
      // ===================end requestify for account data=============
      requestify3.request(_customDataObj.href, {
        method: 'GET',
        auth: {
          username: process.env.STORMPATH_API_KEY_ID,
          password: process.env.STORMPATH_API_KEY_SECRET,
        },
      })
.then(function(response) {
  if (response.getCode() === 200 || 201) {
    var _findStatus1 = response.body;
    var statusJson1 = JSON.parse(_findStatus1);
    var strings1 = JSON.stringify(statusJson1);
    var validUrl = statusJson.href;
    // === if(statusJson1.isPremium === 'true'){
    routes.api.auth.linkedinAuthenticateUser(email,
     'CSquireV3' + email,
      req,
       res,
           function(invalidateError) {
             var _invalidateError = checkAndUpdate(invalidateError);
             if (_invalidateError === 'true')      {
               res.render('pages/emailverifyMsg');
             }             else {
               profileView();
             }
           });
  }else {
    // ==== res.send(response.body);
  }
}, function(err) {
  errorHandler = 'error';
});
    }
    // ========== Linkedin Premium Auth ======================//
    // ##################################################//
  }else {
    // === profileView();
  }
}, function(err) {
  errorHandler = 'base error';
});
              function profileView() {
                var multiplePopulate = {
                  path: _path,
                };
                profileModel.findOne({
                  email: email,
                },
        function(err, profile) {
          profileModel.populate(profile, multiplePopulate,
             function(err, _profile) {
               if (_profile) {
                 // =========Requestifying for premium user==============//
                 req.session.user =  email;
                 req.session.roles = [];
                 req.session.username = name;
                 profileController.
          getProfileByEmail(email, function(profile) {
            if (profile != null) {
              req.session.role = profile.jobTitle.name;
              req.session.Img = profile.pictureUrl;
              req.session._id = profile._id;
              req.session.uid = profile.uid;
              req.session.username = profile.displayName + ' ' +
      profile.displayLastName;
              res.cookie('kb', 'true', { domain: '.csquire.com', path: '/'});
            }
            if (req.session.query) {
              (function() {
        var temp = 'redirect_uri';
        var redirectURI = req.session.query[temp];
        temp = 'client_id';
        var clientId = req.session.query[temp];
        if (redirectURI && clientId) {
          redirectURI = redirectURI.replace(/&$/, '');
          redirectURI += '&code=' + _profile._id;
          res.redirect(redirectURI);
        } else {
          res.redirect('/dashboard');
        }
      })();
            }else {
              res.render('pages/redir');
            }
          });
               }else {
                 var str = '/register/linkedin?accessToken=' +
                 results[accessToken];
                 res.redirect(str);
               }
             });
        });
              }
            });
          }
        });
 });
function checkAndUpdate(param) {
  if (param) {
    return param;
  }  else {
    return null;
  }
}
function companyName(_param) {
  var _isParam;
  var _currentCompany;
  if (_param.values !== undefined) {
    for (var i = 0;i < _param.values.length;i++)    {
      _isParam = _param.values[i].isCurrent;
      if (_isParam === true) {
        _currentCompany = _param.values[i].company;
        return _currentCompany;
      }
    }
  }  else {_currentCompany = '';return _currentCompany;}
}
function setCompanySize(getCompanyData) {
  var   companySize = '&companySize=null';
  if (getCompanyData.size) {
    headCountController.checkNameAndInsert(getCompanyData.size);
    companySize = '&companySize=' + getCompanyData.size;
  }
  return companySize;
}
// ----------------End of Linkedin-------------------------------//
module.exports = app;
