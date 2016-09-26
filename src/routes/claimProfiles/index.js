var express = require('express');
var app = express.Router();
var api = require('../csquire-api');
var _ = require('lodash');
var middleware = require('../middleware');
var url = require('url');
app.use(middleware.requireUser, middleware.requirePremium);
var util = require('../util');

var claimUrl = '/login?';
var companyUrl = '/login?returnUrl=/company';
var profileUrl = '/login?returnUrl=/people';
var claimData = {
  returnUrl: '/inbox/connectionRequest#claimedProfile',
};
app.post('/', function(req, res, next) {
  var referer = req.header('Referer') || '';
  var domain = url.format({
    protocol: url.parse(referer).protocol,
    host: url.parse(referer).host,
  });
  req.body = _.extend(req.body, {
    claimFrom: req.session._id.toString(),
  }, { claimUrl: domain + claimUrl + util.querystring(claimData) },
   {
     profileUrl: domain + profileUrl,
   }, {
     companyUrl: domain + companyUrl,
   });
  if (req.session.isPremium) {
    api.claimedProfile.create(req.body, req.session, function(err, data) {
      if (err) {
        return next(err);
      }
      res.send(data);
    });
  } else {
    return res.send('gotoPremium');
  }
});

app.post('/ChangeClaimstatus', function(req, res, next) {
  var referer = req.header('Referer') || '';
  var domain = url.format({
    protocol: url.parse(referer).protocol,
    host: url.parse(referer).host,
  });
  req.body = _.extend(req.body, {
    claimUrl: domain + claimUrl +
          util.querystring(claimData),
  }, { profileUrl: domain + profileUrl }, {
    companyUrl: domain + companyUrl,
  }, { adminId: req.session._id });
  api.claimedProfile.create(req.body, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.redirect('/inbox/connectionRequest#claimedProfile');
  });
});

module.exports = app;