var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var mongoutils = require('./models/mongoose-utils');
var helmet = require('helmet');
var session = require('express-session');
var routes = require('./admin-routes');
var util = require('./routes/util');
var moment = require('moment');
var CDN = require('./routes/middleware').CDN;
var log = require('./routes/middleware').logger;
var retUrl = require('./routes/middleware').returnUrl;
var RedisStore = require('connect-redis')(session);
var api = require('./routes/csquire-api');
var async = require('async');
var _ = require('lodash');


mongoose.connect(
  config.mongo.connection,
  config.mongo.options,
  function(err) {
    if (err) {
      log.debug(err);
    } else {
      log.debug('MongoDB for Application connected');
    }
  }
);
/*
Mongoose.connect(
  config.mongo.connection,
  config.mongo.options,
  function(err) {
    if (err) {
      logger.debug(err);
    } else {
      logger.debug('DB Connected');
    }
  }
);
if (config.seedDB) { require('./config/seed'); }
*/
var app = express();
app.locals.moment = require('moment');
require('ismobile')(app);
app.use(helmet());

app.use(CDN);
// View engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
// Uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true,
  parameterLimit: 10000,
  limit: 1024 * 1024 * 10,
}));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
    pass: config.redis.pass,
    ttl: config.sessionTimeoutSeconds,
  }),
  name: 'csquire-sess',
  secret: 'somesecrettokenhere',
  resave: true,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, '/public')));



function init(cb) {
  setTimeout(function() {
    if (global.token) {
      console.log('started', app.get('env'), 'on port', app.get('port'));
      cb();
    } else {
      init(cb);
    }
  }, 1000);
}

function useErrorHandlers(app) {
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  app.locals.googleTagId = config.googleTagId;
  // Development error handler
  // Will print stacktrace
  if (app.get('env') === 'development' || app.get('env') === 'qa') {
    app.use(function(err, req, res, next) {
      console.log(err.stack || err.message || err);
      res.status(err.status || 500);
      res.render('error', {
        message: err.stackTrace || err.message,
        error: err,
      });
    });
  }
  // Production error handler
  // No stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });


}
function mountRoutes() {
  app.use('/', retUrl);
  app.use('/', routes);
  // Catch 404 and forward to error handler
  useErrorHandlers(app);
}
init(mountRoutes);

module.exports = app;
