exports.getIndex = (req, res, next) => {
  res.render('index', {
    error: false,
    errorMessage: '',
    pageTitle: 'CUMS LOGIN',
    path: '/',
  });
};
