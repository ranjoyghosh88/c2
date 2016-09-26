var express = require('express');
var app = express.Router();
var middleware = require('../middleware');
require('dotenv').load();
var async = require('async');
var requireDir = require('require-dir');
var api = require('../../routes/csquire-api');
var _ = require('underscore');

var routes = {
  api: {
    endPoints: require('../../routes/api/endPoints'),
    auth: require('../../routes/api/auth'),
    jwtauth: require('../../routes/api/jwtauth'),
  },
  views: requireDir('../../routes/views/'),
};

app.get('/', middleware.swithSignInUp, routes.views.login);

app.post('/', function(req, res , next) {
  var data = (req.method === 'POST') ? req.body : req.query;
  var authcRequest = {
    username: req.body.username,
    password: req.body.password,
  };
  res.locals.Faileduser = authcRequest.username;
  api.login.create(authcRequest, req.session, function(error, loginData) {
    if (error) {
      return res.render('pages/login',
            {
        error: error.getBody().message,
        Faileduser: res.locals.Faileduser,
        loginPage: 'true',
        errcode: error.code,
        title: 'CSquire | Login',
        hidden: req.query,
      });
    }
    var isAdmin = _.find(loginData.group.items, { name: 'admin' });
    req.session.userToken = loginData.token;
    req.session.loginData = loginData;
    req.session.user = loginData.dbuserProfile;
    api.functionalRole.get(req.session.user.functionalRole, null, req.session,
     function(err, funRole) {
      req.session.user.functionalRole = funRole;
      req.session.customdata = loginData.customdata.apiObjectFilter;
      if (isAdmin) {
        var redirectUrl = req.body.returnUrl || '/dashboard';
        res.redirect(redirectUrl);
        next();
      } else {
        return res.render('pages/login',
            {
          error: 'Please enter valid eamil and password',
          loginPage: 'true',
          title: 'CSquire | Login',
          hidden: req.query,
        });
      }
    });
  });
});

module.exports = app;