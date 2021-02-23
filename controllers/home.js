exports.getIndex = (req, res, next) => {
  res.render('index');
};

exports.getLanding = (req, res, next) => {
  res.render('landing');
}

exports.getError403 = (req, res, next) => {
  res.render('error403');
}

exports.getError404 = (req, res, next) => {
  res.render('error404');
}
