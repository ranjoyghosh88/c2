
var express = require('express');
var app = express.Router();
require('dotenv').load();
var async = require('async');
var requireDir = require('require-dir');
var middleware = require('./middleware');
var allRouter = '../routes/api';
var _ = require('lodash');
var profileModel = require('../models/personalProfile');
var url = require('url');
var util = require('../models/util');
var utils = require('./util');
var companyModel = require('../models/companyProfile');
var productModel = require('../models/productProfile');
var jobtitleController = require(allRouter + '/jobTitle/controller');
var profileController = require(allRouter + '/personalProfile/controller');
var companyController = require(allRouter + '/CompanyProfile/controller');
var productController = require(allRouter + '/productProfile/controller');
var relationController = require(allRouter + '/connectionRelation/controller');
var qsUtils = require('./quickSupportUtil');
var wordpressPosts = require('./wordpress-posts');
var querystring = require('querystring');
var moment = require('moment');

var api = require('../routes/csquire-api/');
var kb = require('../routes/api/knowledgebase');
var opts = [
  {
    path: 'connections.profiles.refId.jobTitle',
    model: 'jobTitle',
  },
  {
    path: 'connections.profiles.refId.company',
    model: 'companyProfile',
  }, {
    path: 'connections.products.refId.goodFor',
    model: 'enterpriseSoftware',
  }, {
    path: 'connections.products.refId.company',
    model: 'companyProfile',
  }, {
    path: 'connections.companies.refId.speciality',
  }, {
    path: 'connections.companies.refId.type',
    model: 'vendorType',
  },
];
var optsApi = [{
    path: 'developmentSoftwares',
  }, {
    path: 'vendorServices',
  }, {
    path: 'professionalLevel',
  }, {
    path: 'businessProcessAreas',
  }, {
    path: 'enterpriseSoftwares',
  }, {
    path: 'jobTitle',
  }, {
    path: 'functionalRole',
  }, {
    path: 'followingProfiles.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
  }, {
    path: 'followers.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
  }, {
    path: 'company',
  }, {
    path: 'connections.profile',
  }, {
    path: 'connections.companies',
  },
  {
    path: 'connections.profiles.refId',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.companies.refId',
    model: 'companyProfile',
  },
  {
    path: 'connections.products.refId',
    model: 'productProfile',
  },
];
var multiplePopulate = [{
    path: 'jobTitle',
  }, {
    path: 'functionalRole',
  }, {
    path: 'company',
  }, {
    path: 'followingProfiles.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
  }, {
    path: 'followingProfiles.companies',
    select: '_id name uid logo',
  }, {
    path: 'followingProfiles.products',
    select: '_id name uid logo',
  }, {
    path: 'followers.profiles',
    select: '_id name lastName uid pictureUrl',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
  }, {
    path: 'favourites.products',
    select: '_id name uid logo',
    model: 'productProfile',
  }, {
    path: 'favourites.companies',
    select: '_id name uid logo',
    model: 'companyProfile',
  }, {
    path: 'favourites.profiles',
    select: '_id name lastName uid pictureUrl',
    model: 'personalProfile',
  }, {
    path: 'claimed.products',
    select: '_id name uid logo',
    model: 'productProfile',
  }, {
    path: 'claimed.companies',
    select: '_id name uid logo',
    model: 'companyProfile',
  }, {
    path: 'connections.products.refId',
    model: 'productProfile',
  }, {
    path: 'connections.profiles.refId',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  }, {
    path: 'connections.companies.refId',
    select: '_id name uid logo _t',
    model: 'companyProfile',
  }, {
    path: 'connections.products.refId',
    select: '_id name uid logo _t',
    model: 'productProfile',
  },
];
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
    jwtauth: require('./api/jwtauth'),
  },
  views: requireDir('./views/'),
};
// Setup Route Bindings
// -------------------------------------------------------------------
// Views
app.use('*', function(req, res, next) {
  res.locals.selectKey = req.query.selectKey || 'all';
  res.locals.blogHref = process.env.BLOG_HREF;
  res.locals.wordpressNews = process.env.WORDPRESS_NEWS;
  res.locals.wordpressFaqs = process.env.WORDPRESS_FAQS;
  res.locals.quicksupport = process.env.QUICKSUPPORT;
  next();
});
/* =
app.get('/people/:uid',
    middleware.setUser,
    middleware.swithSignInUp,
    function(req, res, next) {
  var updateUid = req.session.uid;
  if (req.params.uid === 'guest') {
    next('Not found');
  }
  if (req.session.isSuperUser && req.params.uid &&
                        req.params.uid === req.session.manageProfile) {
    return res.redirect('/profile?uid=' + req.params.uid);
  }
  if (!req.session.isSuperUser && req.session.uid === req.params.uid) {
    return res.redirect('/profile');
  }
  res.locals.key = 'people';
  // Set user viewd
  var customData = {};
  if (req.session.customdata && req.session.customdata.personalProfile) {
    customData = _.defaults({},
                          req.session.customdata.personalProfile);
  }
  if (req.session.manageProfile && req.session.isSuperUser) {
    updateUid = req.session.manageProfile;
  }
  profileController.getProfileByUId({
    params: { uid: updateUid },
  }, function(loggedUser) {
    profileController.getProfileByUId(req, function(profile) {
      if (profile) {
        if (loggedUser) {
          profile.connections.companies =
          _.filter(profile.connections.companies, function(obj) {
            if (!obj.refId || profile.company[0]._id.equals(obj.refId._id)) {
              return false;
            }
            return true;
          });
          res.locals.isFav =
              loggedUser.favourites.profiles.indexOf(profile._id) !== -1;
          var isFollower = _.find(profile.followers.profiles,
                function(obj) {
            return obj._id.equals(loggedUser._id);
          });
          res.locals.isFollower = isFollower;
          var isCon = _.find(profile.connections.profiles, function(obj) {
            if (obj.refId && obj.refId._id) {
              return obj.refId._id.equals(loggedUser._id);
            }
          });
          res.locals.isCon = isCon;
        }
        getProfileChild(profile, customData, req, res);
      } else { next('Not found'); }
    });
  });
});
= */

var isEmpty = function(val) {
  if (val === 'undefined' || typeof val === 'undefined' ||
val === null || val === 'null' || val === '') {
    return true;
  } else {
    return false;
  }
};

app.post('/deletePastCompany', function(req, res) {
  companyModel.findOne({ uid: req.body.uid }, function(err, result) {
    profileController.deletePastCompany(req.session._id, result._id,
    function(err, result) {
      if (err) {
        console.log('error');
      } else {
        console.log('updated');
      }
    });
  });
});
app.post('/checkCompanyExist', function(req, res) {
  console.log(req.body.companyName);
  companyController.getCompanyByName(req.body.companyName,
  function(err, result) {
    if (err) {
      return res.status(404).send(err.message);
    }
    console.log('%%%%%%%%%%%%%% company name data : ' + result);
    if (result) {
      res.send(result);
    } else {
      res.send(null);
      console.log('not found');
    }
  });
});
app.post('/checkProductExist', function(req, res) {
  console.log(req.body.productName);
  productController.getProductByName(req.body.productName,
  function(err, result) {
    if (err) {
      return res.status(404).send(err.message);
    }
    if (result) {
      res.send(result);
    } else {
      res.send(null);
      console.log('not found');
    }
  });
});

app.post('/addPastCompany', function(req, res) {
  var updateUid = req.session.manageProfile;
  req.query.connectFrom = req.query.connectFrom?req.query.connectFrom:'people';
  var data = {
    companyInfo: req.body,
    userInfo: req.session,
  };
  /* =
    api.companyProfile.create(data, function(err, result) {
      if (err) {
        return callback(err.message, null);
      }
      if (req.session.isSuperUser) {
        if (req.body.addMore) {
          return res.redirect('/profile?editSection=' +
  * 'PastCompanies&uid=' +updateUid + '#pastcompanies');
        }
        return res.redirect('/profile?uid=' + updateUid);
      } else {
        if (req.body.addMore) {
          return res.redirect('/profile?editSection=' +
                            'PastCompanies#pastcompanies');
        }
        return res.redirect('/profile');
      }
    });
    */
  companyController.getCompanyByName(req.body.name,
  function(err, result) {
    var updateUid = null;
    if (result) {
      console.log('add past company if part');
      res.send(result);
    } else {
      var companyData = req.body;
      companyData.admin = req.session._id;
      companyData.employees = req.session._id;
      if (req.session.isSuperUser) {
        updateUid = req.session.manageProfile;
      } else {
        updateUid = req.session.uid;
      }
      companyController.createAPI(req.body, function(err, _data) {
        if (err) {
          return res.status(400).send(err.message);
        } else {
          var orphanRelation = relationController.
          getRelationById(['50'], function(err, data) {
            if (err) {
              return res.status(400).send(err.message);
            }
            if (data && data.length) {
              data = data[0];
              if (req.query.connectFrom) {
                data.connectionFrom = req.query.connectFrom;
                var options = {
                  connectFromId: isEmpty(req.query.connectFromId)?
req.session._id:req.query.connectFromId,
                  connectToId: _data._id,
                  connectionFromType: isEmpty(data.connectionFrom)?
'people':data.connectionFrom,
                  connectionToType: data.connectionTo,
                  connectAs: 'Creator',
                  connectedAs: 'Profile Originator',
                  isAdd: 'true',
                  connectionStatus: util.EnumConnectionStatus.APPROVED,
                };
                options.relationId = _.findWhere(
                global.MasterCollection.relationTypes, {
                  connectionFrom: options.connectionFromType,
                  connectionTo: options.connectionToType, connectAs: 'Creator',
                })._id;
                var connectionData = { data: [options] };
                api.connections.create(connectionData, req.session,
                  function(err, resp) {
                  if (err) {
                    return next(err);
                  } if (resp.objConnectionFrom &&
resp.objConnectionFrom.uid) {
                    return res.redirect('/' + req.query.connectFrom + '/' +
resp.objConnectionFrom.uid);
                  }
                  return res.redirect('/company/' + _data.uid);
                });
              } else {
                profileController.setConnectionsApi(updateUid,
_data.uid, data.connectionFrom, data.connectionTo,
data.connectAs, data.connectedAs, 'true',
              false, function(err, isUpdated, alreadtyExist) {
                  if (err) {
                    return res.status(400).send(err.message);
                  }
                  if (req.session.isSuperUser) {
                    if (req.body.addMore) {
                      return res.redirect('/profile?editSection=' +
'PastCompanies&uid=' + updateUid +
'&tab=' + req.query.tab);
                    }
                    return res.redirect('/profile?uid=' + updateUid);
                  } else {
                    if (req.body.addMore) {
                      return res.redirect('/profile?editSection=' +
'PastCompanies' + '&tab=' +
req.query.tab + '&addmore=true');
                    }
                    return res.redirect('/profile' + '?tab=' + req.query.tab);
                  }
                });
              }
            }
          });
        }
      });
    }
  });

});

