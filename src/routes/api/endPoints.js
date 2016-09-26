var async = require('async');
exports.sendPasswordResetEmail = function(req, res) {
  var data = (req.method === 'POST') ? req.body : req.query;
  if (data.content === 'json') {
    if (res.locals.err) {
      res.send({error: res.locals.err.userMessage });
    } else {
      res.send(
        {
          status: 'OK',
          userMessage: 'A confirmation email' +
          'is sent to your registered account',
        });
    }
  } else {
    if (res.locals.err) {
      res.redirect('/resetPassword?userMessageErr=' +
        res.locals.err.userMessage);
    }else if (res.locals.customErr) {
      res.redirect('/resetPassword?CustomErr=' +
              res.locals.customErr);
    }    else {
      res.render('pages/resetpwdemailconfirmation',
        {
          registerPage: 'true',
          title: 'CSquire | Reset Password',
        }
        );
    }
  }
};
exports.authenticateUser = function(req, res) {
  var data = (req.method === 'POST') ? req.body : req.query;
  if (data.content === 'json') {
    if (res.locals.err) {
      res.send({ error: res.locals.err.userMessage });
    } else {
      res.send({
        status: 'OK',
        userMessage: 'Logged In Successfully',
      });
    }
  } else {
    if (res.locals.err) {
      var temp = 'redirect_uri';
      if (req.body[temp]) {
        req.query[temp] = req.body[temp];
      }
      temp = 'client_id';
      if (req.body[temp]) {
        req.query[temp] = req.body[temp];
      }
      res.render('pages/login',
        {
        error: res.locals.err.userMessage,
        Faileduser: res.locals.Faileduser,
        loginPage: 'true',
        errcode: res.locals.err.code,
        title: 'CSquire | Login',
        hidden: req.query,
      });
    } else {
      (function() {
        var temp = 'redirect_uri';
        var redirectURI = req.body[temp];
        temp = 'client_id';
        var clientId = req.body[temp];
        if (redirectURI && clientId) {
          redirectURI = redirectURI.replace(/&$/, '');
          redirectURI += '&code=' + req.session._id;
          res.redirect(redirectURI);
        } else {
          var redirectUrl = req.body.returnUrl || '/dashboard';
          res.redirect(redirectUrl);
        }
      })();
    }
  }
};
exports.createUser = function(req, res) {
  var data = (req.method === 'POST') ? req.body : req.query;
  if (data.content === 'json')   {
    if (res.locals.err) {
      res.send({error: res.locals.err.userMessage });
    } else {
      res.send(
        {
          status: 'OK',
          userMessage: 'You are successfully registered',
        });
    }
  } else {
    if (res.locals.err) {
      res.redirect('/register?userMessageErr=' + res.locals.err.userMessage);
    } else {
      var string =
      encodeURIComponent(
      'You are successfully registered. Please check your email for next step.'
      );
      res.redirect('/login?userMessage=' + string);
    }
  }
};
exports.logOut = function(req, res) {
  var data = (req.method === 'POST') ? req.body : req.query;
  if (data.content === 'json') {
    res.send(
      {
        status: 'OK',
        userMessage: 'Logged Out Successfully',
      });
  }  else {
    res.redirect('/');
  }
};
exports.getallGroups = function(req, res) {
  res.send(
    {
      status: 'OK',
      groups: res.locals.groupNames,
    });
};
/* ==exports.upgrade = function(req, res) {
  res.send(res);
};*/