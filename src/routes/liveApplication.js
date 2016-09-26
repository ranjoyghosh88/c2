var express = require('express');
var app = express();
require('dotenv').load();
var async = require('async');
var requireDir = require('require-dir');
var middleware = require('./middleware');
var OpenTok = require('opentok');
var TOKBOX_API_KEY = process.env.TOKBOX_API_KEY;
var TOKBOX_API_SECRET = process.env.TOKBOX_API_SECRET;
var TWILIO_SID = process.env.TWILIO_SID;
var TWILIO_TOKEN = process.env.TWILIO_TOKEN;
var opentok = new OpenTok(TOKBOX_API_KEY, TOKBOX_API_SECRET);
var twilio = require('twilio');
var client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
var _ = require('lodash');
var api = require('../routes/csquire-api/');
var utils = require('./util');
opentok.createSession(function(err, session) {
  if (err) {
    throw err;
  } else {
    app.set('sessionId', session.sessionId);
  }
});
app.get('/dashboard', middleware.requireUser, function(req, res, next) {
  console.log('Launching Live Application Support Dashboard');
  api.lasQuestions.getAll({
    q: {},
  }, req.session, function(err, data) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      console.log(data);
      res.render('pages/las/liveApplication', {
        title: 'CSquire | Live Application Support',
        active: 'LAS',
        userID: req.session._id,
        lasData: data.reverse(),
      });
    }
  });
});
app.get('/videocall', middleware.requireUser, function(req, res, next) {
  console.log('Launching Live Video Support Dashboard');
  var sessionId = app.get('sessionId');
  var token = opentok.generateToken(sessionId);
  res.render('pages/las/liveVideo', {
    title: 'CSquire | Live Application Support',
    apiKey: TOKBOX_API_KEY,
    token: token,
    sessionId: sessionId,
    active: 'LAS',
  });
});
app.get('/sendSMS', middleware.requireUser, function(req, res) {
  // Send an SMS text message
  console.log('i am in sms service');
  client.sendMessage({
    to: '+917387267772',
    from: '+13197742149',
    body: 'CSquire Live Support',
  }, function(err, responseData) {
    if (!err) {
      console.log(responseData.from);
      console.log(responseData.body);
    } else {
      console.log(err);
    }
  });
});
app.get('/products', function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: req.query.q,
          $options: 'gi',
        },
      },
    };
  }
  api.productProfile.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/postquestion', middleware.requireUser, function(req, res) {
  // Send an SMS text message
  console.log('i am in post question');
  async.parallel({
    industry: function(callback) {
      api.industry.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    functionalRoles: function(callback) {
      api.functionalRole.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
        function(err, results) {
          res.locals.lasData = results;
          res.locals.userData = {
            mailId: req.session.user,
            userName: utils.formatTextCapitalize(req.session.username),
          };
          res.render('pages/las/livePostQuestion', {
            title: 'CSquire | Live Application Support',
            active: 'LAS',
            stripePubKey: process.env.STRIPE_PUBKEY,
          });
        });
});
app.post('/submitquestion', middleware.requireUser, function(req, res, next) {
  var lasPostData = req.body;
  lasPostData.createdBy = req.session._id;
  api.lasQuestions.create(lasPostData, req.session, function(err, data) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      res.render('pages/paymentSuccess', {
        title: 'CSquire | Success Payment',
      });
    }
  });
});
app.get('/quickSupportReview', function(req, res) {
  res.render('pages/las/quickSupportReview', {
    title: 'CSquire | Live Call Support',
  });
});
app.get('/voip', function(req, res) {
  // Send an SMS text message
  console.log('i am in voip service');
  var capability = new twilio.Capability(TWILIO_SID, TWILIO_TOKEN);
  capability.allowClientOutgoing('AP297ed7f1b396f5a422de3954f1cc8554');
  res.render('pages/las/liveCall', {
    title: 'CSquire | Live Call Support',
    twilioToken: capability.generate(),
  });
});
module.exports = app;
