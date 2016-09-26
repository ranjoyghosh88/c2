
exports = module.exports = function(req, res) {
  var userMessage = req.query.userMessage;
  res.render('pages/upgrade', {
  title: 'CSquire | upgrade', });
};
