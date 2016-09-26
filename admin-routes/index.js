var express = require('express');
var app = express.Router();
var login = require('./login');
var dashboard = require('./dashboard');
var qsMapping = require('./qsMapping');
var qsCreate = require('./qsCreate');
var error = require('./error');
app.use('/', login);
app.use('/login', login);
app.use('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});
app.use('/dashboard', dashboard);
app.use('/qsMapping', qsMapping);
app.use('/qsCreate', qsCreate);
app.use('/error', error);


module.exports = app;