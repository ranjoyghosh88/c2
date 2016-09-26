
exports = module.exports = function(req, res) {
  res.render('pages/passwordResetUI' , {sptoken: req.query.sptoken,
  title: 'CSquire | Reset Password', resetPage: 'reset',
  noNav: 'true', });
};
