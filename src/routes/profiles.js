var async = require('async');
var express = require('express');
var app = express.Router();
var _ = require('lodash');
var multer = require('multer');
var util = require('./util');
require('dotenv').load();
var requireDir = require('require-dir');
middleware = require('./middleware');
var allRouter = '../routes/api';
var api = require('../routes/csquire-api/');
var ProfileModel = require('../models/personalProfile');
var utils = require('../models/util.js');
var companyModel = require('../models/companyProfile');
// Var relationModel = require('../models/connectionRelation');
var jobtitleController = require(allRouter + '/jobTitle/controller');
var softwareDevController = require(allRouter + '/developmentSoftware/' +
  'controller');
var vendorController = require(allRouter + '/VendorService/' +
  'controller');
var businessController = require(allRouter + '/BusinessProcessArea/' +
  'controller');
var enterpriseSoftwareController = require(allRouter + '/EnterpriseSoftware/' +
  'controller');
var annualRevenueController = require(allRouter + '/companyAnnualRevenue/' +
  'controller');
var headCountController = require(allRouter + '/companyHeadCount/' +
  'controller');
var connectionRelationController = require(allRouter + '/connectionRelation/' +
  'controller');
var profileController = require(allRouter +
  '/personalProfile/' +
  'controller');
var compController = require(allRouter +
  '/CompanyProfile/' +
  'controller');
var productController = require(allRouter +
  '/productProfile/' +
  'controller');
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
var multiplePopulate = [{
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
  path: 'tags',
}, {
  path: 'functionalRole',
}, {
  path: 'followingProfiles.profiles',
  select: '_id name lastName uid pictureUrl',
  match: { accountStatus: utils.EnumAccountStatus.ENABLED },
}, {
  path: 'followingProfiles.companies',
  select: '_id name uid logo',
}, {
  path: 'followingProfiles.products',
  select: '_id name uid logo',
}, {
  path: 'followers.profiles',
  select: '_id name lastName uid pictureUrl',
  match: { accountStatus: utils.EnumAccountStatus.ENABLED },
}, {
  path: 'company',
}, {
  path: 'profileView.ProfileData',
  match: { accountStatus: utils.EnumAccountStatus.ENABLED },
}, {
  path: 'connections.companies.refId',
  model: 'companyProfile',
},
{
  path: 'connections.products.refId',
  model: 'productProfile',
},
{
  path: 'connections.profiles.refId',
  match: { accountStatus: utils.EnumAccountStatus.ENABLED },
  model: 'personalProfile',
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
];
var profileSchema = new ProfileModel();
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
  },
  views: requireDir('./views/'),
};
// Setup Route Bindings
// -------------------------------------------------------------------
// Views
app.use(
 '/',
  enterpriseSoftwareController.index,
  vendorController.index, businessController.index,
  jobtitleController.index,
  softwareDevController.index,
  annualRevenueController.index,
  headCountController.index,
  connectionRelationController.index,
  function(req, res, next) {
    var masterCollections = {
      jobTitles: res.locals.jobtitles,
      softwareDevs: res.locals.softwaredevs,
      vendorServices: res.locals.vendorservices,
      businessProcess: res.locals.businessprocess,
      enterpriseSoftware: res.locals.enterpriseSoftwares,
      revenues: res.locals.revenues,
      headcounts: res.locals.headcounts,
      relationTypes: res.locals.relationTypes,
    };
    res.locals.key = 'people';
    res.locals.masterCollections = masterCollections;
    next();
  });
