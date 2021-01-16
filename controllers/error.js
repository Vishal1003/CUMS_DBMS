exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    error: true,
    errorMessage: 'PAGE NOT FOUND 404!',
    pageTitle: 'PAGE NOT FOUND',
    path: '/404',
  });
};
