var express = require('express');
var app = express.Router();
var multer = require('multer');
var util = require('./util');
var requireDir = require('require-dir');
var _ = require('lodash');
middleware = require('./middleware');
var allRouter = '../routes/api';
var api = require('../routes/csquire-api/');
var productController = require(allRouter +
    '/productProfile/' +
    'controller');
var profileController = require(allRouter +
    '/personalProfile/' +
    'controller');
var companyModel = require('../models/companyProfile');
var companyController = require(allRouter +
    '/CompanyProfile/controller');
var intendedController =
 require(allRouter + '/intendedScaleFor/controller');
var revenues =
 require(allRouter + '/companyAnnualRevenue/controller');
var headcounts =
 require(allRouter + '/companyHeadCount/controller');
var developmentSoftware =
 require(allRouter + '/developmentSoftware/controller');
var annualRevenueController = require(allRouter + '/companyAnnualRevenue/' +
  'controller');
var headCountController = require(allRouter + '/companyHeadCount/' +
  'controller');
// Note line below is for search purpose , will be replaced by good for
var enterpriseSoftwareController = require(allRouter + '/EnterpriseSoftware/' +
    'controller');
var utils = require('../models/util');
var async = require('async');
var opts = [
  { path: 'CSquire.company', select: '_id CSquire.name' },
  { path: 'intendedFor' },
  { path: 'company' },
  { path: 'goodFor' },
  { path: 'tags' },
  {
    path: 'followers.profiles',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.profiles.refId',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.companies.refId',
    model: 'companyProfile',
  },
  {
    path: 'connections.products.refId',
    model: 'productProfile',
  }, {
    path: 'connections.profiles',
  }, {
    path: 'connections.products',
  },
  {
    path: 'pastCompany',
  }, {
    path: 'products',
  },
  {
    path: 'demo',
  },
  {
    path: 'company',
  },
];
app.use(
  '/',
    function(req, res, next) {
    var masterCollections = {
      intendedController: global.MasterCollection.intendedScaleModel,
      enterpriseSoftware: global.MasterCollection.enterpriseSoftware,
      developmentSoftware: global.MasterCollection.developmentSoftware,
      revenues: global.MasterCollection.companyAnnualRevenue,
      headcounts: global.MasterCollection.companyHeadCount,
    };
    res.locals.key = 'product';
    res.locals.masterCollections = masterCollections;
    next();
  });

app.post('/createProduct', function(req, res) {
  req.body.admin = [req.session._id];
  companyController.findById(req.body.connectFromId, function(err, profile) {
    if (err || !profile) {
      res.redirect('/profile');
    } else {
      req.body.company = [profile._id];
      productController.createProduct(req, function(data) {
        if (data) {
          console.log('product created');
          console.log(data);
          profile.products.push(data._id);
          companyController.updateProfileByName(profile, profile.name,
            function(err, result) {
            if (err) {
              res.redirect('/profile');
            } else {
              if (req.body && req.body.connectFrom === 'company') {
                return res.redirect('/company/' + profile.uid);
              }
              return res.redirect('/product/' + data.uid);
            }
          });
        } else {
          res.redirect('/profile');
        }
      });
    }
  });

});

var checkProductAlready = function(req, next, res, callback) {
  api.companyProfile.getFirst({
    q: {
      _id: req.params.companyId, products:
    { $in: [req.params.productId] },
    },
  }, function(err, count) {
    if (err) {
      return next(err);
    }
    if (count.length) {
      return res.send(count.length);
    }
    callback(count);
  });
};

app.post('/updateCompanyProduct/:companyId/:productId/:type',
  function(req, res, next) {
    var query = {};
    query[req.params.type] = { products: req.params.productId };
    var adminId = req.session._id;
    if (req.session.manageProfile && req.session.isSuperUser) {
      adminId = req.session.manageProfileId;
    }
    if (req.params.type === '$addToSet') {
      checkProductAlready(req, next, res, function(data) {
        companyModel.findByIdAndUpdate(req.params.companyId , query,
     { upsert: true }, function(err, result) {
       if (err) {
         return next(err);
       }
       res.redirect('/company/' + result.uid);
     });
      });
    } else {
      companyModel.findByIdAndUpdate(req.params.companyId, query,
     { upsert: true }, function(err, result) {
      if (err) {
        return next(err);
      }
      res.redirect('/company/' + result.uid);
    });
    }
  });

