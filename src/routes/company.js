var express = require('express');
var app = express.Router();
var multer = require('multer');
var async = require('async');
require('dotenv').load();
var requireDir = require('require-dir');
middleware = require('./middleware');
var allRouter = '../routes/api';
var _ = require('lodash');
var profileModel = require('../models/personalProfile');
var util = require('../models/util');
var utils = require('./util');
var companyModel = require('../models/companyProfile');
var jobtitleController = require(allRouter + '/jobTitle/controller');
var profileController = require(allRouter + '/personalProfile/controller');
var softwareDevController = require(allRouter + '/developmentSoftware/' +
    'controller');
var vendorController = require(allRouter + '/VendorService/' +
    'controller');
var businessController = require(allRouter + '/BusinessProcessArea/' +
    'controller');
var enterpriseSoftwareController = require(allRouter + '/EnterpriseSoftware/' +
    'controller');
var vendorTypeController = require(allRouter + '/vendorTypes/' +
    'controller');
var companyProfileController =
 require(allRouter + '/CompanyProfile/controller');
var headCountController = require('../routes/api/companyHeadCount/controller');
var annualRevenueController =
 require('../routes/api/companyAnnualRevenue/controller');
var api = require('../routes/csquire-api/');
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
  },
  views: requireDir('./views/'),
};
app.use(
  '/',
    enterpriseSoftwareController.index,
    vendorController.index,
    businessController.index,
    jobtitleController.index,
    softwareDevController.index,
    headCountController.index,
    annualRevenueController.index,
    vendorTypeController.index,
    function(req, res, next) {
    var masterCollections = {
      jobTitles: res.locals.jobtitles,
      softwareDevs: res.locals.softwaredevs,
      vendorServices: res.locals.vendorservices,
      businessProcess: res.locals.businessprocess,
      enterpriseSoftware: res.locals.enterpriseSoftwares,
      headCount: res.locals.headcounts,
      annualRevenue: res.locals.revenues,
      vendorTypes: res.locals.vendorTypes,
    };
    res.locals.key = 'company';
    res.locals.masterCollections = masterCollections;
    next();
  });
