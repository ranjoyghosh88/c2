var express = require('express');
var requestify = require('requestify');
var requestify2 = require('requestify');
var app = express.Router();
require('dotenv').load();
var requireDir = require('require-dir');
middleware = require('./middleware');
var log = require('./middleware').logger;
var allRouter = '../routes/api';
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
  },
  views: requireDir('./views/'),
};
console.log('======== SESSION VALUE 0 ==========');
exports.setCustomdataGuestUser = function(req, res, next) {
  console.log('======== SESSION VALUE 1 ==========');
  if (!req.session.user) {
    // Get customdata of guest user
    requestify.request(process.env.GUESTUSER_HREF, {
      method: 'GET',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
        .then(function(response) {
          var _accountHref = response.getBody();
          if (response.getCode() === 200 || 201) {
            console.log('======== SESSION VALUE 2 ==========');
            var customdataHref = [];
            if (_accountHref && _accountHref.customData &&
              _accountHref.customData.href) {
              customdataHref = _accountHref.customData.href;
            }
            // ==== Getting guest user customdata ==== //
            requestify2.request(customdataHref, {
              method: 'GET',
              auth: {
                username: process.env.STORMPATH_API_KEY_ID,
                password: process.env.STORMPATH_API_KEY_SECRET,
              },
            })
              .then(function(response) {
                var _customdata = response.getBody();
                if (response.getCode() === 200 || 201) {
                  console.log('======== SESSION VALUE CUSTOMDATA ==========');
                  req.session.customdata = _customdata.apiObjectFilter;
                  next();
                }
              });
            // ===== Getting guest user customdata =====//
          }
        });
  } else {
    console.log('======== SESSION VALUE 3 ==========');
    next();
  }
};