app.get('/:uid',
    middleware.setUser,
    middleware.swithSignInUp,
    function(req, res, next) {
  var updateUid = req.session.uid;
  res.locals.loggedUser = req.session._id;
  if (req.session.manageProfile && req.session.isSuperUser &&
    req.session.manageType === 'people') {
    updateUid = req.session.manageProfile;
    res.locals.loggedUser = req.session.manageProfil;
  }
  api.personalProfile.getFirst({
    q: { uid: updateUid },
    populate: opts,
  }, req.session, function(err, loggedUser) {
    api.productProfile.getFirst({
      q: { uid: req.params.uid },
      populate: opts,
    }, req.session, function(err, profile) {
      if (profile) {
        var pastClient = [];
        var servicePartner = [];
        (function() {
          if (loggedUser) {
            if (profile.tags.length > 0) {
              res.locals.productTags = profile.tags;
            }
            res.locals.isFav =
                  loggedUser.favourites.products.indexOf(profile._id) !== -1;
            var isFollower =
 _.find(profile.followers.profiles, function(obj) {
              return obj._id === loggedUser._id;
            });
            res.locals.isFollower = isFollower;
            console.log(isFollower);
            var isCon =
 _.find(profile.connections.profiles, function(obj) {
              if (obj.refId && obj.refId._id) {
                return obj.refId._id === loggedUser._id;
              }
            });
            res.locals.isCon = isCon;
          }
          if ((req.session.isSuperUser && req.params.uid ===
                 req.session.manageProfile) ||
                 (req.session._id && profile.admin[0] &&
                 req.session._id === profile.admin[0])) {
            res.locals.isAdmin = true;
            res.locals.editSection =
                  req.query.editSection?req.query.editSection:null;
          }
          profile.followers.profiles =
                       profile.followers.profiles.slice(0, 3);
          res.locals.myUid = req.session.
                 isSuperUser?req.session.manageProfile:req.session.uid;
        })();
        async.waterfall(
          [
            function(cb1) {
              util.pastClietMgmt(req, profile, function(pastClnt) {
                pastClient = pastClnt;
                cb1();
              });
            }, function(cb) {
              util.getServicePartner(req, profile,
             function(svcPtr) {
                servicePartner = svcPtr;
                cb();
              });
            },
            function(cb) {
              if (loggedUser) {
                util.populateConnection(profile, req, function(err) {
                  cb(err);
                });
              } else {
                cb();
              }
            },
          ], function() {
            if (profile.claimedBy && profile.claimedBy.profiles) {
              res.locals.isClaimed = _.filter(profile.claimedBy.profiles,
                 _.matches({
                profileId: req.session._id,
                status: 'pending',
              })).length > 0;
              res.locals.isproductOwner = _.filter(profile.claimedBy.profiles,
                  _.matches({
                profileId: req.session._id,
                status: 'approved',
              })).length > 0;
            }
            res.locals.servicePartner = util.
            getSlicedData(servicePartner);
            res.locals.pastClient = util.
            getSlicedData(util.removeDuplicate(pastClient));
            res.locals.pastClientString = util.getRelation(pastClient);
            res.locals.servicePartnerString = util.getRelation(servicePartner);
            res.locals.returnUrl = req.originalUrl;

            (function() {
              res.locals.isClaimed = _.filter(profile.claimedBy.profiles,
             _.matches({
                profileId: req.session._id,
                status: 'pending',
              })).length > 0;
              var userIsOwner =
 _.filter(profile.claimedBy.profiles, _.matches({
                profileId: req.session._id,
                status: 'approved',
              })).length > 0;
              var isAdmin = false;
              if (profile.ownerId) {
                var pId = (profile.ownerId[0] && profile.ownerId[0].profileId) ?
                        profile.ownerId[0].profileId:profile.ownerId.profileId;
                isAdmin = pId === req.session._id;
              } else {
                isAdmin = true;
              }
              res.locals.isProductSettingAccess = false;
              if (userIsOwner ||
              profile.admin.indexOf(req.session._id) !== -1) {
                res.locals.isProductSettingAccess = true;
              }
              res.locals.userIsOwner = userIsOwner && isAdmin;
            })();
            var consultants =
       getSpecializeConsultants(req, res, profile);
            res.locals.consultantsProfile =
         randomConsultants(consultants);
            if (profile.company && profile.company.length) {
              res.locals.company = profile.company[0];
            }
            res.render('pages/product-new', {
              profileData: profile,
              title: 'CSquire | Product',
            });
          });
      } else {
        next('Not found');
      }
    });
  });
});
function getSpecializeConsultants(req, res, profile) {
  return _.filter(profile.connections.profiles, function(obj) {
    if (obj.refId) {
      return obj.relation.toLowerCase() === 'technology expert' &&
    obj.refId._id !== (req.session._id?req.session._id.toString():null);
    }
  });
}
function randomConsultants(consultants) {
  var shuffled = consultants.slice(0);
  var i = consultants.length;
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
app.post('/edit/:id',
    middleware.requireUser,
    middleware.swithSignInUp,
    multer({ includeEmptyFields: true }),
    function(req, res) {
  schema = req.body;
  console.log('set Schema');
  console.log(req.files);
  console.log(schema);
  if (req.files && req.files.file) {
    console.log('inside 1');
    util.uploadImage(req.files.file.path, function(err, result) {
      if (result) {
        console.log('image loaded');
        console.log(result);
        req.body.logo = result.url;
        productController.updateProdProfileById(schema,
          req.body.id, function(err, result) {
          if (err) {
            return res.status(400).send(err.message);
          } else {
            res.redirect('/product/' + result.uid);
          }
        });
      } else {
        return res.status(400).send(err.message);
      }
    });

  } else {
    if (req.body.id) {
      console.log('inside 2');
      productController.updateProdProfileById(schema,
        req.body.id, function(err, result) {
        console.log('inside 3');
        if (err) {
          return res.status(400).send(err.message);
        } else {
          res.redirect('/product/' + result.uid);
        }
      });
    }
  }
});

app.post('/addDemo', function(req, res) {
  schema = req.body;
  if (req.query.id) {
    console.log('inside 2');
    productController.addDemo(req.query.id, schema, function(err, result) {
      if (err) {
        return res.status(400).send(err.message);
      } else {
        res.redirect('/product/' + result.uid);
      }
    });
  }
});

app.post('/removeDemo', function(req, res) {
  if (req.body.product) {
    console.log('inside 2');
    productController.removeDemo(req.body.product,
     req.body.demoId, function(err, result) {
      if (err) {
        return res.status(400).send(err.message);
      } else {
        res.redirect('/product/' + result.uid);
      }
    });
  }
});

module.exports = app;
