var async = require('async');
var _ = require('underscore');
var requestify = require('requestify');
var requestify2 = require('requestify');
var requestify3 = require('requestify');
var cloudinary = require('cloudinary');
var log = require('../middleware').logger;
var http = require('http');
var stormpath = require('stormpath');
// = var stormpathEx = require('./stormpath-extend');
var _password = '';
var PersonalProfileModel = require('../../models/personalProfile');
var CompanyProfileModel = require('../../models/companyProfile');
var profileController = require('./personalProfile/controller');
var companyProfileController = require('./CompanyProfile/controller');
var apiKey = new stormpath.ApiKey(
  process.env.STORMPATH_API_KEY_ID,
  process.env.STORMPATH_API_KEY_SECRET
);
var client = new stormpath.Client({ apiKey: apiKey });
var appHref = process.env.STORMPATH_HREF;
var freeDirectory = null;
var stormpathApplication;
console.log('==== auth api ===========');
client.getApplication(appHref, function(err, app) {
  if (err) {
    throw err;
  }
  stormpathApplication = app;
});
exports.createUserInternally = function(
  req, res, _data) {
  var useraccountArr = [];
  var finaldata = {
    givenName: _data.givenName,
    surname: _data.surname,
    email: _data.email,
    password: _data.password,
  };
  var _functionalRoleValue = 'null';
  switch (_data.functionalRole) {
    case 1: {
      _functionalRoleValue = 'Financial/Accounting Professional';
      break;
    }
    case 2: {
      _functionalRoleValue = 'IT Consultant';
      break;
    }
    case 3: {
      _functionalRoleValue = 'Enterprise Software Developer';
      break;
    }
    case 4: {
      _functionalRoleValue = 'CXO';
      break;
    }
    case 5: {
      _functionalRoleValue = 'IT/IS Professional';
      break;
    }
  }
  stormpathApplication.createAccount(finaldata,
     function onAccountCreated(err, createdAccount) {
       if (err) {
         console.log('Error creating account');
       } else {
         console.log('Account created successfully');
         // ==createAPIKey(createdAccount, function(err, result) {
         createdAccount.createApiKey(function(err, apiKey) {
            console.log('API Key:', apiKey.id);
            console.log('API Secret:', apiKey.secret);
            res.send('API Key:' + apiKey.id +
             '  API Secret:' + apiKey.secret);
            getDir(_data, createdAccount,
                 _functionalRoleValue,
                  'Free');
          });
       }
     });
};
var getDir = function(_data, account, functionalRole, parentGroup) {
  client.getDirectories({ name: 'CSquire_Default_Directory' },
      function(err, directories) {
    directories.forEach(function(dir, callback) {
      premiumDirectory = dir;
      var groupRole = parentGroup + '-' + functionalRole;
      _addGroups(_data, premiumDirectory,
       account, groupRole, callback);
    }, function(err) {
      // ==console.log('error');
      // ==console.log(err);
    });
  });
};

var _addGroups = function(_data, dir, account, groupName, callback) {
  console.log(_data);
  var personalDbData = {
    email: _data.email,
    name: _data.givenName,
    lastName: _data.surname,
    location: _data.location,
    professionalLevel: _data.professionalLevel,
    functionalRole: _data.functionalRole,
    jobTitle: _data.jobTitle,
    company: _data.currentCompany,
    accountStatus: _data.accountStatus,
    venderServices: _data.venderServices,
    developmentSoftwares: _data.developmentSoftwares,
    enterpriseSoftwares: _data.enterpriseSoftwares,
    businessProcessAreas: _data.businessProcessAreas,
    pictureUrl: _data.pictureUrl,
  };
  async.parallel([function(cb) {
    companyProfileController.findByName(personalDbData.company,
     function(err, _company) {
      if (_company) {
        console.log('company id === : ' + _company._id);
        personalDbData.company = [_company._id];
        return cb();
      }
      var companyProfileModel = new CompanyProfileModel();
      var personalProfileModel = new PersonalProfileModel();
      console.log('company new object id === : ' +
       companyProfileModel._id);
      companyProfileModel.name = personalDbData.company;
      personalDbData.company = [companyProfileModel._id];
      var personalProfileId = personalProfileModel._id;
      companyProfileModel.employees = [personalProfileId];
      companyProfileModel.admin = [personalProfileId];
      companyProfileController.createAPI(companyProfileModel, cb);
    });
  }, function(cb) {
    dir.getGroups({ name: groupName }, function(err, groups) {
      if (err) {
        return cb(err);
      }
      groups.each(function(group, err) {
      group.addAccount(account,
           function onMembershipCreated(err, membership) {
             cb(err, membership);
           });
    });

    });
  }, ],
  function(err) {
    // Company Profile exist/or create new
    if (err) {
      return callback(err);
    }
    // Personal profile creation
    profileController.createAccount(personalDbData,
              function(err, profile) {
                console.log('===============');
                console.log(profile);
                console.log(err);
                console.log('===============');
                if (err) {
                  callback(err);
                  return;
                }
                console.log('new profile created successfully');
                callback();
              });

  });
  // ==============REQUESTIFY================== //
  var getCustomdata = function(customdataHref, req, cb) {
    requestify.request(customdataHref, {
      method: 'GET',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
        .then(function(response) {
      var customdata = response.getBody();
      console.log('successfull Response');
      console.log(customdata.apiObjectFilter);
      console.log('==========REQ SESSION==============');
      cb();
    });
  };
};
