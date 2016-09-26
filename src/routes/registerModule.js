var express = require('express');
var app = express.Router();
var requireDir = require('require-dir');
var middleware = require('./middleware');
require('dotenv').load();
var api = require('../routes/csquire-api');
var _ = require('lodash');
var companyModel = require('../models/companyProfile');
var allRouter = '../routes/api';
var ProfileData = require('../models/personalProfile');
var profileController = require(allRouter + '/personalProfile/controller');
var jobTitleData = require('../models/jobTitle');
var headCountData = require('../models/companyHeadCount');
var ComapnyprofileData = require('../models/companyProfile');
var functionalController = require(
  '../routes/api/functionalRole/' +
    'controller');
var jobtitleController = require('../routes/api/jobTitle/controller');
var professionalController = require('../routes/api/ProfessionalLevel/' +
    'controller');
var revenueController =
 require('../routes/api/companyAnnualRevenue/controller');
var softwareDevController = require('../routes/api/developmentSoftware/' +
    'controller');
var vendorController = require('../routes/api/VendorService/' +
    'controller');
var businessController = require('../routes/api/BusinessProcessArea/' +
    'controller');
var enterpriseSoftwareController = require('../routes/api/EnterpriseSoftware/' +
    'controller');
var headCountController = require('../routes/api/companyHeadCount/controller');
var annualRevenueController =
 require('../routes/api/companyAnnualRevenue/controller');
var Linkedin = require('node-linkedin')(
  process.env.LINKEDIN_API_KEYID,
    process.env.LINKEDIN_API_KEY_SECRET,
    process.env.LOCALHOST + '/oauth/linkedin/callback');
/* == app.use('/mastercollection',Functionalcontroller.index);*/
// For customdata collection.
var _value = 'true';
var isPremiumData = [
  {
    name: 'PremiumPlacementInClientSearches',
    value: _value,
  },
  {
    name: 'LeadGenerationWhenClientsPostRFPs',
    value: _value,
  },
  {
    name: 'AnEnhancedProfilePage',
    value: _value,
  },
  {
    name: 'ToShareYourKnowledgeWithPotentialClientsAndMakeAProfit' ,
    value: _value,
  },
  {
    name: 'GetPremiumSearchResults' ,
    value: _value,
  },
  {
    name: 'GetAPersonalDropFolderForSavedArticlesLeadsRfpsEtc' ,
    value: _value,
  },
  {
    name: 'SeeWhosViewedYourProfile' ,
    value: _value,
  },
];
app.use(
  '/',
    function(req, res, next) {
    var masterCollections = {
      functionalRoles: global.MasterCollection.functionalRole,
      functionalArea: global.MasterCollection.functionalArea,
      jobTitles: global.MasterCollection.jobTitle,
      professionalLevels: global.MasterCollection.professionalLevel,
      revenues: global.MasterCollection.companyAnnualRevenue,
      softwareDevs: global.MasterCollection.developmentSoftware,
      vendorServices: global.MasterCollection.vendorService,
      businessProcess: global.MasterCollection.businessProcessArea,
      enterpriseSoftware: global.MasterCollection.enterpriseSoftware,
      headCount: global.MasterCollection.companyHeadCount,
      annualRevenue: global.MasterCollection.companyAnnualRevenue,
    };
    res.locals.masterCollections = masterCollections;
    next();
  });
var profileSchema;
var companyprofileSchema;
var routes = {
  api: {
    endPoints: require('./api/endPoints'),
    auth: require('./api/auth'),
  },
  views: requireDir('./views/'),
};
// Setup Route Bindings
app.get('/', function(req, res) {
  profileSchema = new ProfileData();
  companyprofileSchema = new ComapnyprofileData();
  var userMessage = req.query.userMessage;
  userMessageErr = req.query.userMessageErr;
  res.render('pages/register/register0', {
    success: userMessage,
    error: userMessageErr,
    registerPage: 'true',
    title: 'CSquire | Register',
  });
});
app.post('/registrationCompletion', CreateProfile);
app.post('/:id', HandleSteps);
app.get('/linkedin', linkedinHandler);
var multiplePopulate = {
  path: 'developmentSoftwares' +
  ' vendorServices professionalLevel' +
  ' businessProcessAreas ' +
  'enterpriseSoftwares ' +
  'jobTitle functionalRole',
};

