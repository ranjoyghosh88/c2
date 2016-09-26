
exports = module.exports = function(req, res) {
  var userMessage = req.query.userMessage;
  res.render('pages/login', {
    success: userMessage,
    loginPage: 'true',
    title: 'CSquire | Login',
    hidden: req.query,
  });
};
