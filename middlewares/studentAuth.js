const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
      if (err) {
        console.log(err);
        req.flash(
          'error_msg',
          'You need to login as STUDENT in order to view that source!'
        );
        res.redirect('/student/login');
      } else {
        req.user = result.id;
        next();
      }
    });
  } else {
    req.flash(
      'error_msg',
      'You need to login as STUDENT in order to view that source!'
    );
    res.redirect('/student/login');
  }
};

const forwardAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
      if (err) {
        console.log(err);
        next();
      } else {
        req.user = result.id;
        res.redirect('/student/dashboard');
      }
    });
  } else {
    next();
  }
};

module.exports = { requireAuth, forwardAuth };