function jobTitlecheckNameAndInsert(jobname, _companyName, _linkedinParam, cb) {
  var originalJobTitle = checkAndUpdate(_linkedinParam.headline);
  var jobIndex = jobname.search(' at ' + _companyName);
  var tobeUsedJobTitle = jobIndex > -1?
   originalJobTitle.substring(0, jobIndex):
  checkAndUpdate(_linkedinParam.headline);

  var result = _.find(global.MasterCollection.jobTitle,
    { name: tobeUsedJobTitle });
  if (typeof result === 'undefined') {
    /* - api.jobTitle.create({
      _id: global.MasterCollection.jobTitle.length + 1,
      name: tobeUsedJobTitle,
    }, null, function(err, res) {
      if (err) { return cb(err); }
      global.MasterCollection.jobTitle.push(res);
      return cb(null, res);
    });*/
    return cb(null, {
      _id: tobeUsedJobTitle,
      name: tobeUsedJobTitle,
    });
  } else {
    cb(null, result);
  }
}
function setParams(_linkedinParam, profileSchema, accessToken, req, res) {
  console.log('inside sertparams');
  req.session.CSquire = {};
  var location = ((_linkedinParam.
location) ? checkAndUpdate(_linkedinParam.
location.name):'');
  var getCompanyData =
 companyName(JSON.parse(JSON.stringify(
    checkAndUpdate(_linkedinParam.positions))));
  var _companyName = ((getCompanyData.name) ? getCompanyData.name:null);
  jobTitlecheckNameAndInsert(_linkedinParam.headline,
    _companyName, _linkedinParam, function(err, data) {
    var companySize = setCompanySize(getCompanyData);
    (function() {
      req.session.companySize = companySize;
      req.session.accessToken = accessToken;
      req.session.CSquire.externalSources = {};
      req.session.CSquire.externalSources.linkedIn = _linkedinParam;
      req.session.CSquire.noteToCommunity = _linkedinParam.summary;
      req.session.LinkedInUser = true;
      req.session.CSquire.email =
checkAndUpdate(_linkedinParam.emailAddress);
    })();
    req.session.CSquire.name = checkAndUpdate(_linkedinParam.firstName);
    req.session.CSquire.lastName =
checkAndUpdate(_linkedinParam.lastName);
    req.session.CSquire.location = location;
    req.session.CSquire.currentCompany = _companyName;
    req.session.CSquire.pictureUrl =
(_linkedinParam.pictureUrls.values !== undefined)?
_linkedinParam.pictureUrls.values[0]:undefined;
    req.session.CSquire.jobTitle = data;
    var returnData = {
      jobTitle: data,
      _companyName: _companyName,
      companySize: companySize,
    };
    respond(returnData, req, res);
  });
}
function respond(data, req, res) {
  console.log('inside respond');
  getheadCount(data.companySize, {}, req);
  var Obj = {
    functionalroles: res.locals.functionalroles,
    registerPage: 'true',
    email: req.session.CSquire.email,
    givenName: req.session.CSquire.name,
    surname: req.session.CSquire.lastName,
    location: req.session.CSquire.location,
    linkedinUser: 'true',
    jobTitle: data.jobTitle,
    steps: '4',
    title: 'CSquire | Register',
  };
  renderPage(data._companyName, Obj, res);
}
function linkedinHandler(req, res) {
  /* == logger.info('login handler as============================'+
      '============== a linkedin user');*/
  var linkedin = Linkedin.init(req.query.accessToken);
  linkedin.people.me(function(err, _linkedinParam) {
    if (err) {
      res.redirect('/login');
    } else {
      var data = setParams(_linkedinParam,
      {}, req.query.accessToken, req, res);
    }
  });
}
function renderPage(_companyName, Obj2, res) {
  if (_companyName !== 'null') {
    Obj2.companyName = _companyName;
  }
  res.render('pages/register/register', Obj2);
}
function companyName(_param) {
  var _isParam;
  var _currentCompany;
  if (_param.values !== undefined) {
    for (var i = 0; i < _param.values.length; i++) {
      _isParam = _param.values[i].isCurrent;
      if (_isParam === true) {
        _currentCompany = _param.values[i].company;
        return _currentCompany;
      }
    }
  } else { _currentCompany = ''; return _currentCompany; }
}
function setCompanySize(getCompanyData) {
  var companySize = '&companySize=null';
  if (getCompanyData.size) {
    headCountController.checkNameAndInsert(getCompanyData.size);
    companySize = getCompanyData.size;
  }
  return companySize;
}
function checkAndUpdate(param) {
  if (param) {
    return param;
  } else {
    return '';
  }
}
function getheadCount(companySize, profileSchema, req) {
  var result = _.find(global.MasterCollection.companyHeadCount,
{ name: companySize });
  if (result) {
    req.session.headCount = headcount._id;
  }

}
function CreateProfile(req, res) {
  var storeProfile = new ProfileData();
  var storeCompanyProfile = new ComapnyprofileData();
  var noPremiumFlag = req.body.notPremium;
  storeProfile = req.session.CSquire;
  storeCompanyProfile = req.session.companyData?req.session.companyData:{};
  console.log('====session====');
  console.log(req.session);
  console.log('==companyData==');
  console.log(storeCompanyProfile);
  console.log('*company exist**********' + req.body.companyexist);
  if (noPremiumFlag === undefined) {
    routes.api.auth.createUserInternally(
      req,
        res,
        storeProfile,
        ProfileData,
        multiplePopulate,
        isPremiumData,
        storeCompanyProfile
    );
  } else {
    var emptyArr = [];
    routes.api.auth.createUserInternally(
      req,
     res,
     storeProfile,
     ProfileData,
     multiplePopulate,
     emptyArr,
     storeCompanyProfile
    );
  }
}
function  handleStepOne(req, res, _data) {
  req.session.CSquire = {};
  req.session.CSquire.email = _data.email;
  req.session.LinkedInUser = false;
  req.session.password = _data.password;
  console.log(req.session);
  profileController.getProfileByEmail(req.session.CSquire.email,
              function(profile) {
    if (profile !== null) {
      res.redirect('/register?userMessageErr=Email already exists');
    } else {
      console.log('===roles====');
      console.log(res.locals.functionalroles);
      res.render('pages/register/register', {
        functionalroles: res.locals.functionalroles,
        registerPage: 'true',
        steps: '4',
        title: 'CSquire | Register',
      });
    }
  });
}
function  handleStepTwo(req, res, _data) {
  (function() {
    req.session.CSquire.name = _data.givenName;
    req.session.CSquire.lastName = _data.surname;
    req.session.CSquire.location = _data.location;
    req.session.CSquire.currentCompany = _data.currentCompany;
    req.session.CSquire.professionalLevel = _data.professionalLevel;
    req.session.CSquire.functionalRole = _data.functionalRole || 7;
    req.session.CSquire.functionalAreas = _data.functionalAreas;
    req.session.CSquire.jobTitle = _data.jobTitle;
  })();
  var result = _.find(global.MasterCollection.functionalRole,
{ _id: parseInt(_data.functionalRole) });
  if (typeof result !== 'undefined') {
    req.session.roleName = result.name;
  } else {
    req.session.roleName = 'Member';
  }
  return new CreateProfile(req, res);
  /* - if (req.body.functionalRole === '2' || req.body.functionalRole === '6') {
    res.render('pages/register/register3', {
      registerPage: 'true',
      steps: '4',
      role: req.session.roleName,
      title: 'CSquire | Register',
    });
  } else if (req.body.functionalRole === '3') {
    res.render('pages/register/register1', {
      registerPage: 'true',
      steps: '4',
      role: req.session.roleName,
      title: 'CSquire | Register',
    });
  } else {
    res.render('pages/register/register2', {
      registerPage: 'true',
      steps: '4',
      role: req.session.roleName,
      title: 'CSquire | Register',
    });
  }*/
}
function CheckCompanyExists(renderObject, req, res) {
  // Check if the company exists;
  var companyPopulate = 'employees ' +
                         'headCount ' +
                         'annualRevenue ';
  renderObject.curCmpny = req.session.CSquire.currentCompany;
  companyModel.findOne(
    { name: req.session.CSquire.currentCompany.toLowerCase() },
        function(err, companyProfile) {
      companyModel.populate(
        companyProfile, companyPopulate,
             function(err, companyProfile) {
          if (err) {
            res.render('pages/register/register7', {
              title: 'CSquire | Register',
              role: req.session.roleName,
            });
          }
          if (companyProfile) {
            renderObject.companyexist = 'companyexist';
            // Code to add the people list to the add connection page
            console.log(companyProfile);
            ProfileData.find({
              _id: { $in: companyProfile.employees },
            }, function(err, docs) {
              if (err) {
                res.render('pages/register/register7', {
                  title: 'CSquire | Register',
                  role: req.session.roleName,
                });
              } else {
                console.log('==== users====');
                console.log(docs);
                var users = docs.slice(0, 4);
                renderObject.users = users;
                res.render('pages/register/register7',
                      renderObject);
              }
            });
          } else {
            var check = req.session.headCount?req.session.headCount:{
              _id: '',
            };
            var HeadCountresult =
 _.find(global.MasterCollection.companyHeadCount, { _id: check._id });
            if (HeadCountresult) {
              renderObject.companySize = headcount;
            }
            res.render('pages/register/register5', renderObject);
          }
        });
    });
}
function handleStepsThree(req, res, _data) {
  if (req.session.CSquire.functionalRole === '2' ||
    req.session.CSquire.functionalRole === '6') {
    req.session.CSquire.vendorServices = _data.vendorServices;
  } else if (req.session.CSquire.functionalRole === '3') {
    req.session.CSquire.enterpriseSoftwares =
     _data.enterpriseSoftwares;
  }
  if (req.session.CSquire.functionalRole === '2' ||
      req.session.CSquire.functionalRole === '3' ||
      req.session.CSquire.functionalRole === '6') {
    renderObject = {
      registerPage: 'true',
      steps: '4',
      role: req.session.roleName,
      title: 'CSquire | Register',
    };
    new CheckCompanyExists(renderObject, req, res);
  } else {
    req.session.CSquire.businessProcessAreas =
     _data.businessProcessAreas;
    req.session.CSquire.developmentSoftwares =
     _data.developmentSoftwares;
    res.render('pages/register/register4', {
      registerPage: 'true',
      steps: '4',
      role: req.session.roleName,
      title: 'CSquire | Register',
    });
  }
}
function storeCompanyDetails(req, res, _data) {
  var _imagePathData = '';
  req.session.companyData = {};
  var companyData = req.session.companyData;
  companyData.companyWebsite = _data.companyWebsite;
  companyData.companyLocations = _data.companyLocations;
  companyData.annualRevenue = _data.annualRevenue;
  companyData.headCount = _data.headCount;
  companyData.description = _data.description;
  companyData.logo = _imagePathData;
  renderObject = {
    companydata: companyData,
    registerPage: 'true',
    role: req.session.roleName,
    premiumData: isPremiumData,
    title: 'CSquire | Register',
  };
  res.render('pages/register/register7',
          renderObject);
}
function handleStepFour(req, res, _data) {
  console.log(req.session);
  if (req.session.CSquire.functionalRole === '2' ||
       req.session.CSquire.functionalRole === '3' ||
       req.session.CSquire.functionalRole === '6') {
    if (!_data.companyexist) {
      storeCompanyDetails(req, res, _data);
    } else {
      renderObject = {
        registerPage: 'true',
        premiumData: isPremiumData,
        role: req.session.roleName,
        companyexist: _data.companyexist,
        title: 'CSquire | Register',
      };
      res.render('pages/register/register7',
              renderObject);
    }
  } else {
    // Store the vendor names here
    renderObject = {
      companydata: [],
      registerPage: 'true',
      premiumData: isPremiumData,
      steps: '4',
      role: req.session.roleName,
      stepNumber: '5',
      title: 'CSquire | Register',
    };
    new CheckCompanyExists(renderObject, req, res);
  }
}
function handleStepFive(req, res, _data) {
  if (!_data.companyexist) {
    storeCompanyDetails(req, res, _data);
  } else {
    renderObject = {
      registerPage: 'true',
      premiumData: isPremiumData,
      companyexist: _data.companyexist,
      role: req.session.roleName,
      title: 'CSquire | Register',
    };
    res.render('pages/register/register7',
            renderObject);
  }
}
function HandleSteps(req, res) {
  var _data = req.body;
  switch (req.params.id) {
    case 'step1': {
      handleStepOne(req, res, _data);
      return;
    }
    case 'step2': {
      handleStepTwo(req, res, _data);
      return;
    }
    /* - case 'step3': {
      handleStepsThree(req, res, _data);
      return;
    }
    case 'step4': {
      handleStepFour(req, res, _data);
      return;
    }
    case 'step5': {
      handleStepFive(req, res, _data);
      return;
    }*/
    default: {
      res.render('error', {
        message: 'page you requested could not be found',
        error: {
          status: '404',
          stack: '',
          title: 'CSquire | Page Not Found',
        },
      });
      return;
    }
  }
}
module.exports = app;
