
var requestify = require('requestify');
var requestify2 = require('requestify');
var requireDir = require('require-dir');
var ProfileData = require('../api/personalProfile/controller');
var Profile = require('../../models/personalProfile');
var util = require('../../models/util');
var errorHandler = null;
var enabledStatus = null;
var routes = {
  api: {
    auth: require('../api/auth'),
  },
};
// Setup Route Bindings
exports = module.exports = function(req, res) {
  // === console.log(req.query.sptoken);
  // === console.log(req.query);
  if (req.query.sptoken === undefined) {
    res.render('login', { });
  }else {
    requestify.request(process.env.STORMPATH_EMAIL_V + req.query.sptoken, {
      method: 'POST',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
.then(function(response) {
  // Get the response body
  response.getBody();
  // Get the response headers
  response.getHeaders();
  // Get specific response header
  response.getHeader('Accept');
  // Get the code
  response.getCode();
  if (response.getCode() === 200) {
    var _findStatus = response.body;
    var statusJson = JSON.parse(_findStatus);
    var strings = JSON.stringify(statusJson);
    var validUrl = statusJson.href;
    requestify2.request(validUrl, {
      method: 'GET',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
    })
.then(function(response) {
  if (response.getCode() === 200) {
    var _findStatus1 = response.body;
    var statusJson1 = JSON.parse(_findStatus1);
    ProfileData.getProfileByEmail(statusJson1.email, function(userData) {
      Profile.update({ _id: userData._id.toString() },
       { accountStatus: util.EnumAccountStatus.ENABLED },
        function(err, res1) {
        res.render('pages/emailverification', {
          registerPage: 'true',
        });
        if (err) {
          console.log(err);
        } else {
          console.log('sucess!!!!!!', res1);
        }
      });
    });
  }else {
    res.send(response.body);
  }
}, function(err) {
  errorHandler = 'error';
  console.log(JSON.stringify(err));
});
  // ===================end requestify for account data=============
  }else {
    res.send(response.body);
  }
}, function(err) {
  errorHandler = 'error';
  console.log(JSON.stringify(err));
  //  === console.log('error handler value : ' + errorHandler);
  res.render('pages/emailverification', {errorHandler: errorHandler,
       registerPage: 'true',
      title: 'CSquire | Reset Password', });
});
  }
};
