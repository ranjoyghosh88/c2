var express = require('express');
var app = express.Router();
var multer  = require('multer');
require('dotenv').load();
middleware = require('./middleware');


app.get('/', middleware.setUser,
    middleware.swithSignInUp, function(req, res, next) {
  console.log('create process of RFP --> render template');
  res.render('pages/createRfp', {
    title: 'CSquire | Create RFP',
  });
});

function handleErr(err, req, res, next) {
  console.log(err);
  res.render('pages/customerr', {
    error: {
      header: err,
      text: 'Please contact ',
    },
  });
}
module.exports = app;