app.post('/addProduct', function(req, res) {
  var adminId = req.session._id;
  if (req.session.manageProfile && req.session.isSuperUser &&
req.body.connectFrom === 'people') {
    adminId = req.session.manageProfileId;
  }
  api.productProfile.create(_.extend(req.body, { admin: adminId }),
    req.session, function(err, result) {
    if (err) {
      return next(err);
    }
    var connectFromId = isEmpty(req.body.connectFromId)?
        req.session._id:req.body.connectFromId;
    var connectionFromType = isEmpty(req.body.connectFrom)?
    'people':req.body.connectFrom;
    var options = {
      connectFromId: connectFromId,
      connectToId: result._id,
      connectionFromType: connectionFromType,
      connectionToType: 'product',
      connectAs: 'Creator',
      connectedAs: 'Profile Originator',
      isAdd: 'true',
      connectionStatus: util.EnumConnectionStatus.APPROVED,
    };
    options.relationId = _.findWhere(global.MasterCollection.relationTypes, {
      connectionFrom: options.connectionFromType,
      connectionTo: options.connectionToType, connectAs: 'Creator',
    })._id;
    var connectionData = { data: [options] };
    api.connections.create(connectionData, req.session, function(error, data) {
      if (error) {
        return next(error);
      }
      data = data[0];
      if (data && data.objConnectionFrom && data.objConnectionFrom.uid &&
       connectionFromType === 'company') {
        return res.redirect('/company/' + data.objConnectionFrom.uid);
      }
      return res.redirect('/product/' + result.uid);
    });
  });
  /*
   Api.Specialization.create(data, req.session, function(err, result) {
     if (err) {
       return res.status(400).send(err.message);
     }
     if (req.session.isSuperUser) {
       if (req.body.addMore) {
         return res.redirect('/profile?editSection=' +
             'PastProducts&uid=' + updateUid + '&tab=' + req.query.tab);
       }
       return res.redirect('/profile?uid=' + updateUid);
     } else {
       if (req.body.addMore) {
         return res.redirect('/profile?editSection=' +
          'PastProducts' + '&tab=' + req.query.tab + '&addmore=true');
       }
       return res.redirect('/profile' + '?tab=' + req.query.tab);
     }
  });
  */
});
app.get('/deactivation', middleware.setUser, function(req, res, next) {
  res.render('pages/deactivation');
});
app.post('/beginDeactivate', middleware.requireUser, function(req, res, next) {
  api.personalProfile.delete(req.session._id,
    req.session, function(err, isDeleted) {
    if (err) {
      if (err.code === 403) {
        return next('Access Denied!!');
      } else {
        return next();
      }
    }
    return res.redirect('/accountSettings');
  });
});
app.get('/endDeactivate', middleware.requireUser, function(req, res, next) {
  api.deactivateUser.delete(req.session._id,
    req.session, function(err, isDeleted) {
    if (err) {
      if (err.code === 403) {
        return next('Access Denied!!');
      } else {
        return next();
      }
    }
    res.clearCookie('kb', { domain: '.csquire.com', path: '/' });
    req.session.destroy();
    return res.redirect('/deactivation');

  });
});
app.get('/temp', middleware.setUser, function(req, res, next) {
  res.render('pages/connection');
});
app.get('/', middleware.setUser, routes.views.index);
app.get('/upgrade', middleware.requireUser, routes.views.upgrade);
app.post('/upgrade', middleware.requireUser, routes.api.auth.upgrade);
app.get('/login', middleware.swithSignInUp, routes.views.login);
app.get('/oauth/authorize', function(req, res, next) {
  var temp = 'redirect_uri';
  var redirectURI = req.query[temp];
  if (redirectURI) {
    redirectURI = redirectURI.replace(/\?$/, '');
    redirectURI += '?';
    for (var key in req.query) {
      if (key !== 'redirect_uri') {
        redirectURI += key + '=' + req.query[key] + '&';
      }
    }
    req.query[temp] = redirectURI;
  }
  temp = 'client_id';
  var clientId = req.query[temp];
  if (redirectURI && clientId && req.session._id) {
    (function() {
      redirectURI = redirectURI.replace(/&$/, '');
      redirectURI += '&code=' + req.session._id;
      res.redirect(redirectURI);
    })();
  } else {
    next();
  }
}, routes.views.login);
app.get('/emailVerification', routes.views.emailverification);
// Password reset page rendered for submitting email *1
app.get('/resetPassword', routes.views.passwordReset);
// When user clicks on link in mail to confirm password reset
app.get('/passwordReset', routes.views.confirmPasswordReset);
app.get('/resetpwdemailconfirmation', routes.views.resetpwdemailconfirmation);
// Route called by *1 after entering email
app.post('/passwordReset', routes.views.SubmitPasswordReset);
app.get('/privacypolicy', middleware.setUser, function(req, res) {
  res.render('pages/privacyPolicy', {
    title: 'CSquire | Privacy Policy',
  });
});
app.get('/termsofservices', middleware.setUser, function(req, res) {
  res.render('pages/tos',
        { title: 'CSquire | Terms of Service' });
});

// -------------------------------------------------------------------
// API to access stormpath
/* Middlewares and the names
  with same names
  in auth and routes
  are just because,
  the middwr serves data
  to corresponding route*/

/* Type-ahead route
   Parameters:
    1: type- eg. jobTitle,
    2: query- eg. [any string to get the data]
*/
app.get('/masterSearch/:type', utils.search);
app.get('/masterSearchAddTo/:type', utils.searchToAdd);
app.get('/master/:type', middleware.requireUser, utils.getMaster);
// Needs to change
app.get('/profile-fav/:type/:uid/:isSet',
    middleware.requireUser,
    function(req, res) {
  var updateUid = req.session.uid;
  var options = {
    loggedPersonId: req.session._id,
    favId: req.params.uid,
    connectionType: req.params.type,
    addTofav: req.params.isSet,
  };
  if (req.session.manageProfile && req.session.isSuperUser &&
         req.session.manageType === 'people') {
    options.loggedPersonId = req.session.manageProfileId;
  }
  api.favourites.create(options, req.session, function(err, isUpdated) {
    if (err) {
      if (err.code === 403) {
        return res.status(403).send(err);
      } else {
        return res.status(400).send(err.message);
      }
    }
    return res.send(isUpdated);
  });
});

