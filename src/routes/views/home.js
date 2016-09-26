
exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  // Locals.section is used to set the currently selected
  // Item in the header navigation.
  locals.home = 'home';
  // === console.log('rendering home')
  // Render the view
  res.render('index', {title: 'CSquire | Home', });
};
