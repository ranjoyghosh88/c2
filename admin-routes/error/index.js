var express = require('express');
var app = express.Router();
var middleware = require('../middleware');

app.get('/', middleware.requireUser, function(req, res, next) {
  return res.render('pages/error',
  {
    title: 'CSquire | Error',
    activePage: 'Error',
    loginData: req.session.user,
  });
});

app.post('/', function(req, res, next) {
  res.send('Error Page');
});

app.get('/report', middleware.requireUser, function(req, res, next) {
  res.send('Report Page');
});

app.post('/report', function(req, res, next) {
  res.send('Report Page');
});

module.exports = app;