// Connection api
// Needs to change
app.post('/profile-con/:connectionFromType/:connectionToType/' +
  ':connectAs/:connectedAs/:uid/:isSet',
    middleware.requireUser,
    function(req, res) {
  var updateUid = req.session._id;
  var options = {
    connectFromId: updateUid,
    connectToId: req.params.uid,
    connectionFromType: req.params.connectionFromType,
    connectionToType: req.params.connectionToType,
    connectAs: req.params.connectAs,
    connectedAs: req.params.connectedAs,
    manageProfileUid: req.session.manageProfile,
    isAdd: req.params.isSet,
    isSuperUser: req.session.isSuperUser,
    connectionStatus: 'PENDING',
  };
  api.connections.create([options], req.session, function(err, data) {
    if (err) {
      return res.status(400).send(err.message);
    }
    if (req.query.red) {
      console.log(req.query.red);
    }
    if (data.msg === 'Connection Already Exist') {
      return res.render('../views/pages/actionExist.jade');
    }
    if (req.params.isSet === 'false') {
      return res.redirect('/' + req.params.connectionToType +
                                          '/' + req.params.uid);
    }
    if (req.session.manageProfile && req.session.isSuperUser) {
      return res.redirect('/profile?uid=' + req.session.uid);
    } else {
      return res.redirect('/profile');
    }
  });
});
app.post('/connectionInvitation/:connectionFromType/:' +
     'connectionToType/:' +
      'tab/:' + 'uid', middleware.requireUser,
      function(req, res, next) {
  var type;
  switch (req.params.connectionFromType) {
    case 'people': {
      type = 'connectionType';
      break;
    }
    case 'company': {
      type = 'companyConnectionType';
      break;
    }
    case 'product': {
      type = 'productConnectionType';
      break;
    }

  }
  var updateUid = req.session._id;
  if (req.session.manageProfile && req.session.isSuperUser &&
                             req.params.connectionFromType === 'people') {
    updateUid = req.session.manageProfileId;
  }
  var options = {
    loggedUid: updateUid,
    conUid: req.params.uid,
    connectionFromType: req.params.connectionFromType,
    connectionToType: req.params.connectionToType,
  };
  api.connections.getAll(options, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    data.relationTypes = _.filter(data.relationTypes, function(obj) {
      if (obj._id === 50 || obj._id === 51 || obj.connectAs === 'Creator' ||
           obj.connectedAs === 'Creator') {
        return false;
      }
      if (req.session.customdata[type][req.params.tab]) {
        if (req.session.customdata[type][req.params.tab]._id.length) {
          req.session.customdata[type][req.params.tab]._id =
_.unique(req.session.customdata[type][req.params.tab]._id);
          if (_.indexOf(req.session.customdata[type][req.params.tab]._id,
obj._id) !== -1) {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
    res.locals.conFromId = isEmpty(req.query.conFromId)?
                                req.session._id:req.query.conFromId;
    res.locals.conFromName = req.query.conFromName;
    res.locals.relType = _.groupBy(data.relationTypes, 'connectedAs');
    res.locals.connectionTo = data.con.doc;
    res.locals.header = req.params.tab;
    res.locals.returnUrl = req.body.returnUrl;
    res.locals.connectionFromType = req.params.connectionFromType;
    res.locals.connectionToType = req.params.connectionToType;
    api.personalProfile.get(updateUid, {},
      req.session, function(err, loggedUser) {
      if (err) {
        return res.status(400).send(err.message);
      }
      var compName = '';
      var compId = loggedUser &&
 loggedUser.company[0] ? loggedUser.company[0] : null;
      if (!compId) {
        return res.render('pages/connection', {
          curCompany: compName,
        });
      }
      companyModel.findById(compId, function(err, comp) {
        if (err) {
          return res.status(400).send(err.message);
        }
        compName = comp ? comp.name : '';
        return res.render('pages/connection', {
          curCompany: compName,
        });
      });
    });
  });
});

app.post(
  '/login',
     routes.api.auth.authenticateUser,
     routes.api.endPoints.authenticateUser
); // Define content:json in http post body to get json response

app.get(
  '/rfp/create', utils.isFeatureAvailable('rfp'),
      middleware.requireUser,
      middleware.requirePremium,
      function(req, res) {
    if (req.query._id) {
      render();
      return;
    } else {
      api.personalProfile.get(req.session._id,
            { populate: 'company' }, req.session, function(err, data) {
        if (err) {
          return next(err);
        }
        if (_.includes(data.company[0].admin, data._id.toString())) {
          render(data.company);
        } else {
          render();
        }
      });
    }
    function render(data) {
      res.render('pages/createRfp.jade', {
        title: 'CSquire | ' + (req.query._id ? 'Edit RFP' : 'Create RFP'),
        activePage: 'RFP',
        _id: req.query._id,
        data: data || null,
      });
    }
  }
);

app.get(
  '/rfp/respond', utils.isFeatureAvailable('rfp'),
      middleware.requireUser,
      middleware.requirePremium,
      function(req, res) {
    if (req.query._id) {
      res.render('pages/respondRfp.jade', {
        title: 'CSquire | RFP Response',
        activePage: 'RFP',
        _id: req.query._id,
      });
    } else {
      next(err);
    }
  }
);

app.get(
  '/rfp-review/:_id', utils.isFeatureAvailable('rfp'),
   middleware.requireUser,
      middleware.requirePremium,
      function(req, res, next) {
    if (!req.params._id) {
      res.status = 400;
      return next('Not Found!!');
    }
    api.rfps.get(req.params._id, null, req.session, function(err, rfp) {
      if (err) {
        return next(err);
      }
      if (!rfp || rfp.state !== 'completed') {
        res.statusCode = 400;
        return next('Not Found!!');
      }
      res.render('pages/rfp/rfp-review.jade', {
        title: 'CSquire | RFP Review',
        activePage: 'RFP',
        rfp: rfp,
        _id: req.params._id,
      });
    });
  }
);
app.get(
  '/rfp-analyze-summary/:_id', utils.isFeatureAvailable('rfp'),
   middleware.requireUser,
      middleware.requirePremium,
      function(req, res, next) {
    if (!req.params._id) {
      res.status = 400;
      return next('Not Found!!');
    }
    api.rfps.get(req.params._id, null, req.session, function(err, rfp) {
      if (err) {
        return next(err);
      }
      if (!rfp) {
        res.status = 400;
        return next('Not Found!!');
      }
      res.render('pages/rfp/rfp-analyze-summary.jade', {
        title: 'CSquire | RFP Analyze Summary',
        activePage: 'RFP',
        rfp: rfp,
        _id: req.params._id,
      });
    });
  }
);
app.get(
  '/rfp-analyze-reorder/:_id', utils.isFeatureAvailable('rfp'),
    middleware.requireUser,
    middleware.requirePremium,
    function(req, res, next) {
    if (!req.params._id) {
      res.status = 400;
      return next('Not Found!!');
    }
    api.rfps.get(req.params._id, null, req.session, function(err, rfp) {
      if (err) {
        return next(err);
      }
      if (!rfp) {
        res.status = 400;
        return next('Not Found!!');
      }
      var q = {
        rfpId: rfp._id,
        state: 'Responded',
      };
      if (req.query.ids) {
        q._id = {
          $in: _.isArray(req.query.ids) ?
req.query.ids : [req.query.ids],
        };
      }
      api.rfpResponse.getAll({
        q: q,
        populate: 'rfpReceipent',
        select: 'rfpReceipent cover',
      }, req.session, function(err, allResponses) {
        if (err) {
          return next(err);
        }
        res.render('pages/rfp/rfp-analyze-reorder.jade', {
          title: 'CSquire | RFP Analyze Reorder',
          activePage: 'RFP',
          rfp: rfp,
          responses: allResponses,
          _id: req.params._id,
          compareIds: req.query.ids,
        });
      });
    });
  }
);
app.get(
  '/rfp-analyze-compare/:_id', utils.isFeatureAvailable('rfp'),
    middleware.requireUser,
    middleware.requirePremium,
    function(req, res, next) {
    if (!req.params._id) {
      res.status = 400;
      return next('Not Found!!');
    }
    api.rfps.get(req.params._id, null, req.session, function(err, rfp) {
      if (err) {
        return next(err);
      }
      if (!rfp) {
        res.status = 400;
        return next('Not Found!!');
      }
      res.render('pages/rfp/rfp-analyze-compare.jade', {
        title: 'CSquire | RFP Analyze Compare',
        activePage: 'RFP',
        rfp: rfp,
        _id: req.params._id,
        compareIds: req.query.ids || [],
      });
    });
  }
);
app.get(
  '/loginjwt',
     routes.api.jwtauth.authenticateUserAPI
); // ==define content:json in http post body to get json response

app.post(
  '/oauth/token',
     routes.api.jwtauth.getAccessToken
); // ==define content:json in http post body to get json response

app.get(
  '/user/info',
    routes.api.jwtauth.authenticateUserAPI
); // ==define content:json in http post body to get json response

app.all(
  '/logout',
    routes.api.auth.logOut,
    routes.api.endPoints.logOut
); // No arguments
app.post(
  '/api/sendPasswordResetEmail',
     routes.api.auth.sendPasswordResetEmail,
     routes.api.endPoints.sendPasswordResetEmail
);
app.get(
  '/api/usergroups/getallGroups',
     routes.api.auth.getallGroups,
     routes.api.endPoints.getallGroups
); // Api for getting all groups
// API to access form data
app.use('/api/revenues', require('./api/companyAnnualRevenue'));
app.use('/api/businessArea', require('./api/BusinessProcessArea'));
app.use('/api/softwareDev', require('./api/developmentSoftware'));
app.use('/api/enterpriseSoftware', require('./api/EnterpriseSoftware'));
app.use('/api/professionalLevels', require('./api/ProfessionalLevel'));
app.use('/api/vendorService', require('./api/VendorService'));
app.use('/api/jobTitle', require('./api/jobTitle'));
app.use('/api/Profile', require('./api/personalProfile'));
app.use('/api/:key/follow', require('./api/follow'));
app.use('/api/functionalrole', require('./api/functionalRole'));
app.use('/api/headCount', require('./api/companyHeadCount'));
app.use('/api/companyProfile', require('./api/CompanyProfile'));
app.use('/api/productProfile', require('./api/productProfile'));
app.use('/api/search', require('./api/Search'));
app.get('/vendorPage', middleware.setUser,
  function(req, res) {
  res.render('pages/marketing/vendorMarketing',
        { title: 'CSquire | Vendor Marketing' });
});
app.get('/professionalPage', middleware.setUser,
  function(req, res) {
  res.render('pages/marketing/professionalMarketing',
            { title: 'CSquire | Professional Marketing' });
});
app.get('/rfpDetails', middleware.setUser,
  function(req, res) {
  res.render('pages/rfpDetailsPage',
          { title: 'CSquire | rfp' });
});
app.get('/aboutcsquire', middleware.setUser,
  function(req, res) {
  res.render('pages/about',
        { title: 'CSquire | About' });
});

function dateFromISO8601(isostr) {
  var parts = isostr.match(/\d+/g);
  return new Date(parts[0], parts[1] - 1,
     parts[2], parts[3], parts[4], parts[5]);
}
function ifLadder(req, res, secondRound, minuteRound,
     hourRound, dayRound, monthRound, yearRound) {
  if (minuteRound < 1 && hourRound <
     1 && dayRound < 1 && monthRound < 1 && yearRound < 1) {
    res.locals.pwdresetDays = secondRound + ' Seconds Ago';
  } else if (minuteRound >= 1 && hourRound <
     1 && dayRound < 1 && monthRound < 1 && yearRound < 1) {
    res.locals.pwdresetDays = minuteRound + ' Minutes Ago';
  } else if (hourRound >= 1 && dayRound <
     1 && monthRound < 1 && yearRound < 1) {
    res.locals.pwdresetDays = hourRound + ' Hours Ago';
  } else if (dayRound >= 1 && monthRound <
     1 && yearRound < 1) {
    res.locals.pwdresetDays = dayRound + ' Days Ago';
  } else if (monthRound >= 1 && yearRound < 1) {
    res.locals.pwdresetDays = monthRound +
 ' Months Ago ' + dayRound + ' Days Ago';
  } else if (yearRound >= 1) {
    res.locals.pwdresetDays = yearRound +
 ' Years ' + monthRound + ' Months Ago';
  }
}
function timerCalculation(req, res, loggedUser) {
  var today = new Date().toISOString();
  var lastUpdatedPwd =
 new Date(loggedUser.pwdresetdate).toISOString();
  var d1 = dateFromISO8601(today);
  var d2 = dateFromISO8601(lastUpdatedPwd);
  var year = Math.floor((d1 - d2) / (12 * 30 * 24 * 60 * 60 * 1000));
  var month = Math.floor((d1 - d2) / (30 * 24 * 60 * 60 * 1000));
  var day = Math.floor((d1 - d2) / (24 * 60 * 60 * 1000));
  var hour = Math.floor((d1 - d2) / (60 * 60 * 1000));
  var minute = Math.floor((d1 - d2) / (60 * 1000));
  var second = Math.floor((d1 - d2) / (1000));
  ifLadder(req, res, second, minute,
   hour, day, month, year);
}

app.get('/accountSettings', middleware.requireUser,
  function(req, res, next) {
  api.personalProfile.get(req.session._id,
       ({
    populate: multiplePopulate,
  }), req.session, function(err, loggedUser) {
    if (err) {
      next(err);
    } else {
      if (loggedUser.pwdresetdate) {
        timerCalculation(req, res, loggedUser);
        res.render('pages/accountSettings',
         {
          title: 'CSquire | AccountSettings',
          data: loggedUser,
        });
      } else {
        res.render('pages/accountSettings',
         {
          title: 'CSquire | AccountSettings',
          data: loggedUser,
        });
      }
    }
  });

});


app.get('/Dashboard', middleware.requireUser,
    function(req, res, next) {
  api.personalProfile.get(req.session._id,
     {
    populate: multiplePopulate,
  }, req.session, function(err, loggedUser) {
    if (err) {
      return next(err);
    }
    var userData = utils.removeDuplicate(loggedUser.connections.profiles);
    var filterData = _.filter(userData, _.matches({
      isSender: false, connectionStatus: 'PENDING',
    }));
    res.locals.pendingInviationCount = filterData.length;
    loggedUser = utils.filterConnection(loggedUser);
    var connections =
 utils.removeDuplicate(loggedUser.connections.profiles).length +
      utils.removeDuplicate(loggedUser.connections.companies).length +
      utils.removeDuplicate(loggedUser.connections.products).length;
    var followingProfiles =
 loggedUser.followingProfiles.products.length +
            loggedUser.followingProfiles.companies.length +
            loggedUser.followingProfiles.profiles.length;
    var followers = loggedUser.followers.companies.length +
             loggedUser.followers.products.length +
             loggedUser.followers.profiles.length;
    var total = connections + followingProfiles + followers;
    res.locals.connectionsTab = [
      {
        heading: 'Total',
        number: total,
        addClass: 'disabled',
      },
      {
        heading: 'Connections',
        number: connections,
        href: '/search/connections/people?&connectionFrom=people',
      },
      {
        heading: 'Following',
        number: followingProfiles,
        href: '/search/followings/people',
      },
      {
        heading: 'Followers',
        number: followers,
        href: '/search/followers/people',
      },
    ];
    var companies, products, profiles;
    (function() {
      (function() {
        companies =
loggedUser.favourites && loggedUser.favourites.companies ?
              _.map(loggedUser.favourites.companies, function(element) {
          return _.extend({}, element, { type: 'company' });
        }) : [];
        products =
loggedUser.favourites && loggedUser.favourites.products ?
              _.map(loggedUser.favourites.products, function(element) {
          return _.extend({}, element, { type: 'product' });
        }) : [];
        profiles =
loggedUser.favourites && loggedUser.favourites.profiles ?
              _.map(loggedUser.favourites.profiles, function(element) {
          return _.extend({}, element, { type: 'people' });
        }) : [];
      })();
      var fp = companies.concat(products);
      fp = fp.concat(profiles);
      var num = fp.length >= 3 ? 2 : fp.length - 1;
      var resultFp = [];
      var margin = fp.length - 1;
      var split;
      for (i = 0; i <= num; i++) {
        split = Math.round(Math.random() * margin);
        resultFp.push(fp[split]);
        fp.splice(split, 1);
        margin--;
      }
      res.locals.favorities = resultFp;
      res.locals.dashBoardData = loggedUser;
      (function() {
        var claimedCompanies =
 loggedUser.claimed ?
 _.map(loggedUser.claimed.companies, function(element) {
          return _.extend({}, element, { type: 'company' });
        }) : [];
        var claimedProducts =
 loggedUser.claimed ?
 _.map(loggedUser.claimed.products, function(element) {
          return _.extend({}, element, { type: 'product' });
        }) : [];
        var claimedData = claimedCompanies.concat(claimedProducts);
        var num = claimedData.length >= 4 ? 3 : claimedData.length - 1;
        var resultFp1 = [];
        var margin = claimedData.length - 1;
        var split;
        for (i = 0; i <= num; i++) {
          split = Math.round(Math.random() * margin);
          resultFp1.push(claimedData[split]);
          claimedData.splice(split, 1);
          margin--;
        }
        res.locals.claimed = resultFp1;
        getRfpData(req, res, next);
      })();
    })();
  });
});
var getRfpData = function(req, res, next) {
  if (global.MasterCollection.disabledFeatures.
         indexOf('rfp') >= 0) {
    return getClaimData(req, res, next);
  }
  api.rfps.getAll({
    q: {
      state: 'completed',
      adminIds: req.session._id,
    },
    select: '_id',
    limit: '*',
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.locals.openRfps = data;
    api.rfpResponse.getAll({
      q: {
        state: 'Responded',
        $or: [
          { adminIds: { $in: [req.session._id], }, },
          { 'contributorIds.id': { $in: [req.session._id], }, },
        ],
      },
      select: '_id',
      limit: '*',
    }, req.session, function(err, respRfps) {
      if (err) {
        return next(err);
      }
      res.locals.respondedRfps = respRfps;
      getClaimData(req, res, next);
    });
  });
};
function getClaimData(req, res, next) {
  api.claimedProfile.getAll({ adminId: req.session._id },
                       req.session,
      function(error, resp) {
    if (error || !resp) {
      return next(error);
    }
    var pendingCompanyClaims = [];
    res.locals.productClaimed = [];
    res.locals.approvalRequired = [];
    res.locals.pendingProductClaims = [];
    var pendingproductClaims = [];
    res.locals.approvedProductClaims = [];
    res.locals.approvedCompanyClaims = [];
    res.locals.CompanyClaims = [];
    res.locals.pendingCompanyClaims = [];
    if (resp.productClaim || resp.companyClaim) {
      (function() {
        res.locals.approvalRequiredforProduct =
       _(resp.productClaim).filter(
          function(claim) {
            return claim.claimedBy;
          }).pluck('claimedBy.profiles').value();
        var prodArray = res.locals.approvalRequiredforProduct;
        res.locals.approvalRequiredforProduct = [];
        _.each(prodArray, function(val, key) {
          if (val.length) {
            _.each(val, function(v, k) {
              res.locals.approvalRequiredforProduct.push(v);
            });
          }
        });
        if (res.locals.approvalRequiredforProduct) {
          res.locals.approvalRequiredforProduct =
_.filter(res.locals.approvalRequiredforProduct,
  _.matches({ status: 'pending' }));
        }
        res.locals.approvalRequiredforCompany =
       _(resp.companyClaim).filter(
          function(claim) {
            return claim.claimedBy;
          }).pluck('claimedBy.profiles').value();
        var appArray = res.locals.approvalRequiredforCompany;
        res.locals.approvalRequiredforCompany = [];
        _.each(appArray, function(val, key) {
          if (val.length) {
            _.each(val, function(v, k) {
              res.locals.approvalRequiredforCompany.push(v);
            });
          }
        });
        if (res.locals.approvalRequiredforCompany) {
          res.locals.approvalRequiredforCompany =
    _.filter(res.locals.approvalRequiredforCompany,
            _.matches({ status: 'pending' }));
        }
        _.each(resp.youClaimedCompany, function(val, key) {
          _.each(val.claimedBy.profiles,
                             function(val1, key1) {
            pendingCompanyClaims.push(val1);
          });
        });
        _.each(resp.youClaimedProduct, function(val, key) {
          _.each(val.claimedBy.profiles,
                             function(val1, key1) {
            pendingproductClaims.push(val1);
          });
        });
        (function() {
          if (pendingCompanyClaims) {
            _.each(pendingCompanyClaims, function(val, key) {
              if (val.profileId._id === req.session._id &&
        val.status === 'pending') {
                res.locals.pendingCompanyClaims
.push(pendingCompanyClaims[key]);
              }
            });
            _.each(pendingCompanyClaims, function(val, key) {
              if (val.profileId._id === req.session._id &&
        val.status === 'approved') {
                res.locals.approvedCompanyClaims.
     push(pendingCompanyClaims[key]);
              }
            });
          } else {
            res.locals.pendingCompanyClaims = [];
            res.locals.approvedCompanyClaims = [];
          }
          if (pendingproductClaims) {
            _.each(pendingproductClaims, function(val, key) {
              if (val.profileId._id === req.session._id &&
        val.status === 'pending') {
                res.locals.pendingProductClaims
.push(pendingproductClaims[key]);
              }
            });
            _.each(pendingproductClaims, function(val, key) {
              if (val.profileId._id === req.session._id &&
        val.status === 'approved') {
                res.locals.approvedProductClaims
     .push(pendingproductClaims[key]);
              }
            });
          } else {
            res.locals.pendingProductClaims = [];
            res.locals.approvedProductClaims = [];
          }
          res.locals.approvedProductClaimsCount =
  resp.yourProductApprovedClaimCount;
          res.locals.approvedCompanyClaimscount =
  resp.yourCompanyApprovedClaimCount;
        })();
      })();
      setLocalsVar(res, resp);
    }
    async.parallel([function(cb) {
        qsUtils.quickSupportDashboardCount(req, function(err, results) {
          if (err) {
            return cb(err, null);
          }
          res.locals.qsQueueCount = results;
          cb();
        });
      }, function(cb) {
        var wordpressSiteUrl = res.locals.blogHref;
        var posts = 3;
        wordpressPosts.get(wordpressSiteUrl, posts, function(err, blogsArray) {
          if (err) {
            return cb(err, null);
          }
          res.locals.blogies = blogsArray;
          _.each(res.locals.blogies, function(blog) {
            if (blog.mediacontent && blog.mediacontent.length > 0) {
              blog.img = blog.mediacontent[0].$.url;
              if (blog.mediacontent.length > 1) {
                blog.img = blog.mediacontent[1].$.url;
              }
            }
          });
          cb();
        });
      },
    ],
     function(err) {
      if (err) {
        return next(err);
      }
      kb.getQuestionsList({ maxresults: 3, orderby: 'recentlyactive'},
       function(err, ques) {
        if (err) {
          return next(err);
        }
        ques = JSON.parse(ques);
        if (ques && ques.searchResult && ques.searchResult.questions &&
         ques.searchResult.questions.question) {
        }
        res.render('pages/dashboard',
              {
          title: 'CSquire | Dashboard',
          activePage: 'dashboard',
        });
      });

    });
  });
}

var setLocalsVar = function(res, resp) {
  res.locals.companyClaimInfo = resp.getRejectApprovedHistoryCompany;
  res.locals.productClaimInfo = resp.getRejectApprovedHistoryProduct;
  res.locals.companyClaimInfobyAdmin =
resp.getRejectApprovedHistoryCompanyForAdmin;
  res.locals.productClaimInfobyAdmin =
resp.getRejectApprovedHistoryProductForAdmin;
  res.locals.totalCountByAdmin =
_.sum(res.locals.companyClaimInfobyAdmin, 'count') +
_.sum(res.locals.productClaimInfobyAdmin, 'count');
  res.locals.claimCount =
                  ((res.locals.approvalRequiredforCompany ?
                    res.locals.approvalRequiredforCompany.length : 0) +
                    (res.locals.approvalRequiredforProduct ?
                      res.locals.approvalRequiredforProduct.length : 0));
  res.locals.claimed = res.locals.approvalRequiredforProduct ||
                        res.locals.approvalRequiredforCompany ||
                         res.locals.pendingCompanyClaims ||
                         res.locals.pendingProductClaims ||
                         res.locals.approvedProductClaims ||
                         res.locals.approvedCompanyClaims;
};

function redirectSuperuser(req, res) {
  if (req.session.isSuperUser && req.params.uid &&
            req.params.uid === req.session.manageProfile) {
    res.redirect('/profile?uid=' + req.params.uid);
    return true;
  }
  if (!req.session.isSuperUser && req.session.uid === req.params.uid) {
    res.redirect('/profile');
    return true;
  }
}
// = For punblic profile new
app.get('/people/:uid', middleware.setUser,
    middleware.swithSignInUp, function(req, res, next) {
  var updateUid = req.session.uid || '';
  if (req.params.uid === 'guest') {
    next('Not found');
  }
  if (redirectSuperuser(req, res)) {
    return;
  }
  res.locals.key = 'people';
  // Set user viewd
  var customData = {};
  if (req.session.customdata && req.session.customdata.personalProfile) {
    customData = _.defaults({},
                             req.session.customdata.personalProfile);
  }
  req.params._id = req.session._id;
  if (req.session.manageProfile && req.session.isSuperUser) {
    updateUid = req.session.manageProfile;
    req.params._id = req.session.manageProfileId;
  }
  api.personalProfile.getFirst({
    q: { uid: updateUid },
    populate: optsApi,
  }, req.session, function(err, loggedUser) {
    if (err) {
      next(err);
    }
    api.personalProfile.getFirst({
      q: { uid: req.params.uid },
      populate: optsApi,
    }, req.session, function(err, profile) {
      if (err) {
        next(err);
      }
      if (profile) {
        if (loggedUser) {
          res.locals.user = true;
          profile.connections.companies =
          _.filter(profile.connections.companies, function(obj) {
            if (!obj.refId || profile.company[0]._id === obj.refId._id) {
              return false;
            }
            return true;
          });
          res.locals.isFav =
loggedUser.favourites.profiles
.indexOf(profile._id) !== -1;
          var isFollower = _.find(profile.followers.profiles,
                function(obj) {
            return obj._id === loggedUser._id;
          });
          res.locals.isFollower = isFollower;
          var isCon = _.find(profile.connections.profiles, function(obj) {
            if (obj.refId && obj.refId._id) {
              return obj.refId._id === loggedUser._id;
            }
          });
          res.locals.isCon = isCon;
        } else {
          res.locals.user = false;
        }
        (function() {
          profile.connections.companies = utils.getSlicedData(
            utils.removeDuplicate(profile.connections.companies));
          profile.connections.products = utils.getSlicedData(
            utils.removeDuplicate(profile.connections.products));
          profile.connections.products = _.map(profile.connections.products,
         function(element) {
            return _.extend({}, element, { isPopulate: true });
          });
          profile.connections.companies = _.map(profile.connections.companies,
         function(element) {
            return _.extend({}, element, { isPopulate: true });
          });
        })();
        utils.populateConnection(profile, req, function(err, result) {
          if (err) {
            return next(err);
          }
          profile = utils.filterConnection(profile);
          getProfileChildNew(result, customData, req, res, next);
        });
      } else { next('Not found'); }
    });
  });
});

function getProfileChildNew(profile, customData, req, res, next) {
  var temp = profile.connections ? profile.connections.profiles : [];
  temp = temp || [];
  var resultData = util.deepPick(profile, customData);
  res.locals.companies = utils.getSlicedData(
    utils.removeDuplicate(profile.connections.companies));
  res.locals.products = utils.getSlicedData(
    utils.removeDuplicate(profile.connections.products));
  res.locals.profiles = utils.getSlicedData(
    utils.removeDuplicate(profile.connections.profiles));
  (function() {
    resultData.connections = resultData.connections || {
      profiles: [],
      products: [],
      companies: [],
    };
    resultData.connections.products = _.filter(resultData.connections.products,
         function(obj) {
      return obj.connectionStatus === 'APPROVED';
    });

  })();
  var loggid = req.session._id ? req.session._id : global.guestUserId;
  async.waterfall(
    [
      function(cb1) {
        utils.pastClietMgmt(req, profile, function(pastClnt) {
          pastClnt = utils.removeDuplicate(pastClnt);
          res.locals.pastClientString = utils.getRelation(pastClnt);
          res.locals.pastClient = utils.getSlicedData(pastClnt);
          cb1();
        });
      }, function(cb1) {
        utils.getTechnologyPartner(req, profile,
                   function(technologyPartner) {
          technologyPartner =
                                     utils.removeDuplicate(technologyPartner);
          res.locals.technologyPartnerString =
                   utils.getRelation(technologyPartner);
          res.locals.technologyPartner =
                      utils.getSlicedData(technologyPartner);
          cb1();
        });
      },
      function(cb1) {
        utils.getServicePartner(req, profile,
                   function(servicePartner) {
          servicePartner = utils.removeDuplicate(servicePartner);
          res.locals.servicePartnerString =
                               utils.getRelation(servicePartner);
          res.locals.servicePartner =
                   utils.getSlicedData(servicePartner);
          cb1();
        });
      },
      function(cb1) {
        utils.getColleague(req, profile, function(collegue) {
          collegue = utils.removeDuplicate(collegue);
          res.locals.colleguesString = utils.getPersonRelation(collegue);
          res.locals.collegues = utils.getSlicedData(collegue);
          cb1();
        });
      }, function(cb1) {
        utils.productsUsed(req, profile,
                   function(products) {
          products = utils.removeDuplicate(products);
          res.locals.productsUsedString =
                               utils.getProductRelation(products);
          res.locals.productsUsed = utils.getSlicedData(products);
          cb1();
        });
      },
      function(cb2) {
        utils.specializationMgmt(req, profile, function(prdct) {
          prdct = utils.removeDuplicate(prdct);
          res.locals.specializationString =
utils.getProductRelation(prdct);
          expertise = utils.getSlicedData(prdct);
          cb2();
        });
      },
    ], function() {
      res.locals.loggedUser = req.params._id;
      res.locals.returnUrl = req.originalUrl;
      profileController.userProfileView(req.params.uid,
   loggid, function(err, profile) {
        if (err) {
          return next(err);
        }
        async.parallel([
          function(cb) {
            if (!req.session._id) {
              return cb();
            }
            getCommonConn(req, res, req.session._id, resultData, cb);
          },
          function(cb) {
            getSimilarProf(req, res, req.session._id, resultData, cb);
          },
        ], function(err) {
          if (err) {
            return next(err);
          }
          res.render('pages/profile-new', {
            myUid: req.session.isSuperUser?req.session.manageProfile:
           req.session.uid,
            profileData: resultData,
            title: 'CSquire | Profile',
            publicProfile: 'public',
          });
        });
      });
    });
}
function getCommonConn(req, res, loggid, resultData, callback) {
  if (!loggid) {
    return callback();
  }
  api.personalProfile.getFirst({
    q: { _id: loggid },
  }, req.session, function(err, loggedUser) {
    if (err) {
      return callback(err);
    }
    if (loggedUser) {
      async.parallel([
        function(cb) {
          getCommonProfiles(req, res, loggid, loggedUser,
                  resultData, cb);
        },
        function(cb) {
          getCommonCompany(req, res, loggid, loggedUser,
                  resultData, cb);
        },
        function(cb) {
          getCommonProduct(req, res, loggid, loggedUser,
                  resultData, cb);
        },
      ], function(err) {
        if (err) {
          return callback(err);
        }
        var common = res.locals.commonProfiles
          .concat(res.locals.commonCompanies);
        common = common.concat(res.locals.commonProducts);
        res.locals.connProfiles = randomProfessionals(common);
        callback();
      });
    } else {
      res.locals.connProfiles = [];
    }
  });
}
function getCommonProfiles(req, res, loggid, loggedUser, resultData, callback) {
  res.locals.commonProfiles = [];
  var loggedProfilesconn =
 loggedUser.connections?loggedUser.connections.profiles:null;
  loggedProfilesconn = _.pluck(_.where(loggedProfilesconn,
   { connectionStatus: 'APPROVED' }), 'refId');
  var viewedProfileconn =
 resultData.connections?resultData.connections.profiles:null;
  var temp = [];
  viewedProfileconn.forEach(function(obj) {
    if (obj.refId && obj.refId._id) {
      temp.push(obj.refId._id);
    }
  });
  viewedProfileconn = temp;
  var comProf = _.intersection(viewedProfileconn, loggedProfilesconn);
  if (!comProf.length) {
    return callback();
  }
  var qry = {
    q: {
      _id: { $in: comProf },
      'connections.profiles.connectionStatus': 'APPROVED',
    },
    select: 'uid name lastName pictureUrl',
  };
  api.personalProfile.getAll(qry, req.session, function(err, connProfiles) {
    if (err) {
      return callback(err);
    }
    res.locals.commonProfiles = connProfiles || [];
    callback();
  });
}
function getCommonCompany(req, res, loggid, loggedUser, resultData, callback) {
  res.locals.commonCompanies = [];
  var loggedProfilesconn =
 loggedUser.connections?loggedUser.connections.companies:null;
  loggedProfilesconn = _.pluck(loggedProfilesconn, 'refId');
  var viewedProfileconn =
 resultData.connections?resultData.connections.companies:null;
  var temp = [];
  viewedProfileconn.forEach(function(obj) {
    if (obj.refId && obj.refId._id) {
      temp.push(obj.refId._id);
    }
  });
  viewedProfileconn = temp;
  var comProf = _.intersection(viewedProfileconn, loggedProfilesconn);
  if (!comProf.length) {
    return callback();
  }
  var qry = {
    q: {
      _id: { $in: comProf },
    },
    select: 'uid name __t logo',
  };
  api.companyProfile.getAll(qry, req.session, function(err, connCompany) {
    if (err) {
      return callback(err);
    }
    res.locals.commonCompanies = connCompany || [];
    callback();
  });
}
function getCommonProduct(req, res, loggid, loggedUser, resultData, callback) {
  res.locals.commonProducts = [];
  var loggedProfilesconn =
 loggedUser.connections?loggedUser.connections.products:null;
  loggedProfilesconn = _.pluck(loggedProfilesconn, 'refId');
  var viewedProfileconn =
 resultData.connections?resultData.connections.products:null;
  var temp = [];
  viewedProfileconn.forEach(function(obj) {
    if (obj.refId && obj.refId._id) {
      temp.push(obj.refId._id);
    }
  });
  viewedProfileconn = temp;
  var comProf = _.intersection(viewedProfileconn, loggedProfilesconn);
  if (!comProf.length) {
    return callback();
  }
  var qry = {
    q: {
      _id: { $in: comProf },
    },
    select: 'uid name __t logo',
  };
  api.productProfile.getAll(qry, req.session, function(err, connProduct) {
    if (err) {
      return callback(err);
    }
    res.locals.commonProducts = connProduct || [];
    callback();
  });
}
function getSimilarProf(req, res, loggid, resultData, callback) {
  var qry = {};
  var pLevel =
 resultData.professionalLevel?resultData.professionalLevel._id:null;
  var jTitle = resultData.jobTitle?resultData.jobTitle._id:null;
  var funcArea = resultData.functionalAreas?resultData.functionalAreas:null;
  var nin = [resultData._id];
  if (loggid !== null) {
    nin.push(loggid);
  }
  qry.q = {
    $or: [{ professionalLevel: pLevel },
{ functionalAreas: { $in: funcArea } },
{ jobTitle: jTitle }, ],
    _id: { $nin: nin },
  };
  res.locals.seeallProff = querystring.stringify({
    jTitle: jTitle,
    farea: funcArea,
    Proflevels: pLevel,
  }, null, null);
  qry.select = 'uid name lastName pictureUrl';
  api.personalProfile.getAll(qry, req.session, function(err, resltProfiles) {
    if (err) {
      return callback(err);
    }
    res.locals.resltProfiles = randomProfessionals(resltProfiles);
    callback();
  });
}
function randomProfessionals(resltProfiles) {
  var shuffled = resltProfiles.slice(0);
  var i = resltProfiles.length;
  var temp;
  var index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, 3);
}

app.get('/connection-check/',
 middleware.requireUser, function(req, res, next) {
  if (!req.query.type) {
    return next(new Error('Data missing!!'));
  }
  next();
}, function(req, res, next) {
  var query = { q: {} };
  var qs = {
    _id: req.session._id,
  };
  if (req.query.type === 'product') {
    query.q = _.merge({}, qs,
{ 'connections.products.refId': req.query.prodId });
  } else if (req.query.type === 'company') {
    query.q = _.merge({}, qs,
{ 'connections.companies.refId': req.query.compId });
  } else if (req.query.type === 'people') {
    query.q = _.merge({}, qs,
{ 'connections.profiles.refId': req.query.peopleId });
  }
  var modal = {};
  if (req.query.connectFrom === 'company') {
    modal = api.companyProfile;
    query.q._id = req.query.connectFromId;
  } else if (req.query.connectFrom === 'product') {
    modal = api.productProfile;
    query.q._id = req.query.connectFromId;
  } else {
    modal = api.personalProfile;
  }
  modal.getAll(query, function(err, data) {
    if (err) {
      return next(err);
    }
    if (data.length) {
      if (req.query.type === 'people') {
        var firstFound = _.find(data[0].connections.profiles, function(info) {
          return req.query.peopleId === info.refId &&
         info.connectionStatus === 'PENDING';
        });
        if (firstFound) {
          return res.send({
            mydata: false,
            conStatus: true,
          });
        }
      }
      return res.send({
        mydata: true,
        conStatus: false,
      });
    }
    if (req.query.isNew && req.query.isNew === 'true' && req.query.prodId) {
      isAdmin(req, function(data) {
        res.send({
          mydata: false,
          isAdmin: req.session.isSuperUser?true:data.isAdmin,
          uid: data.prodUid && data.prodUid.length?data.prodUid[0].uid:'',
          name: data.prodUid && data.prodUid.length?data.prodUid[0].name:'',
          status: req.session.isSuperUser?'approved':data.status,
        });
      });
    } else {
      res.send({
        mydata: false,
      });
    }
  });
});

var isAdmin = function(req, cb) {
  var userId = req.session._id;
  api.productProfile.getAll({
    q: {
      'claimedBy.profiles.profileId': { $in: [userId] },
      _id: req.query.prodId,
    },
  }, function(er, count) {
    if (count && count.length) {
      if (er) {
        return next(er);
      }
      var status;
      if (count.length) {
        var data = count[0];
        _.find(data.claimedBy.profiles, function(item) {
          if (item.profileId.toString() === userId) {
            status = item.status;
          }
        });
      }
      getProductInfo(req.query.prodId, function(name) {
        if (count.length && (status === 'approved') || status === 'pending') {
          cb({ isAdmin: true, prodUid: name, status: status });
        } else {
          cb({ isAdmin: false, prodUid: name });
        }
      });
    } else {
      api.productProfile.getAll({
        q: {
          admin: { $in: [userId] },
          _id: req.query.prodId,
        },
      }, function(err, counts) {
        if (err) {
          return next(err);
        }
        getProductInfo(req.query.prodId, function(name) {
          if (counts.length) {
            cb({ isAdmin: true, prodUid: name });
          } else {
            cb({ isAdmin: false, prodUid: name });
          }
        });
      });
    }
  });
};
var getProductInfo = function(prodId, callback) {
  api.productProfile.getAll({ q: { _id: prodId } },
    function(error, name) {
    if (error) {
      return next(error);
    }
    callback(name);
  });
};

var setConnectionVariable = function(option, body, reqsession, cb) {
  if (option.isAdd === 'false') {
    return cb(option);
  }
  var arrayOptions = [];
  api.relationTypes.getAll({ q: { _id: { $in: body.connect } } },
    function(err, result) {
    if (err) {
      return next(err);
    }
    _.each(result, function(val, key) {
      arrayOptions.push(setOption(option, reqsession, val));
    });
    return cb(arrayOptions);
  });
};

var setOption = function(option, reqsession, data) {
  var options = _.clone(option);
  if (options.connectionFromType === 'people' &&
                options.connectionToType === 'people') {
    options.connectionStatus = 'PENDING';
  }
  if (reqsession.manageProfile && reqsession.isSuperUser &&
                        options.connectionFromType === 'people') {
    options.connectFromId = reqsession.manageProfileId;
  }
  options.connectAs = data.connectAs;
  options.connectedAs = data.connectedAs;
  options.connectionFromType = data.connectionFrom;
  options.connectionToType = data.connectionTo;
  options.relationId = data._id;
  return options;
};

app.post('/profile-con/:connectionFromType/:connectionToType/' +
  ':connectAs/:connectedAs/:uid/:_id/:isSet',
    middleware.requireUser,
    function(req, res, next) {
  var updateUid;
  if (!isEmpty(req.query.conFromId)) {
    updateUid = req.query.conFromId;
  } else {
    updateUid = req.session._id;
  }
  var referer = req.header('Referer') || '';
  var domain = url.format({
    protocol: url.parse(referer).protocol,
    host: url.parse(referer).host,
  });
  var options = {
    connectFromId: updateUid,
    connectFromName: isEmpty(req.query.conFromName)?
                  'people':req.query.conFromName,
    connectToId: req.params._id,
    connectionFromType: req.params.connectionFromType,
    connectionToType: req.params.connectionToType,
    connectAs: req.params.connectAs,
    connectedAs: req.params.connectedAs,
    manageProfileUid: req.session.manageProfileId,
    isAdd: req.params.isSet,
    isSuperUser: req.session.isSuperUser,
    connectionMessage: req.body.connectionMessage,
    connectionStatus: 'APPROVED',
    inboxUrl: domain + '/login?returnUrl=/inbox/connectionRequest#connProfile',
  };
  setConnectionVariable(options, req.body, req.session, function(opt) {
    var connectionoptions = _.isArray(opt)?opt:[opt];
    var connectionData = { data: connectionoptions };
    api.connections.create(connectionData, req.session,
          function(err, data) {
      if (err) {
        // Return res.status(400).send(err.message);
        next(err);
      }
      if (call1(req, res) !== true) {
        return;
      }
      if (options.connectionFromType === 'product') {
        return res.redirect('/product/' + data.objConnectionFrom.name);
      }
      if (options.connectionFromType ===
     'company' && data.objConnectionFrom && data.objConnectionFrom.uid) {
        return res.redirect('/company/' + data.objConnectionFrom.uid);
      }
      if (req.params.isSet === 'false') {
        if (req.query.redirct) {
          return res.redirect('/profile?tab=' + req.query.tab);
        } else {
          return res.redirect('/' + req.params.connectionToType +
                                                '/' + req.params.uid);
        }
      }
      if (req.session.manageProfile && req.session.isSuperUser) {
        return res.redirect('/profile?uid=' + req.session.manageProfile);
      } else {
        return res.redirect('/profile');
      }
    });
  });

});
function call1(req, res) {
  if (req.params.isSet === 'true' &&
              req.params.connectionFromType === 'product') {
    return res.redirect('/product/' + req.query.conFromName);
  }
  if (_.isArray(req.body.returnUrl)) {
    req.body.returnUrl = req.body.returnUrl[0];
  }
  if (req.body.returnUrl && req.body.returnUrl !== 'undefined') {
    return res.redirect(req.body.returnUrl);
  }
  return true;
}

app.get('/inviteContacts', middleware.requireUser,
    function(req, res) {
  console.log(req.session.uid);
  console.log(req.session._id);
  if (req.session.uid) {
    api.personalProfile.get(req.session._id,
                        ({ populate: multiplePopulate }),
             req.session, function(err, loggedUser) {
      if (err) {
        return next(err);
      } else {
        console.log(req.session.uid);
        console.log(req.session._id);
        res.render('pages/inviteContacts', {
          title: 'CSquire | Invite Contacts',
        });
      }
    });
  }



});

app.get('/error/403', middleware.setUser,
    function(req, res, next) {
  res.locals.error = {
    header: 'Access to the requested page has been denied.',
  };
  res.render('error', {
    title: 'CSquire | Invite Contacts',
  });
});

app.get('/claimErr/:errmsg/:type', middleware.setUser,
    function(req, res, next) {
  res.render('pages/claimErr', {
    error: {
      // Header: err.body,
      header: 'Your registered email address domain do not match ' +
  'with the registered domain of ' + req.params.type + '.',
      text: 'Please contact ',
    },
  });
});

app.post('/inviteDetails', middleware.requireUser, function(req, res, next) {
  var userDetails = [];
  var singleObj;
  if (_.isArray(req.body.firstName)) {
    for (var i = 0; i < req.body.firstName.length; i++) {
      singleObj = {
        firstName: req.body.firstName[i],
        lastName: req.body.lastName[i],
        emailAddress: req.body.emailAddress[i],
      };
      userDetails.push(singleObj);
    }
  } else {
    singleObj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
    };
    userDetails.push(singleObj);
  }
  var invitationData = {
    sendDetail: userDetails,
    inviteMessage: req.body.inviteMessage,
    loggedId: req.session._id,
  };
  api.sendInvitations.create(invitationData, req.session, function(err, data) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      res.render('pages/invitationSuccess', {
        title: 'CSquire | Success Invitation',
      });
    }
  });

});

