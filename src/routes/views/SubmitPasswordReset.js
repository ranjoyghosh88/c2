var api = require('../csquire-api/');
var requestify = require('requestify');
exports = module.exports = function(req, res) {
  var data = (req.method === 'POST') ? req.body : req.query;
  console.log(data.sptoken);
  console.log('-----------' + data.password);
  if (req.query.sptoken === undefined) {
    res.redirect('/login');
  } else {
    requestify.request(
        process.env.STORMPATH_HREF +
     '/passwordResetTokens/' + req.query.sptoken,
    {
      method: 'POST',
      auth: {
        username: process.env.STORMPATH_API_KEY_ID,
        password: process.env.STORMPATH_API_KEY_SECRET,
      },
      body: {
        password: data.password,
      },
    })
.then(function(response) {
  // Get the response body
  response.getBody();
  // Get the response headers
  response.getHeaders();
  // Get specific response header
  response.getHeader('Accept');
  console.log('=======================');
  console.log(response.getCode());
  console.log('=======================');
  api.personalProfile.update(req.session._id,
{ pwdresetdate: response.headers.date },
       req.session, function(err, updatedData) {
    if (err) {
      res.send(err);
    }
    // Get the code
    response.getCode();
    if (response.getCode() === 200) {
      var string = encodeURIComponent(
          'Password updated. Please log on with new password'
      );
      res.redirect('/login?userMessage=' + string);
    } else {
      res.send(response.body);
    }
  });

});
  }
};
