const Mysql = require('../mysql/mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('Admin/register-admin', {
      message: 'Passwords do not match',
      successful: false,
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
        return res.render('Admin/register-admin', {
          message: 'That Email has been already in use.',
          successful: false,
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
          return res.render('Admin/register-admin', {
            message: 'User Registered',
            successful: true,
          });
        }
      );
    }
  );
};
