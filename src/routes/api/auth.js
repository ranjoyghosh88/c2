var async = require('async');
var _ = require('underscore');
var requestify = require('requestify');
var requestify2 = require('requestify');
var requestify3 = require('requestify');
var cloudinary = require('cloudinary');
var log = require('../middleware').logger;
var http = require('http');
var stormpath = require('stormpath');
var companyProfile = require('../../models/companyProfile');
var profileController = require('./personalProfile/controller');
var companyPopulate = 'employees ' +
                      'headCount ' +
                      'annualRevenue ';
var crypto = require('crypto');
var api = require('../../routes/csquire-api');
var _ = require('lodash');

var apiKey = new stormpath.ApiKey(
  process.env.STORMPATH_API_KEY_ID,
process.env.STORMPATH_API_KEY_SECRET
);
var errorHandler = null;
var premGroupArray1 = require('./functionalRoleConfig');
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
req,
res,
profileSchema,
profileData,
multiplePopulate,
isPremium,
companyprofileSchema) {
  companyprofileSchema.name = profileSchema.currentCompany;
  var finaldata = {
    givenName: profileSchema.name,
    surname: profileSchema.lastName,
    email: profileSchema.email,
    password: req.session.password,
  };
  var data = {
    user: {
      name: req.session.CSquire.name,
      lastName: req.session.CSquire.lastName,
      email: req.session.CSquire.email,
      password: req.session.password,
      location: req.session.CSquire.location,
      professionalLevel: req.session.CSquire.professionalLevel,
      jobTitle: req.session.CSquire.jobTitle,
      functionalRole: req.session.CSquire.functionalRole,
      functionalAreas: (typeof (req.session.CSquire.functionalAreas) ===
       'string')?[req.session.CSquire.functionalAreas]:
      req.session.CSquire.functionalAreas,
      businessProcessAreas: req.session.CSquire.businessProcessAreas,
      vendorServices: profileSchema.vendorServices,
      enterpriseSoftwares: profileSchema.enterpriseSoftwares,
      developmentSoftwares: profileSchema.developmentSoftwares,
    },
    company: {
      name: req.session.CSquire.currentCompany,
    },
    // - isPremium: req.body.notPremium === 'No Thanks'?'false':'true',
    isPremium: 'false',
  };
  data.company = req.session.companyData?_.extend(data.company,
req.session.companyData):data.company;
  if (!req.session.LinkedInUser) {
    api.register.create(data, req.session, function(error, data) {
      if (error) {
        return res.redirect('/register?userMessageErr=' + error);
      }
      res.render(
        'pages/registrationCompletion',
                    {
          registerPage: 'true',
          title: 'CSquire | Register',
        }
      );
    });
// =========== Free directory================ //
  } else {
    if (req.session.CSquire.externalSources &&
   req.session.CSquire.externalSources.linkedIn) {
      (function() {
        data.user.externalSources = {
          linkedIn: req.session.CSquire.externalSources.linkedIn,
        };
        if (req.session.CSquire.externalSources.
          linkedIn.pictureUrls &&
          req.session.CSquire.externalSources.
          linkedIn.pictureUrls.values &&
          req.session.CSquire.externalSources.
          linkedIn.pictureUrls.values.length > 0) {
          data.user.pictureUrl =
        req.session.CSquire.externalSources.linkedIn.pictureUrls.values[0];
        }
        if (req.session.CSquire.externalSources.linkedIn.summary) {
          data.user.noteToCommunity =
        req.session.CSquire.externalSources.linkedIn.summary;
        }
      })();
    }
    var parentGroup = 'Free';
    premiumFlag = 'false';
    if (isPremium.length !== 0) {
      premiumFlag = 'true';
      parentGroup = 'Premium';
    }
    data.user.password = 'CSquireV3' + profileSchema.email;
    // =====================Linkedin Stormpath============ //
    requestify.request(process.env.STORMPATH_HREF + '/accounts', {
      method: 'POST',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
      body: {
        providerData:
 {
          providerId: 'linkedin',
          accessToken:
 req.session.accessToken,
        },
        customData: {
          isPremium: premiumFlag,
          password: 'A1' + randomValueHex(12),
        },
      },
      dataType: 'json',
    })
          .then(function(response) {
      var successCode = response.getCode();
      if (successCode === 200 || 201) {
        api.register.create(data, req.session, function(error, data) {
          if (error) {
            return res.redirect('/register?userMessageErr=' + error);
          }
          res.render(
            'pages/linRegistrationCompletion',
                                      {
              registerPage: 'true',
              title: 'CSquire | Register',
            });
        });
      }
    })
    .fail(function(response) {
      res.render('error', {
        message: response.getBody().message,
      });
    });
  }
};


