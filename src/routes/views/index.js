
exports = module.exports = function(req, res) {
  var locals = res.locals;
  // Locals.section is used to set the currently selected
  // Item in the header navigation.
  locals.section = 'home';
  console.log('rendering home');
  // Render the view
  res.render('pages/home-new',
  { activePage: 'home', title: 'CSquire | Home', });
};