// Render connection request inbox

app.get('/inbox', middleware.requireUser,
    function(req, res, next) {
  if (req.session.uid) {
    api.personalProfile.get(req.session._id,
                         ({ populate: multiplePopulate }),
             req.session, function(err, loggedUser) {
      if (err) {
        return next(err);
      } else {
        res.render('pages/inbox');
      }
    });
  } else {
    next(err);
  }
});


app.get('/inbox/connectionrequest', middleware.requireUser,
    function(req, res, next) {
  if (req.session.uid) {
    api.personalProfile.get(req.session._id,
                                       ({ populate: multiplePopulate }),
             req.session, function(err, loggedUser) {
      if (err) {
        next(err);
      } else {
        async.parallel({
          getConnectionInvitation: function(cb) {
            utils.populateConnection(loggedUser, req,
                       function(err, result) {
              if (err) {
                return next(err);
              } else {
                var userData =
 utils.removeDuplicateForPeople(result.connections.profiles, req.session._id);
                var finalData = utils.sortBy(userData,
                            { prop: 'connectionDate' });
                var filterData = _.filter(finalData, _.matches({
                  isSender: false, connectionStatus: 'PENDING',
                }));
                console.log(finalData);
                res.locals.pendingInviationCount = filterData.length;
                cb(null, filterData);
              }
            });
          },
          getClaimInfo: function(cb) {
            api.claimedProfile.getAll({ adminId: req.session._id },
       req.session, function(err, resp) {
              res.locals.approvalRequiredforCompany =
_(resp.companyClaim).filter(
                function(claim) {
                  return claim.claimedBy;
                }).pluck('claimedBy.profiles').value();
              var appArray = res.locals.approvalRequiredforCompany;
              res.locals.approvalRequiredforCompany = [];
              _.each(appArray, function(val, key) {
                if (val.length) {
                  _.each(val, function(v, k) {
                    res.locals.approvalRequiredforCompany.push(v);
                  });
                }
              });
              if (res.locals.approvalRequiredforCompany) {
                res.locals.approvalRequiredforCompany =
_.filter(res.locals.approvalRequiredforCompany,
_.matches({ status: 'pending' }));
              }
              res.locals.approvalRequiredforProduct =
_(resp.productClaim).filter(
                function(claim) {
                  return claim.claimedBy;
                }).pluck('claimedBy.profiles').value();
              var prodArray =
 res.locals.approvalRequiredforProduct;
              res.locals.approvalRequiredforProduct = [];
              _.each(prodArray, function(val, key) {
                if (val.length) {
                  _.each(val, function(v, k) {
                    res.locals.approvalRequiredforProduct.push(v);
                  });
                }
              });
              if (res.locals.approvalRequiredforProduct) {
                res.locals.approvalRequiredforProduct =
_.filter(res.locals.approvalRequiredforProduct,
_.matches({ status: 'pending' }));
              }
              setLocalsVar(res, resp);
              cb(null, resp);
            });
          },
        }, function(err, data) {
          res.render('pages/connectioninvitation', {
            moment: moment,
            datas: data.getConnectionInvitation,
            claimInfo: data.getClaimInfo,
          });
        });
      }
    });
  } else {
    next(err);
  }
});

