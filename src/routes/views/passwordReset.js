exports = module.exports = function(req, res) {
  if (req.query.CustomErr) {
    var CustomErr = req.query.CustomErr;
    res.render('pages/resetPassword',
      {
        CustomErr: CustomErr,
        title: 'CSquire | Reset Password',
      });
  } else {
    var userMessageErr = req.query.userMessageErr;
    res.render('pages/resetPassword',
      {
        error: userMessageErr,
        title: 'CSquire | Reset Password',
      });
  }
};
