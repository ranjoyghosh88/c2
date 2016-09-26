var _ = require('underscore');
var profileController = require('../routes/api' +
    '/personalProfile/' +
    'controller');
var companyController = require('../routes/api' +
    '/CompanyProfile/' +
    'controller');
var productController = require('../routes/api' +
    '/productProfile/' +
    'controller');
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
/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function(req, res, next) {
  var controller;
  if (!req.session.user) {
    console.log('not logged in redirecting to login');
    res.redirect('/login?returnUrl=' + req.originalUrl);
  } else {
    (function() {
      if (!req.session.isPremium) {
        req.session.isPremium = true;
      }
      res.locals.user = req.session.user;
      res.locals.userId = req.session._id;
      res.locals.username = req.session.username;
      res.locals.role = req.session.role;
      res.locals.isPremium = req.session.isPremium;
      res.locals.uid = req.session.uid;
    })();
    (function() {
      if (req.session.roleSuper === 'superuser') {
        (function() {
          req.session.role = req.session.roleSuper;
          res.locals.isSuperUser = true; req.session.isSuperUser = true;
          res.locals.isPremium = true; req.session.isPremium = true;
        })();
        if ((req.
            baseUrl === '/company' || req.
            baseUrl === '/product') && req.query.manageProfile) {
          req.session.isMangingCompProd = true;
          if (req.baseUrl === '/company') {
            req.session.manageType = 'company';
          } else {
            req.session.manageType = 'product';
          }
        } else if (req.query.manageProfile) {
          (function() {
            req.session.isMangingCompProd = false;
            req.session.manageType = 'people';
          })();
        }
        res.locals.isMangingCompProd = req.session.isMangingCompProd;
        res.locals.manageType = req.session.manageType;
        if (req.query.manageProfile && req.query.uid) {
          req.session.manageProfile = req.query.uid;
          req.session.manageProfileUid = req.session.manageProfile;
        }
        (function() {
          if ((req.
                 baseUrl === '/company' || req.
                 baseUrl === '/product') && req.query.manageProfile) {
            req.session.manageProfile = req.params.uid;
            req.session.manageProfileUid = req.session.manageProfile;
            if (req.baseUrl === '/company') {
              controller = companyController;
            } else {
              controller = productController;
            }
          } else {
            controller = profileController;
          }
        })();
        res.locals.manageProfile = req.session.manageProfile;
      }
    })();
    res.locals.Img = req.session.Img?req.
   session.Img:res.locals.cdn('/profile.jpg');
    if (req.session.manageProfile && req.
        query.manageProfile && req.session.isSuperUser) {
      controller.getProfileByUId({
        params: {
          uid: req.session.manageProfile,
        },
      }, function(profile) {
        if (profile) {
          if (profile.lastName) {
            req.
                  session.manageProfileName = profile.
                  name + ' ' + profile.lastName;
          } else {
            req.session.manageProfileName = profile.name;
          }
          req.session.manageProfileId = profile._id;
          res.locals.manageProfileName = req.session.manageProfileName;
          res.locals.manageType = req.session.manageType;
        }
        next();
      });
    } else {
      res.locals.manageProfileName = req.session.manageProfileName;
      res.locals.manageType = req.session.manageType;
      next();
    }
  }
};
/* Middleware for those functions which
  are accessible withouot login.
  Instead of requireuser use setUser*/
exports.setUser = function(req, res, next) {
  var controller;
  (function() {
    if (req.session.user) {
      (function() {
        res.locals.user = req.session.user;
        res.locals.username = req.session.username;
        res.locals.role = req.session.role;
        res.locals.isPremium = req.session.isPremium;
        res.locals.isSuperUser = req.session.isSuperUser;
      })();
      res.locals.Img = req.session.Img?req.
     session.Img:res.locals.cdn('/profile.jpg');
      res.locals.isAdmin = _.contains(req.session.roles, 'admin');
      if ((req.
           baseUrl === '/company' || req.
           baseUrl === '/product') && req.query.manageProfile) {
        req.session.isMangingCompProd = true;
        if (req.baseUrl === '/company') {
          req.session.manageType = 'company';
        } else {
          req.session.manageType = 'product';
        }
      } else if (req.query.manageProfile) {
        req.session.isMangingCompProd = false;
        req.session.manageType = 'people';
      }
      res.locals.isMangingCompProd = req.session.isMangingCompProd;
      res.locals.manageType = req.session.manageType;
      (function() {
        if (req.query.manageProfile && req.query.uid) {
          req.session.manageProfile = req.query.uid;
          req.session.manageProfileUid = req.session.manageProfile;
        }
        if ((req.
              baseUrl === '/company' || req.
              baseUrl === '/product') && req.query.manageProfile) {
          req.session.manageProfile = req.params.uid;
          req.session.manageProfileUid = req.session.manageProfile;
          if (req.baseUrl === '/company') {
            controller = companyController;
          } else {
            controller = productController;
          }
        } else {
          controller = profileController;
        }
      })();
      res.locals.manageProfile = req.session.manageProfile;
    }
  })();
  if (req.session.
     manageProfile && req.query.
     manageProfile && req.session.isSuperUser) {
    controller.getProfileByUId({
      params: {
        uid: req.session.manageProfile,
      },
    }, function(profile) {
      if (profile) {
        if (profile.lastName) {
          req.session.manageProfileName = profile.name + ' ' + profile.lastName;
        } else {
          req.session.manageProfileName = profile.name;
        }
        req.session.manageProfileId = profile._id;
        res.locals.manageProfileName = req.session.manageProfileName;
      }
      next();
    });
  } else {
    res.locals.manageProfileName = req.session.manageProfileName;
    next();
  }
};
exports.swithSignInUp = function(req, res, next) {
  if (req.session.user && req.query.returnUrl) {
    return res.redirect(req.query.returnUrl);
  } else {
    res.locals.swithSignInUp = 'hidden';
    next();
  }
};
/*
  This module provides logging capabilities
*/
exports.logger = require('./logHandler');
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
exports.requirePremium = function(req, res, next) {
  if (!req.session.isPremium) {
    if (req.xhr) {
      return res.status(401).send({ redirect: '/upgrade' });
    }
    return res.redirect('/upgrade');
  }
  next();
};
