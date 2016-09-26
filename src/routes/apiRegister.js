var async = require('async');
var express = require('express');
var app = express.Router();
var requireDir = require('require-dir');
var middleware = require('./middleware');
require('dotenv').load();

// Setup Route Bindings

app.post('/', function(req, res, cb) {
  var _data = req.body;
  async.series([
    // Load user to get userId first
        function(callback) {
          createProfile(req, res, _data);
        },
    ], function(err) {
      if (err) {
        return err;
      }
      // Here locals will be populated with 'user' and 'posts'
      console.log('sucessfull');
    });
});
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/api_auth'),
  },
  views: requireDir('./views/'),
};

function createProfile(req, res, _data) {
    routes.api.auth.createUserInternally(
        req,
        res,
        _data
    );
  }
module.exports = app;

