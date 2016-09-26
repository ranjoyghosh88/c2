var _ = require('underscore');
/**
	Initialises the standard view locals
*/
exports.initLocals = function(req, res, next) {
  var locals = res.locals;
  locals.navLinks = [
   { label: 'Home', key: 'home', href: '/' },
   { label: 'Blog', key: 'blog', href: '/blog' },
   { label: 'Gallery', key: 'gallery', href: '/gallery' },
   { label: 'Contact', key: 'contact', href: '/contact' },
  ];
  locals.user = req.user;
  next();
};
/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function(req, res, next) {
  res.locals.messages = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error'),
  };
  next();
};
exports.returnUrl = function(req, res, next) {
  var ignoreUrls = ['/', '/register'];
  var currUrl = req.originalUrl.split('?');
  if (req.method === 'GET' && ignoreUrls.indexOf(currUrl[0]) < 0) {
    res.locals.retUrl = req.originalUrl;
  }
  next();
};


exports.swithSignInUp = function(req, res, next) {
  if (req.session.user && req.query.returnUrl) {
    return res.redirect(req.query.returnUrl);
  } else {
    res.locals.swithSignInUp = 'hidden';
    next();
  }
};

exports.requireUser = function(req, res, next) {
  var controller;
  if (!req.session.user) {
    console.log('not logged in redirecting to login');
    res.locals.user = false;
    return res.redirect('/login?returnUrl=' + req.originalUrl);
  }
  res.locals.user = true;
  res.locals.loginData = req.session.user;
  next();
};

/*
  This module provides logging capabilities
*/
// = exports.logger = require('./logHandler');
/*
  This module provides a CDN capability for the JADE pages
*/
exports.CDN = function(req, res, next) {
  var getCDNPath = function(path, config, options) {
    var key = options && options.key ? options.key : '';
    var cdnPath = '';
    if (key === '') {
      if (path.indexOf('.js') > 0) {
        cdnPath = config.jsCDN + path;
      } else if (path.indexOf('.css') > 0) {
        cdnPath = config.cssCDN + path;
      } else if ((/\.(gif|jpg|jpeg|tiff|png|ico)$/i).test(path)) {
        cdnPath = config.imgCDN + path;
      } else {
        cdnPath = path;
      }
    } else {
      if (config.customCDN[key]) {
        cdnPath = config.customCDN[key] + path;
      } else {
        cdnPath = path;
      }
    }
    // === var _cdnpath = getCDNPath(path, config, options);
    if (process.env.NODE_ENV === 'production' ||
     process.env.NODE_ENV === 'qa') {
      var pkg = require('../package.json');
      cdnPath = cdnPath.replace('/upload', '/upload/' +
       pkg.version || '/upload');
    }
    return cdnPath;
  };
  res.locals.cdn = function(path, options) {
    var cdnConfig = require('../config/cdnConfig.js');
    var config = cdnConfig[process.env.NODE_ENV || 'development'];
    if (config === undefined || config === null || config === {}) {
      config = cdnConfig.development;
    }
    return getCDNPath(path, config, options);
  };
  next();
};

