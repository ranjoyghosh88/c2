var express = require('express');
var app = express.Router();
var middleware = require('../middleware');

app.get('/', middleware.requireUser, function(req, res, next) {
  return res.render('pages/dashboard',
  {
    title: 'CSquire | Dashboard',
    activePage: 'dashboard',
    loginData: req.session.user,
  });
});

app.post('/', function(req, res, next) {
  res.send('dashboard');
});

module.exports = app;