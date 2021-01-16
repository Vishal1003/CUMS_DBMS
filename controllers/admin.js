const Mysql = require('../database/mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('Admin/login', {
    pageTitle: 'ADMIN LOGIN',
    path: '/Admin/login',
  });
};

exports.getRegister = (req, res, next) => {
  res.render('Admin/register', {
    error: false,
    errorMessage: '',
    pageTitle: 'ADMIN REGISTER',
    path: '/Admin/register',
  });
};

exports.postRegister = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('Admin/register', {
      error: true,
      errorMessage: 'Passwords do not match',
      pageTitle: 'REGISTER ADMIN',
      path: '/Admin/register',
    });
  }
  const db = Mysql.connect();
  db.query(
    'SELECT EMAIL FROM ADMIN WHERE EMAIL = ?',
    [email],
    async (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        return res.render('Admin/register', {
          error: true,
          errorMessage: 'That email is already in use',
          pageTitle: 'REGISTER ADMIN',
          path: '/Admin/register',
        });
      }
      let hashedPassword = await bcrypt.hash(password, 8);
      db.query(
        'INSERT INTO ADMIN SET ?',
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          passwrd: hashedPassword,
        },
        async (error, results) => {
          if (error) {
            throw error;
          }
          return res.render('Admin/login', {
            pageTitle: 'ADMIN LOGIN',
            path: '/Admin/login',
          });
        }
      );
    }
  );
};