app.post('/invitation/approval/people', middleware.requireUser,
  function(req, res, next) {
  console.log(req.body);
  var connectionProcess;
  if (req.body.connectionStatus === 'APPROVED') {
    connectionProcess = 'true';
  } else {
    connectionProcess = 'false';
  }
  var options = {
    connectFromId: req.body.connectFromId,
    connectToId: req.session._id,
    connectionFromType: 'people',
    connectionToType: 'people',
    connectionStatus: req.body.connectionStatus,
    isAdd: connectionProcess,
  };
  console.log(options);
  var connectionData = { data: [options] };
  api.connections.create(connectionData, req.session, function(err, data) {
    if (err) {
      console.log(err);
      // Return res.status(400).send(err.message);
      return next(err);
    }
    console.log(data);
    if (data.msg === 'Connection Already Exist') {
      return res.render('../views/pages/actionExist.jade');
    }
    return res.redirect('/inbox/connectionrequest');

  });
});
function setRfpReponseCount(req, rfps, callback) {
  var ids = [];
  _.each(rfps, function(rfp) {
    if (rfp.state === 'completed') {
      ids.push(rfp._id);
    }
  });
  api.rfpResponse.getAll({
    q: {
      rfpId: {
        $in: ids,
      },
      state: 'Responded',
    },
  },
req.session,
   function(err, responses) {
    if (err) {
      return callback(err);
    }
    _.each(rfps, function(rfp) {
      rfp.responseCount = _.filter(responses, function(res) {
        return res.rfpId === rfp._id;
      }).length;
    });
    callback();
  });
}
// Render dashboard
app.get('/rfp-dashboard', utils.isFeatureAvailable('rfp'),
 middleware.requireUser,
 middleware.requirePremium,
 function(req, res, next) {
  api.rfps.getAll({
    q: { adminIds: req.session._id, },
    populate: 'userLog.createdBy.userId',
    limit: '*',
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    api.rfpResponse.getAll({
      // - q: { adminIds: { $in: [req.session._id] }, },
      q: {
        $or: [
          { adminIds: { $in: [req.session._id], }, },
          { 'contributorIds.id': { $in: [req.session._id], }, },
        ],
      },
      populate: 'rfpId',
      limit: '*',
      select: 'rfpId state',
    }, req.session, function(err, data2) {
      if (err) {
        return next(err);
      }
      async.parallel([function(cb) {
          var userIds = _.pluck(data2, 'rfpId.userLog.createdBy.userId');
          if (!userIds.length) {
            return cb();
          }
          api.personalProfile.getAll(
            {
              q: {
                _id: { $in: _.uniq(userIds) },
              },
              select: 'name lastName',
            },
      req.session, function(err, rfpOwners) {
              if (err) {
                return cb(err);
              }
              _.each(data2, function(info) {
                info.rfpId.userLog.createdBy.userId =
_.findWhere(rfpOwners,
{ _id: info.rfpId.userLog.createdBy.userId });
              });
              cb();
            });
        },
       function(cb) {
          setRfpReponseCount(req, data, cb);
        },
      ], function(err) {
        if (err) {
          return next(err);
        }
        res.render('pages/rfp', {
          title: 'CSquire | RFP Dashboard',
          activePage: 'RFP',
          data: data,
          responseRfps: data2,
        });
      });
    });
  });
});


