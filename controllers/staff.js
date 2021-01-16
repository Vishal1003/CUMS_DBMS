exports.getLogin = (req, res, next) => {
  res.render('Staff/login', {
    pageTitle: 'Staff Login',
    path: '/Staff/login',
  });
};