app.get('/:uid', middleware.setUser,
    middleware.swithSignInUp, function(req, res, next) {
      var customData = {}; var pastComp = [];
      var collegues = [];
      var technologyPartners = []; var pastClnts = [];
      var productsUsed = []; var servicePartners = [];
      var similarComp = [];
      var employee = [];
      var updateUid = req.session.uid;
      (function() {
        res.locals.key = 'company';
        if (req.session.customdata && req.session.customdata.CompanyProfile) {
          customData = _.defaults({}, req.session.customdata.CompanyProfile);
        }
      })();
      var companyPopulate = null;
      (function() {
        companyPopulate = [
         { path: 'employees' },
         { path: 'headCount' },
         { path: 'annualRevenue' },
         { path: 'type' },
         { path: 'products' },
         { path: 'speciality' },
         { path: 'tags' },
   {
     path: 'followers.profiles',
     match: { accountStatus: util.EnumAccountStatus.ENABLED },
     model: 'personalProfile',
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
        if (req.session.manageProfile && req.session.isSuperUser) {
          updateUid = req.session.manageProfile;
        }
      })();
      api.personalProfile.getFirst({
        q: { uid: updateUid },
        populate: companyPopulate,
      },
   req.session, function(err, loggedUser) {
     api.companyProfile.getFirst({
      q: { uid: req.params.uid },
      populate: companyPopulate,
    },
                req.session,
       function(err, companyProfile) {
         if (err) {
           return next(err);
         }
         if (!companyProfile) {
           return next('Company not found!!');
         }
         res.locals.companyName = companyProfile.name;
         res.locals.companyUid = companyProfile.uid;
         if (companyProfile.tags.length > 0) {
           res.locals.companyTags = companyProfile.tags;
         }
         (function() {
           if (err) {
             return next(err);
           }
           if (loggedUser) {
             res.locals.isFav =
                      loggedUser.favourites.companies
                      .indexOf(companyProfile._id) !== -1;
             var isFollower =
 _.find(companyProfile.followers.profiles, function(obj) {
   return obj._id === loggedUser._id;
 });
             res.locals.isFollower = isFollower;
             var isCon =
 _.find(companyProfile.connections.profiles, function(obj) {
              if (obj.refId && obj.refId._id) {
                return obj.refId._id === loggedUser._id;
              }
            });
             res.locals.isCon = isCon;
           }
         })();
         (function() {
          if ((req.session.isSuperUser && req.params.uid ===
                     req.session.manageProfile) || (req.session._id &&
                     companyProfile.admin[0] &&
                     req.session._id === companyProfile.admin[0])) {
            res.locals.isAdmin = 'true';
            res.locals.editSection = req.query.editSection?
                                          req.query.editSection:null;
          }
        })();
         (function() {
          res.locals.isClaimed = _.filter(companyProfile.claimedBy.profiles,
             _.matches({
            profileId: req.session._id,
            status: 'pending',
          })).length > 0;
          var userIsOwner =
 _.filter(companyProfile.claimedBy.profiles, _.matches({
            profileId: req.session._id,
            status: 'approved',
          })).length > 0;
          var isAdmin = false;
          if (companyProfile.ownerId) {
            var pId = (companyProfile.ownerId[0] &&
                                   companyProfile.ownerId[0].profileId) ?
                        companyProfile.ownerId[0].profileId:
                        companyProfile.ownerId.profileId;
            isAdmin = pId === req.session._id;
          } else {
            isAdmin = true;
          }
          res.locals.isCompanySettingAccess = false;
          if (userIsOwner ||
              companyProfile.admin.indexOf(req.session._id) !== -1) {
            res.locals.isCompanySettingAccess = true;
          }
          res.locals.userIsOwner = userIsOwner && isAdmin;
        })();
         var resultData = null;
         (function() {
          res.locals.followerProfile =
                                companyProfile.followers.profiles.length;
          companyProfile.followers.profiles =
                        companyProfile.followers.profiles.slice(0, 3);
          resultData = util.deepPick(companyProfile, customData);
        })();
         res.locals.myUid = req.session.isSuperUser?
                                 req.session.manageProfile:req.session.uid;
         async.waterfall(
           [
     function(cb1) {
       utils.pastClietMgmt(req, companyProfile, function(pastClnt) {
         pastClnts = utils.getSlicedData(pastClnt);
         res.locals.clientsString = utils.getRelation(pastClnt);
         cb1();
       });
     }, function(cb1) {
       utils.getTechnologyPartner(req,
              companyProfile, function(technologyPartner) {
                technologyPartners = _.cloneDeep(utils.
                         getSlicedData(technologyPartner));
                res.locals.techPartnerString =
                                utils.getRelation(technologyPartner);
                cb1();
              });
     },
            function(cb1) {
              utils.getServicePartner(req,
              companyProfile, function(servicePartner) {
                res.locals.servicePartner = _.cloneDeep(utils.
       getSlicedData(servicePartner));
                res.locals.serviceString =
                                utils.getRelation(servicePartner);
                cb1();
              });
            },
            function(cb1) {
              utils.getEmployee(req,
              companyProfile, function(emp) {
                employee = emp;
                cb1();
              });
            },
     function(cb1) {
       utils.getColleague(req, companyProfile, function(collegue) {
         collegues = collegue; cb1();
       });
     }, function(cb1) {
       utils.productsUsed(req, companyProfile, function(products) {
         productsUsed = utils.getSlicedData(products); cb1();
       });
     },
     function(cb1) {
       utils.getSimillarCompanies(companyProfile.specialities, req,
               function(err, res) {
                 similarComp = res; cb1();
               });
     },
     function(cb1) {
       utils.populateConnection(companyProfile, req, function(err, pf) {
         if (err) {
           return next(err);
         } if (pf) {
           companyProfile = pf;
         }
         cb1();
       });
     },
     function(cb2) {
       utils.specializationMgmt(req, companyProfile, cb2);
     },
    ], function() {
      res.locals.pastClient = _.cloneDeep(utils.removeDuplicate(pastClnts));
      res.locals.technologyPartner = _.cloneDeep(technologyPartners);
      res.locals.employee = _.cloneDeep(utils.removeDuplicate(employee));
      res.locals.pastExp = _.cloneDeep(pastComp);
      res.locals.collegues = _.cloneDeep(collegues);
      res.locals.productsUsed = _.cloneDeep(productsUsed);
      res.locals.loggedUser = req.session._id;
      res.locals.similarComp = utils.
             getSlicedData(similarComp);
      res.locals.products = utils.
       getSlicedData(resultData.products);
      resultData.products = utils.
             getSlicedData(res.locals.products);
      resultData.connections.products = utils.
  getSlicedData(resultData.connections.products);
      // = utils.getSlicedData(resultData.products);
      res.locals.returnUrl = req.originalUrl;
      if (loggedUser) {
        setFavConnStatus(resultData, loggedUser);
      }
      async.parallel([
      function(cb) {
        getSimilarCompany(req, res, loggedUser, resultData, cb);
      },
     ], function(err) {
       if (err) {
         return next(err);
       }
       res.render('pages/companyProfile-new', {
         profileData: resultData ,
         activePage: 'profile',
         title: 'CSquire | Company Profile',
       });
     });
    });
       });
   });
    });
function getSimilarCompany(req, res, loggedUser, resultData, callback) {
  var qry = {};
  var annualRevenue =
 resultData.annualRevenue?resultData.annualRevenue._id:null;
  var headCount = resultData.headCount?resultData.headCount._id:null;
  var type = resultData.type?resultData.type._id:null;
  var nin = [resultData._id];
  qry.q = {
    $or: [{ annualRevenue: annualRevenue },
  { headCount: headCount },
  { type: type }, ],
    _id: { $nin: nin },
  };
  qry.select = 'uid name logo';
  api.companyProfile.getAll(qry, req.session, function(err, resltCompany) {
    if (err) {
      return callback(err);
    }
    res.locals.resltCompany = randomProfessionals(resltCompany);
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
function setFavConnStatus(profile, loggedUser) {
  profile.connections = profile.connections || {
    companies: [],
    profiles: [],
    products: [],
  };
  _.each(profile.connections.profiles, function(otherProfile) {
    otherProfile.isCon = false;
    if (!otherProfile.refId) {
      return;
    }
    var otherId = otherProfile.refId._id || otherProfile.refId;
    _.find(loggedUser.connections.profiles, function(prof) {
      if (!prof.refId) {
        return;
      }
      var logConnId = prof.refId._id || prof.refId;
      if (logConnId === otherId) {
        otherProfile.isCon = true;
      }
    });
  });
}
function base64Encode(file, cb) {
  // Read binary data
  var bitmap = fs.readFileSync(file);
  // Convert binary data to base64 encoded string
  cb(new Buffer(bitmap).toString('base64'));
}
app.post('/edit/:id', middleware.requireUser, middleware.swithSignInUp,
   multer({ includeEmptyFields: true }), function(req, res, next) {
  schema = req.body;
  if (req.files && req.files.file) {
    utils.uploadImage(req.files.file.path, function(err, result) {
      if (result) {
        console.log('image loaded');
        console.log(result);
        req.body.logo = result.url;
        companyProfileController.updateProfileByName(schema,
           req.body.id, function(err, result) {
          if (err) {
            handleErr(err, req, res, next);
          } else {
            res.redirect('/company/' + result.uid);
          }
        });
      } else {
        handleErr(err, req, res, next);
      }
    });
  } else {
    companyProfileController.updateProfileByName(schema,
         req.body.id, function(err, result) {
      if (err) {
        handleErr(err, req, res, next);
      } else {
        res.redirect('/company/' + result.uid);
      }
    });
  }
});
function handleErr(err, req, res, next) {
  res.render('pages/customerr', {
    error: {
      // Header: err.body,
      header: 'Company already exists',
      text: 'Please contact ',
    },
  });
}
// = -----------------For New Company Profile----------------
app.get('/company/:uid', middleware.setUser,
    middleware.swithSignInUp, function(req, res, next) {
  res.locals.key = 'company';
  var customData = {};
  var updateUid = req.session.uid;
  if (req.session.customdata && req.session.customdata.CompanyProfile) {
    customData = _.defaults({}, req.session.customdata.CompanyProfile);
  }
  var companyPopulate = [
    { path: 'headCount' },
    { path: 'annualRevenue' },
    { path: 'type' },
    { path: 'products' },
    { path: 'speciality' },
    {
      path: 'employees',
      model: 'personalProfile',
    },
    {
      path: 'followers.profiles',
      match: { accountStatus: util.EnumAccountStatus.ENABLED },
      model: 'personalProfile',
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
    {
      path: 'connections.products.refId.goodFor',
    },
    {
      path: 'connections.products.refId.uid',
    },
    {
      path: 'connections.products.refId.company',
      model: 'companyProfile',
    },
    {
      path: 'connections.companies.refId.type',
      model: 'vendorType',
    },
  ];
  var opts = [{
      path: 'employees.jobTitle',
      model: 'jobTitle',
    },
    {
      path: 'employees.company',
      model: 'companyProfile',
    }, {
      path: 'connections.products.refId.goodFor',
      model: 'enterpriseSoftware',
    }, {
      path: 'connections.products.refId.company',
      model: 'companyProfile',
    }, ];
  if (req.session.manageProfile && req.session.isSuperUser) {
    updateUid = req.session.manageProfile;
  }
  api.personalProfile.getFirst({ uid: updateUid }, req.session,
   function(err, loggedUser) {
    api.companyProfile.getFirst({
      q: { uid: req.params.uid },
      populate: companyPopulate,
    },
                req.session,
       function(err, companyProfile) {
      utils.getcompanyData(profile, req, function(err, result) {
        if (err || companyProfile == null) {
          return next('Not found!!');
        }
        if (loggedUser) {
          res.locals.isFav = loggedUser.favourites.companies
                                     .indexOf(companyProfile._id) !== -1;
          var isFollower =
 _.find(companyProfile.followers.profiles, function(obj) {
            return obj._id.equals(loggedUser._id);
          });
          res.locals.isFollower = isFollower;
          var isCon =
 _.find(companyProfile.connections.profiles, function(obj) {
            if (obj.refId && obj.refId._id) {
              return obj.refId._id.equals(loggedUser._id);
            }
          });
          res.locals.isCon = isCon;
        }
        (function() {
          if ((req.session.isSuperUser && req.params.uid ===
                       req.session.manageProfile) || (req.session._id &&
                       companyProfile.admin[0] &&
                       req.session._id === companyProfile.admin[0])) {
            res.locals.isAdmin = 'true';
            res.locals.editSection =
                      req.query.editSection?req.query.editSection:null;
          }
          res.locals.followerProfile =
               companyProfile.followers.profiles.length;
          companyProfile.followers.profiles =
               companyProfile.followers.profiles.slice(0, 3);
        })();
        var resultData = null;
        (function() {
          resultData = util.deepPick(companyProfile, customData);
          res.locals.myUid = req.session.
                 isSuperUser?req.session.manageProfile:req.session.uid;
          res.render('pages/companyProfile-new', {
            profileData: resultData ,
            activePage: 'profile',
            title: 'CSquire | Company Profile',
          });
        })();
      });
    });
  });
});
module.exports = app;