// Company setting page

var companyPopulate = [
  {
    path: 'employees',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
    select: '_id name lastName uid pictureUrl email' +
     'displayLastName displayName',
    model: 'personalProfile',
  },
  {
    path: 'admin',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
    select: '_id name lastName uid pictureUrl email' +
     'displayLastName displayName',
    model: 'personalProfile',
  },
  {
    path: 'quickSupportResponderList',
    match: { accountStatus: util.EnumAccountStatus.ENABLED },
    select: '_id name lastName uid pictureUrl email' +
     'displayLastName displayName',
    model: 'personalProfile',
  },
];

app.get('/company/CompanySettings/:id', middleware.requireUser,
  function(req, res, next) {
  api.companyProfile.getFirst({
    q: {
      _id: req.params.id,
    },
    populate: companyPopulate,
  }, req.session,
    function(err, companyProfile) {
    if (err) {
      return next(err);
    }
    res.locals.userIsOwner =
       _.filter(companyProfile.claimedBy.profiles, _.matches({
      profileId: req.session._id,
      status: 'approved',
    })).length > 0;
    var userIsAdmin =
 _.filter(companyProfile.admin, _.matches({
      _id: req.session._id,
    })).length > 0;
    if ((res.locals.userIsOwner) || userIsAdmin || req.session.isSuperUser) {
      res.locals.isCompanySettingAccess = true;
    } else {
      return next('You are not a owner or admin of this company');
    }
    if (companyProfile.quickSupportResponderList.length > 0) {
      var responderIds = [];
      for (var resCount = 0;
          resCount < companyProfile.quickSupportResponderList.length;
          resCount++) {
        var empId = companyProfile.quickSupportResponderList[resCount]._id;
        responderIds.push(empId);
      }
      companyProfile.responderIds = responderIds;
    }
    res.render('pages/companySettings', {
      title: 'CSquire | Company Settings',
      data: companyProfile,
    });
  });
});
app.get('/product/productSetting/:id', middleware.requireUser,
  function(req, res, next) {
  api.productProfile.getFirst({
    q: {
      _id: req.params.id,
    },
    populate: companyPopulate,
  }, req.session,
    function(err, productProfile) {
    if (err) {
      return next(err);
    }
    res.locals.userIsOwner =
       _.filter(productProfile.claimedBy.profiles, _.matches({
      profileId: req.session._id,
      status: 'approved',
    })).length > 0;
    var userIsAdmin =
 _.filter(productProfile.admin, _.matches({
      _id: req.session._id,
    })).length > 0;
    if ((res.locals.userIsOwner) || userIsAdmin) {
      res.locals.isAccountSettingAccess = true;
    } else {
      return next('You are not a owner or admin of this company');
    }
    if (productProfile.company && productProfile.company.length > 0) {
      res.locals.isCompanyAssociate = true;
        /*If (productProfile.quickSupportResponderList &&
          productProfile.quickSupportResponderList.length > 0) {
          var responderIds = [];
          for (var resCount = 0;
            resCount < productProfile.quickSupportResponderList.length;
            resCount++) {
            var empId = productProfile.quickSupportResponderList[resCount]._id;
            responderIds.push(empId);
          }
          productProfile.responderIds = responderIds;
        }*/
        /*Api.companyProfile.getFirst({
          q: {
            _id: productProfile.company[0],
          },
          populate: companyPopulate,
          select: 'employees',
        }, req.session,
          function(err, companyProfile) {
            if (err) {
              return next(err);
            }
            if (companyProfile.employees &&
              companyProfile.employees.length > 0) {
              productProfile.employees = companyProfile.employees;
            }
            res.render('pages/productSetting', {
              title: 'CSquire | Product Settings',
              product: productProfile,
            });
          });*/
    } else {
      res.locals.isCompanyAssociate = false;
    }
    res.render('pages/productSetting', {
      title: 'CSquire | Product Settings',
      product: productProfile,
    });
  });
});


module.exports = app;