app.post('/edit',
  middleware.requireUser,
  middleware.swithSignInUp,
  multer({ includeEmptyFields: true }),
  function(req, res, next) {
    schema = req.body;
    console.log('set Schema');
    console.log(req.files);
    console.log(schema);
    var updateProfileUid = req.session.uid;
    if (res.locals.isSuperUser && req.query.uid) {
      updateProfileUid = req.query.uid;
    }
    if (req.files && req.files.file) {
      util.uploadImage(req.files.file.path, function(err, result) {
        if (err) {
          return next(err);
        }
        if (result) {
          console.log('image loaded');
          console.log(result);
          req.body.pictureUrl = result.url;
          profileController.updatePersonalProfileByUid(schema,
        updateProfileUid, function(err, result) {
          if (err) {
            return next(err);
          } else {
            if (!res.locals.isSuperUser) {
              util.setUserSessionVars(result.name,
                     result.lastName, result.pictureUrl, req);
            }
            if (res.locals.isSuperUser) {
              res.redirect('/profile?uid=' + updateProfileUid);
            } else {
              res.redirect('/profile');
            }
          }
        });
        } else {
          return next(err);
        }
      });
    } else {
      profileController.updatePersonalProfileByUid(schema,
      updateProfileUid, function(err, result) {
        if (err) {
          return next(err);
        } else {
          if (!res.locals.isSuperUser) {
            util.setUserSessionVars(result.name,
                         result.lastName, result.pictureUrl, req);
          }
          if (res.locals.isSuperUser) {
            res.redirect('/profile?uid=' + updateProfileUid);
          } else {
            res.redirect('/profile');
          }
        }
      });
    }
  });

app.get('/',
  middleware.requireUser,
  middleware.swithSignInUp,
  function(req, res, next) {
    var schema = res.locals.user.email;
    var editSection = req.query.editSection?req.query.editSection:null;
    var updateProfileUid = req.session.uid;
    if (res.locals.isSuperUser && req.query.uid &&
                     req.query.uid === req.session.manageProfile) {
      updateProfileUid = req.query.uid;
    } else if ((res.locals.isSuperUser && req.query.uid) ||
                     (res.locals.isSuperUser &&
                         req.session.uid !== req.session.manageProfile)) {
      if (req.query.uid) {
        return res.redirect('/people/' + req.query.uid);
      } else {
        return res.redirect('/people/' + req.session.uid);
      }
    }
    api.personalProfile.getFirst({
      q: { uid: updateProfileUid },
      populate: multiplePopulate,
    },
           req.session,
  function(err, profile) {
    if (err) {
      next(err);
    }
    if (!profile) {
      return next(new Error('Not found!!'));
    }
    if (profile) {
      profile = util.filterConnection(profile);
      if (err) {
        return next(err);
      }
      profileDataMgtmt(res, profile);
      res.locals.profileConnection = util.getSlicedData(
       util.removeDuplicateForPeople(profile.connections.profiles,
               req.session._id));
      res.locals.companies = util.getSlicedCompanyData(
       util.removeDuplicateForPeople(
          profile.connections.companies, req.session._id), profile.company);
      res.locals.products = util.getSlicedData(util.removeDuplicateForPeople(
       profile.connections.products, req.session._id));
      res.locals.profiles = res.locals.profileConnection;
      profile.connections.products = _.filter(profile.connections.products,
         function(obj) {
           return obj.connectionStatus === 'APPROVED';
         });
      // ================================
      async.waterfall(
       [
     function(cb1) {
       util.getTechnologyPartner(req, profile,
        function(tecpart) {
          res.locals.technologyPartnerString =
                           util.getRelation(util.removeDuplicate(tecpart));
          res.locals.technologyPartner =
                       (util.getSlicedData(util.removeDuplicate(tecpart)));
          cb1();
        });
     },
     function(cb1) {
       util.getServicePartner(req, profile,
        function(servpart) {
          res.locals.servicePartnerString =
                     util.getRelation(util.removeDuplicate(servpart));
          res.locals.servicePartner =
                      util.getSlicedData(util.removeDuplicate(servpart));
          cb1();
        });
     },
     function(cb1) {
       util.pastClietMgmt(req, profile, function(pastClnt) {
         res.locals.pastClientString =
                      util.getRelation(pastClnt);
         res.locals.pastClient =
                      util.removeDuplicate(util.getSlicedData(
          util.removeDuplicate(pastClnt)));
         cb1();
       });

     }, function(cb1) {
       util.getColleague(req, profile, function(collg) {
         res.locals.colleguesString =
                util.getPersonRelation(collg);
         res.locals.collegues =
                      util.removeDuplicate(util.getSlicedData(
          util.removeDuplicate(collg)));
         cb1();
       });

     }, function(cb1) {
       util.productsUsed(req, profile, function(prdct) {
         res.locals.productsUsedString =
                util.getProductRelation(util.removeDuplicate(prdct));
         res.locals.productsUsed =
                      util.removeDuplicate(util.getSlicedData(
          util.removeDuplicate(prdct)));
         cb1();
       });

     }, function(cb1) {
       util.populateConnection(profile, req, function(err, pf) {
         if (err) {
           return next(err);
         }
         if (pf) {
           profile = pf;
         }
         cb1();
       });
     },
     function(cb2) {
       util.specializationMgmt(req, profile,
      function(prdct) {
        res.locals.specializationString =
             util.getProductRelation(util.removeDuplicate(prdct));
        res.locals.expertise =
 util.removeDuplicate(util.getSlicedData(util.removeDuplicate(prdct)));
        cb2();
      });
     },
    ], function() {
      res.locals.loggedUser = profile._id.toString();
      res.locals.blogHref = process.env.BLOG_HREF;
      res.render('pages/profile-new',
          {
            profileData: profile ,
            activePage: 'profile',
            title: 'CSquire | Profile',
            editSection: editSection,
            validation: ProfileModel.getValidations(),
          });
    });
    }
  });
  });

