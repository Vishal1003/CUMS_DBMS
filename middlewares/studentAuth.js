const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dateStrings: 'date',
  database: 'cumsdbms',
});


const selectID = (id) => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT s_name FROM student WHERE s_id = ?';
    db.query(sql1, [id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
}


const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        req.flash(
          'error_msg',
          'You need to login as STUDENT in order to view that source!'
        );
        res.redirect('/student/login');
      } else {
        const data = await selectID(result.id);
        if (data.length === 0) {
          req.flash(
            'error_msg',
            'You need to login as STUDENT in order to view that source!'
          );
          res.redirect('/error');
        }
        else {
          req.user = result.id;
          next();
        }
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
    jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        next();
      } else {
        const data = await selectID(result.id);
        if (data.length === 0) {
          next();
        }
        else {
          req.user = result.id;
          res.redirect('/student/dashboard');
        }
      }
    });
  } else {
    next();
  }
};

module.exports = { requireAuth, forwardAuth };
