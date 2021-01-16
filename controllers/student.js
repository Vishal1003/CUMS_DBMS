exports.getLogin = (req, res, next) => {
  res.render('Student/login', {
    pageTitle: 'Student Login',
    path: '/Student/login',
  });
};