// Email verification create default account
exports.createDefualtUser = function(obj) {
  requestify.request(
    obj.directory.href,
  {
      method: 'GET',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
.then(function(response) {
    if (response.getCode() === 200) {
      var fetchInfo = response.getBody();
      var finaldata = {
        givenName: obj.givenName,
        surname: obj.surname,
        username: obj.username,
        email: obj.email,
        password: 'Admin12345678',
        customData: {
          directory: fetchInfo.name,
        },
      };
      stormpathApplication.createAccount(finaldata,
    function onAccountCreated(err, createdAccount) {
        if (err) {
          // ==console.log('error occured');
          console.log(err);
        } else {
          // ==console.log('default account created successfully');
          console.log('default account created successfully');
        }
      });
    } else {
      // ==console.log('Error Directory data fetching');
      console.log('Error Directory data fetching');
    }
  });
};
// Create a user in stormpath
exports.createUser = function(req, res , next) {
  var data = (req.method === 'POST') ? req.body : req.query;
  var finaldata = {
    givenName: req.body.givenName,
    surname: req.body.surname,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    customData: {
      location: req.body.location,
    },
  };
  stormpathApplication.createAccount(finaldata,
    function onAccountCreated(err, createdAccount) {
    if (err) {
      res.locals.err = err;
      next();
    } else {
      if (_.isArray(req.body.groups)) {
        var emptyFunction = function(
err,
membership) {
        };
        for (var i = 0; i < req.body.groups.length; i++) {
          createdAccount.addToGroup(req.body.groups[i], emptyFunction);
        }
        next();
      } else {
        createdAccount.addToGroup(req.body.groups,
                  function(err, membership) {
        });
        next();
      }
    }
  });
};
// =========Linkedin Authentication=======================//
exports.linkedinAuthenticateUser = function(uname, pwd, req, res, cb) {
  // ==console.log('========= : auth premium : ');
  console.log('========= : auth premium : ');
  var authcRequest = {
    username: uname,
    password: pwd,
  };
  stormpathApplication.authenticateAccount(authcRequest,
  function onAuthcResult(err, result) {
    if (err) {
      // ==console.log('email verification error');
      // ==console.log(err);
      console.log(err);
      res.locals.invalidateError = 'true';
      return cb(res.locals.invalidateError);
    } else {
      res.locals.invalidateError = 'false';
      // ==console.log('successfully verified');
      console.log('successfully verified');
      return result.getAccount(
        function(err2, account) { // This is cached
          // And will execute immediately
          // (no server request):
          groupAddition(authcRequest, req, res, function() {
            if (err) {
            }
            req.session.groupMembership = account.groupMemberships
.href;
            req.session.accountHref = account.href;
            return cb(res.locals.invalidateError);
          });
        });
    }
  });
};
exports.authenticateUser = function(req, res , next) {
  var data = (req.method === 'POST') ? req.body : req.query;
  var authcRequest = {
    username: req.body.username,
    password: req.body.password,
  };
  res.locals.Faileduser = authcRequest.username;
  api.login.create(authcRequest, req.session, function(error, loginData) {
    if (error) {
      return res.render('pages/login',
            {
        error: error.getBody().message,
        Faileduser: res.locals.Faileduser,
        loginPage: 'true',
        errcode: error.code,
        title: 'CSquire | Login',
        hidden: req.query,
      });
    }
    var p = _.find(loginData.group.items, { name: 'admin' });
    // - req.session.isPremium = false;
    (function() {
      req.session.userToken = loginData.token;
      req.session.isPremium = true;
      req.session.customdata = loginData.customdata.apiObjectFilter;
      req.session.user = loginData.account.username;
      req.session.username = loginData.account.givenName + ' ' +
loginData.account.surname;
      req.session.groupMembership = loginData.account.groupMemberships.href;
      req.session.accountHref = loginData.account.href;
      req.session.roles = [];
    })();
    if (loginData.dbuserProfile) {
      (function() {
        var group = _.find(loginData.group.items, function(grp) {
          var nm = grp.description.toLowerCase();
          return nm === 'free' || nm === 'premium' || nm === 'superuser';
        });
        if (!group) {
          return next({ error: 'group not found' });
        }
        var superGroup = _.find(loginData.group.items,
          function(grp) {
          var nm = grp.description.toLowerCase();
          return nm === 'superuser';
        });
        /* - req.session.isPremium =
        group.description.toLowerCase() === 'premium'; */
        (function() {
          req.session.isPremium = true;
          if (superGroup) {
            req.session.roleSuper =
          superGroup.description.toLowerCase();
          }
          req.session.role = group.name?group.name.split('-')[1]:'';
          var jobTitle = loginData.dbuserProfile.jobTitle;
          if (jobTitle) {
            req.session.role = jobTitle.name;
          }
        })();
        req.session.username = loginData.dbuserProfile.name + ' ' +
loginData.dbuserProfile.lastName;
        req.session._id = loginData.dbuserProfile._id;
        req.session.uid = loginData.dbuserProfile.uid;
        req.session.Img = loginData.dbuserProfile.pictureUrl;
        req.session.stormPathUId = _.last(loginData.account.href.split('/'));
        res.cookie('kb', 'true', { domain: '.csquire.com', path: '/' });
      })();
    }
    if (req.session.roleSuper) {
      req.session.manageProfile = loginData.dbuserProfile.uid;
      req.session.manageProfileUid = req.session.manageProfile;
      req.session.manageProfileId = loginData.dbuserProfile._id;
      req.session.manageProfileName = loginData.dbuserProfile.name +
' ' + loginData.dbuserProfile.lastName;
      (function() {
        req.session.isMangingCompProd = false;
        req.session.manageType = 'people';
        req.session.role = req.session.roleSuper;
        res.locals.isMangingCompProd = req.session.isMangingCompProd;
      })();
    }
    if (p) {
      next();
    } else {
      return res.render('pages/login',
            {
        error: 'Please enter valid eamil and password',
        loginPage: 'true',
        title: 'CSquire | Login',
        hidden: req.query,
      });
    }

  });
};
function groupAddition(authcRequest, req, res, callback) {
  console.log('email data : ' + authcRequest.username);
  requestify.request(process.env.STORMPATH_DEFAULT_D + '/accounts?q=' +
authcRequest.username +
  '&orderBy=surname', {
    method: 'GET',
    auth: {
      username: process.env.STORMPATH_API_KEY_ID,
      password: process.env.STORMPATH_API_KEY_SECRET,
    },
  })
.then(function(response) {
    if (response.getCode() === 200 || 201) {
      // ==console.log('email user account sccessfully fetched');
      console.log('email user account sccessfully fetched');
      var _accountHref = response.getBody();
      // =============Get Account membership data ===========
      requestify3.request(_accountHref.items[0].customData.href, {
        method: 'GET',
        auth: {
          username: process.env.STORMPATH_API_KEY_ID,
          password: process.env.STORMPATH_API_KEY_SECRET,
        },
      }).then(function(response) {
        if (response.getCode() === 200 || 201) {
          // ==console.log('fetching account custome data');
          console.log('fetching account custome data');
          var _accountMbershipHref = response.getBody();
          if (_accountMbershipHref.apiObjectFilter === undefined) {
            // ==console.log('Inside the if condition ');
            console.log('Inside the if condition ');
            // ============Get Group membership data =============
            requestify2.request(_accountHref.items[0].groups.href, {
              method: 'GET',
              auth: {
                username: process.env.STORMPATH_API_KEY_ID,
                password: process.env.STORMPATH_API_KEY_SECRET,
              },
            })
.then(function(response) {
              if (response.getCode() === 200 || 201) {
                // ==console.log('group membership sccessfully fetched');
                console.log('group membership sccessfully fetched');
                var _groupmeMbershipHref = response.getBody();
                if (_groupmeMbershipHref.items.length !== 0) {
                  var _nameGroup = _groupmeMbershipHref.items[0].customData;
                  getCustomdata(_nameGroup.href, req, function() {
                    // ==console.log('inside group custom data fetch');
                    var isPremium = _groupmeMbershipHref.items[0].name;
                    if (isPremium.match(/Free.*/)) {
                      req.session.isPremium = true;
                    } else {
                      req.session.isPremium = true;
                    }
                    console.log('inside group custom data fetch');
                    callback();
                  });
                } else {
                  // ==console.log('Its a fake account');
                  console.log('Its a fake account');
                  res.render('error');
                }
              }
            });
// ============Get Group membership data =============
          } else {
            // ==console.log('successfull Response account level');
            // ==console.log(_accountMbershipHref.apiObjectFilter);
            console.log('successfull Response account level');
            console.log(_accountMbershipHref.apiObjectFilter);
            req.session.customdata = _accountMbershipHref.apiObjectFilter;
            // ===console.log('==========REQ SESSION==============');
            console.log('==========REQ SESSION==============');
            callback();
          }
        }
      });
    }
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
      if (customdata.apiObjectFilter) {
        req.session.customdata = customdata.apiObjectFilter;
        // ==console.log('successfull Response');
        // ==console.log(customdata.apiObjectFilter);
        // ==console.log('==========REQ SESSION==============');
        // ==console.log(req.session.customdata);
        console.log('successfull Response');
        console.log(customdata.apiObjectFilter);
        console.log('==========REQ SESSION==============');
        console.log(req.session.customdata);
      }
      cb();
    });
  };
}
exports.sendPasswordResetEmail = function(req, res, next) {
  var data = (req.method === 'POST') ? req.body : req.query;
  var emailData = {
    email: req.body.email,
  };
  // ========Check account disable============= //
  requestify.request(
    process.env.STORMPATH_DEFAULT_D + '/accounts?q=' +
emailData.email +
'&orderBy=surname',
  {
      method: 'GET',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
.then(function(response) {
    var _accountHref = response.getBody();
    if (_accountHref.items.length === 0) {
      res.locals.customErr = 'Email does not exist or not verified';
      next();
    }
    if (response.getCode() === 200 || 201) {
      // ==============REQUESTIFY==================
      requestify2.request(_accountHref.items[0].customData.href,
  {
        method: 'GET',
        auth: {
          username: process.env.STORMPATH_API_KEY_ID,
          password: process.env.STORMPATH_API_KEY_SECRET,
        },
      }).then(function(response) {
        if (response.getCode() === 200 || 201) {
          var _passCustomdata = response.getBody();
          var dirName = 'CSquire_Default_LinkedIn_Directory';
          if (_passCustomdata.directory === dirName) {
            res.locals.customErr = '' +
'This seems to be a linkedin account.' +
'Administer your account from linkedin';
            next();
          } else {
            if (_accountHref.items[0].status === 'ENABLED') {
              stormpathApplication.sendPasswordResetEmail(emailData.email,
          function onEmailSent(err, token) {
                if (err) {
                  res.locals.err = err;
                }
                next();
              });
            } else if (_accountHref.items[0].status === 'DISABLED') {
              res.locals.customErr = '' +
'Password cannot be changed as account is disabled';
              next();
            } else if (_accountHref.items[0].status === 'UNVERIFIED') {
              res.locals.customErr = 'Please verify your account';
              next();
            }
          }
        }
      }, function(err) {
        // ==console.log('Error requestify2');
        console.log(err);
      });
    }
  }, function(err) {
    res.locals.customErr = 'Please enter a valid email id';
    next();
  });
};
exports.getallGroups = function(req, res, next) {
  var groupNames = [];
  client.getAccount(appHref,
    function(err, account) {
    if (account) {
      account.getGroups(function(err, groups) {
        for (var i = 0; i < groups.items.length; i++) {
          groupNames.push({
            name: groups.items[i].name,
            href: groups.items[i].href,
          });
        }
        res.locals.groupNames = groupNames;
        next();
      });
    }
  });
};
exports.logOut = function(req, res , next) {
  res.clearCookie('kb', { domain: '.csquire.com', path: '/' });
  req.session.destroy();
  next();
};
var groupUrl = function(role) {
  var premGroupArray = premGroupArray1.setPremiumGroup(process.env.NODE_ENV);
  // ==var premGroupArray = new PremGroupArray1(process.env.NODE_ENV,
  // == premGroupArray);
  console.log('============== : ' + process.env.NODE_ENV + premGroupArray);
  switch (role) {
    case 'Executive': {
      return premGroupArray.group1;
    }
    case 'Software Engineer/Developer': {
      return premGroupArray.group2;
    }
    case 'Financial/Accounting Professional': {
      return premGroupArray.group3;
    }
    case 'Consultant': {
      console.log('premium array : ' + premGroupArray.group4);
      return premGroupArray.group4;
    }
    case 'IT/IS Professional': {
      return premGroupArray.group5;
    }
    case 'Software Sales/Marketing': {
      return premGroupArray.group6;
    }
  }
  return null;
};
exports.upgrade = function(req, res, next) {
  console.log(' ======= upgrade ======');
  // Get the group membership of an account
  var userUid = {
    uid: req.session._id,
  };
  api.upgrade.create(userUid, req.session, function(error, upgradeData) {
    if (error) {
      return res.render('error');
    }
    req.session.isPremium = true;
    res.redirect('/profile');
  });
};

function randomValueHex(len) {
  return crypto.randomBytes(Math.ceil(len / 2))
.toString('hex')// Convert to hexadecimal format
.slice(0, len); // Return required number of characters
}