function profileDataMgtmt(res, profile) {
  var today = new Date();
  var lastWeek = new Date(today.getTime() - (60 * 60 * 24 * 7 * 1000))
   .toISOString();
  profile.profileView = _.filter(profile.profileView, function(obj) {
    if (obj.dateViewed && obj.dateViewed > lastWeek) {
      return obj;
    }
  });
  // Res.locals.relationTypes
  profile.profileView = profile.profileView.reverse();
  profile.profileView = _.uniq(profile.profileView,
       'ProfileData.uid');
  profile.profileView = profile.profileView.slice(0, 3);
  profile.followers.profiles =
       profile.followers.profiles.slice(0, 3);
  var resultProfile = profile;
  var resultFp = getfollowingItems(resultProfile);
  res.locals.resultFp = resultFp;


}



function restrictList(profile) {
  if (profile.connections) {
    var temp = profile.connections?profile.connections.profiles:[];
    profile.connections.profiles =
              _.filter(profile.connections.profiles, function(obj) {
                return obj.refId != null;
              });
    profile.connections.profiles = util.getSlicedData(temp);
    var temp2 = profile.connections?profile.connections.products:[];
    profile.connections.products =
              _.filter(profile.connections.products, function(obj) {
                return obj.refId != null;
              });
    profile.connections.products = util.getSlicedData(temp2);
    var temp3 = profile.connections?profile.connections.companies:[];
    profile.connections.companies =
              _.filter(profile.connections.companies, function(obj) {
                return obj.refId != null;
              });
    profile.connections.companies = util.getSlicedData(temp3);
  } else {
    console.log('no data');
  }
}

function getfollowingItems(resultProfile) {
  for (var i = 0; i < resultProfile.followingProfiles.companies.length; i++) {
    resultProfile.followingProfiles.companies[i].type = 'company';
  }
  for (i = 0; i < resultProfile.followingProfiles.profiles.length; i++) {
    resultProfile.followingProfiles.profiles[i].type = 'people';
  }
  for (i = 0; i < resultProfile.followingProfiles.products.length; i++) {
    resultProfile.followingProfiles.products[i].type = 'product';
  }
  var fp = resultProfile.followingProfiles.
   profiles.concat(resultProfile.followingProfiles.companies);
  fp = fp.concat(resultProfile.followingProfiles.products);
  var resultFp = call1(fp);
  return resultFp;
}
function call1(fp) {
  var num = fp.length >= 3?2:fp.length - 1;
  var resultFp = [];
  var margin = fp.length - 1;
  var split;
  for (i = 0; i <= num; i++) {
    split = Math.round(Math.random() * margin);
    resultFp.push(fp[split]);
    fp.splice(split, 1);
    margin--;
  }
  return resultFp;
}
function handleErr(err) {
  console.log(err);
}
module.exports = app;