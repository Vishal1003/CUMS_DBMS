"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var mysql = require('mysql');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var mailgun = require('mailgun-js');

var DOMAIN = process.env.DOMAIN_NAME;
var mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: DOMAIN
});
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'cumsdbms'
}); // Database query promises

var zeroParamPromise = function zeroParamPromise(sql) {
  return new Promise(function (resolve, reject) {
    db.query(sql, function (err, results) {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

var queryParamPromise = function queryParamPromise(sql, queryParam) {
  return new Promise(function (resolve, reject) {
    db.query(sql, queryParam, function (err, results) {
      if (err) return reject(err);
      return resolve(results);
    });
  });
}; // LOGIN


exports.getLogin = function (req, res, next) {
  res.render('Staff/login');
};

exports.postLogin = function _callee(req, res, next) {
  var _req$body, email, password, errors, sql1, users, token;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password;
          errors = [];
          sql1 = 'SELECT * FROM staff WHERE email = ?';
          _context.next = 5;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [email]));

        case 5:
          users = _context.sent;
          _context.t0 = users.length === 0;

          if (_context.t0) {
            _context.next = 11;
            break;
          }

          _context.next = 10;
          return regeneratorRuntime.awrap(bcrypt.compare(password, users[0].password));

        case 10:
          _context.t0 = !_context.sent;

        case 11:
          if (!_context.t0) {
            _context.next = 16;
            break;
          }

          errors.push({
            msg: 'Email or Password is Incorrect'
          });
          res.status(401).render('Staff/login', {
            errors: errors
          });
          _context.next = 19;
          break;

        case 16:
          token = jwt.sign({
            id: users[0].st_id
          }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
          });
          res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
          });
          res.redirect('/staff/dashboard');

        case 19:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.getDashboard = function _callee2(req, res, next) {
  var sql1, user, data;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context2.next = 4;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 4:
          data = _context2.sent;
          res.render('Staff/dashboard', {
            user: data[0],
            page_name: 'overview'
          });

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.getProfile = function _callee3(req, res, next) {
  var sql1, user, data, DOB, userDOB, sql2, deptData, sql3, classData;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context3.next = 4;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 4:
          data = _context3.sent;
          DOB = data[0].dob + '';
          userDOB = DOB.split(' ')[2] + ' ' + DOB.split(' ')[1] + ' ' + DOB.split(' ')[3];
          sql2 = 'SELECT d_name FROM department WHERE dept_id = ?';
          _context3.next = 10;
          return regeneratorRuntime.awrap(queryParamPromise(sql2, [data[0].dept_id]));

        case 10:
          deptData = _context3.sent;
          sql3 = 'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id;';
          _context3.next = 14;
          return regeneratorRuntime.awrap(queryParamPromise(sql3, [data[0].st_id]));

        case 14:
          classData = _context3.sent;
          res.render('Staff/profile', {
            user: data[0],
            userDOB: userDOB,
            deptData: deptData,
            classData: classData,
            page_name: 'profile'
          });

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.getAttendance = function _callee4(req, res, next) {
  var sql1, user, data, sql3, classData;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context4.next = 4;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 4:
          data = _context4.sent;
          sql3 = 'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
          _context4.next = 8;
          return regeneratorRuntime.awrap(queryParamPromise(sql3, [data[0].st_id]));

        case 8:
          classData = _context4.sent;
          res.render('Staff/selectClassAttendance', {
            user: data[0],
            classData: classData,
            btnInfo: 'Students List',
            page_name: 'attendance'
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.markAttendance = function _callee5(req, res, next) {
  var _req$body2, classdata, date, regex1, regex2, c_id, class_sec, staffId, sql, students, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, status;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$body2 = req.body, classdata = _req$body2.classdata, date = _req$body2.date;
          regex1 = /[A-Z]+[0-9]+/g;
          regex2 = /[A-Z]+-[0-9]+/g;
          c_id = classdata.match(regex1)[0];
          class_sec = classdata.match(regex2)[0].split('-');
          staffId = req.user;
          sql = "\n    SELECT * FROM student WHERE dept_id = ? AND section = ?\n";
          _context5.next = 9;
          return regeneratorRuntime.awrap(queryParamPromise(sql, [class_sec[0], class_sec[1]]));

        case 9:
          students = _context5.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 13;
          _iterator = students[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 24;
            break;
          }

          student = _step.value;
          _context5.next = 19;
          return regeneratorRuntime.awrap(queryParamPromise('SELECT status FROM attendance WHERE c_id = ? AND s_id = ? AND date = ?', [c_id, student.s_id, date]));

        case 19:
          status = _context5.sent;

          if (status.length !== 0) {
            student.status = status[0].status;
          } else {
            student.status = 0;
          }

        case 21:
          _iteratorNormalCompletion = true;
          _context5.next = 15;
          break;

        case 24:
          _context5.next = 30;
          break;

        case 26:
          _context5.prev = 26;
          _context5.t0 = _context5["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context5.t0;

        case 30:
          _context5.prev = 30;
          _context5.prev = 31;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 33:
          _context5.prev = 33;

          if (!_didIteratorError) {
            _context5.next = 36;
            break;
          }

          throw _iteratorError;

        case 36:
          return _context5.finish(33);

        case 37:
          return _context5.finish(30);

        case 38:
          return _context5.abrupt("return", res.render('Staff/attendance', {
            studentData: students,
            courseId: c_id,
            date: date,
            page_name: 'attendance'
          }));

        case 39:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[13, 26, 30, 38], [31,, 33, 37]]);
};

exports.postAttendance = function _callee6(req, res, next) {
  var _req$body3, date, courseId, students, attedData, s_id, isPresent, _s_id, _isPresent;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$body3 = req.body, date = _req$body3.date, courseId = _req$body3.courseId, students = _objectWithoutProperties(_req$body3, ["date", "courseId"]);
          _context6.next = 3;
          return regeneratorRuntime.awrap(queryParamPromise('SELECT * FROM attendance WHERE date = ? AND c_id = ?', [date, courseId]));

        case 3:
          attedData = _context6.sent;

          if (!(attedData.length === 0)) {
            _context6.next = 15;
            break;
          }

          _context6.t0 = regeneratorRuntime.keys(students);

        case 6:
          if ((_context6.t1 = _context6.t0()).done) {
            _context6.next = 13;
            break;
          }

          s_id = _context6.t1.value;
          isPresent = students[s_id];
          _context6.next = 11;
          return regeneratorRuntime.awrap(queryParamPromise('insert into attendance set ?', {
            s_id: s_id,
            date: date,
            c_id: courseId,
            status: isPresent == 'True' ? 1 : 0
          }));

        case 11:
          _context6.next = 6;
          break;

        case 13:
          req.flash('success_msg', 'Attendance done successfully');
          return _context6.abrupt("return", res.redirect('/staff/student-attendance'));

        case 15:
          _context6.t2 = regeneratorRuntime.keys(students);

        case 16:
          if ((_context6.t3 = _context6.t2()).done) {
            _context6.next = 23;
            break;
          }

          _s_id = _context6.t3.value;
          _isPresent = students[_s_id] === 'True' ? 1 : 0;
          _context6.next = 21;
          return regeneratorRuntime.awrap(queryParamPromise('update attendance set status = ? WHERE s_id = ? AND date = ? AND c_id = ?', [_isPresent, _s_id, date, courseId]));

        case 21:
          _context6.next = 16;
          break;

        case 23:
          req.flash('success_msg', 'Attendance updated successfully');
          return _context6.abrupt("return", res.redirect('/staff/student-attendance'));

        case 25:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.getStudentReport = function _callee7(req, res, next) {
  var sql1, user, data, sql3, classData;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context7.next = 4;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 4:
          data = _context7.sent;
          sql3 = 'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
          _context7.next = 8;
          return regeneratorRuntime.awrap(queryParamPromise(sql3, [data[0].st_id]));

        case 8:
          classData = _context7.sent;
          res.render('Staff/selectClass', {
            user: data[0],
            classData: classData,
            btnInfo: 'Students',
            page_name: 'stu-report'
          });

        case 10:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.selectClassReport = function _callee8(req, res, next) {
  var sql1, user, data, sql3, classData;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context8.next = 4;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 4:
          data = _context8.sent;
          sql3 = 'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
          _context8.next = 8;
          return regeneratorRuntime.awrap(queryParamPromise(sql3, [data[0].st_id]));

        case 8:
          classData = _context8.sent;
          res.render('Staff/selectClassReport', {
            user: data[0],
            classData: classData,
            btnInfo: 'Check Status',
            page_name: 'cls-report'
          });

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.getClassReport = function _callee9(req, res, next) {
  var courseId, staffId, section, classData, sql1, user, data;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          courseId = req.params.id;
          staffId = req.user;
          section = req.query.section;
          _context9.next = 5;
          return regeneratorRuntime.awrap(queryParamPromise('SELECT * FROM class WHERE c_id = ? AND st_id = ? AND section = ?', [courseId, staffId, section]));

        case 5:
          classData = _context9.sent;
          sql1 = 'SELECT * FROM staff WHERE st_id = ?';
          user = req.user;
          _context9.next = 10;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [user]));

        case 10:
          data = _context9.sent;
          res.render('Staff/getClassReport', {
            user: data[0],
            classData: classData,
            page_name: 'cls-report'
          });

        case 12:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.getLogout = function (req, res, next) {
  res.cookie('jwt', '', {
    maxAge: 1
  });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/staff/login');
}; // FORGOT PASSWORD


exports.getForgotPassword = function (req, res, next) {
  res.render('Staff/forgotPassword');
};

exports.forgotPassword = function _callee10(req, res, next) {
  var email, errors, sql1, results, token, data, sql2;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          email = req.body.email;

          if (email) {
            _context10.next = 3;
            break;
          }

          return _context10.abrupt("return", res.status(400).render('Staff/forgotPassword'));

        case 3:
          errors = [];
          sql1 = 'SELECT * FROM staff WHERE email = ?';
          _context10.next = 7;
          return regeneratorRuntime.awrap(queryParamPromise(sql1, [email]));

        case 7:
          results = _context10.sent;

          if (!results || results.length === 0) {
            errors.push({
              msg: 'That email is not registered!'
            });
            res.status(401).render('Staff/forgotPassword', {
              errors: errors
            });
          }

          token = jwt.sign({
            _id: results[0].st_id
          }, process.env.RESET_PASSWORD_KEY, {
            expiresIn: '20m'
          });
          data = {
            from: 'noreplyCMS@mail.com',
            to: email,
            subject: 'Reset Password Link',
            html: "<h2>Please click on given link to reset your password</h2>\n                <p><a href=\"".concat(process.env.URL, "/staff/resetpassword/").concat(token, "\">Reset Password</a></p>\n                <hr>\n                <p><b>The link will expire in 20m!</b></p>\n              ")
          };
          sql2 = 'UPDATE staff SET resetLink = ? WHERE email = ?';
          db.query(sql2, [token, email], function (err, success) {
            if (err) {
              errors.push({
                msg: 'Error In ResetLink'
              });
              res.render('Staff/forgotPassword', {
                errors: errors
              });
            } else {
              mg.messages().send(data, function (err, body) {
                if (err) throw err;else {
                  req.flash('success_msg', 'Reset Link Sent Successfully!');
                  res.redirect('/staff/forgot-password');
                }
              });
            }
          });

        case 13:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.getResetPassword = function (req, res, next) {
  var resetLink = req.params.id;
  res.render('Staff/resetPassword', {
    resetLink: resetLink
  });
};

exports.resetPassword = function (req, res, next) {
  var _req$body4 = req.body,
      resetLink = _req$body4.resetLink,
      password = _req$body4.password,
      confirmPass = _req$body4.confirmPass;
  var errors = [];

  if (password !== confirmPass) {
    req.flash('error_msg', 'Passwords do not match!');
    res.redirect("/staff/resetpassword/".concat(resetLink));
  } else {
    if (resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, data) {
        if (err) {
          errors.push({
            msg: 'Token Expired!'
          });
          res.render('Staff/resetPassword', {
            errors: errors
          });
        } else {
          var sql1 = 'SELECT * FROM staff WHERE resetLink = ?';
          db.query(sql1, [resetLink], function _callee11(err, results) {
            var hashed, sql2;
            return regeneratorRuntime.async(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    if (!(err || results.length === 0)) {
                      _context11.next = 4;
                      break;
                    }

                    throw err;

                  case 4:
                    _context11.next = 6;
                    return regeneratorRuntime.awrap(bcrypt.hash(password, 8));

                  case 6:
                    hashed = _context11.sent;
                    sql2 = 'UPDATE staff SET password = ? WHERE resetLink = ?';
                    db.query(sql2, [hashed, resetLink], function (errorData, retData) {
                      if (errorData) {
                        throw errorData;
                      } else {
                        req.flash('success_msg', 'Password Changed Successfully! Login Now');
                        res.redirect('/staff/login');
                      }
                    });

                  case 9:
                  case "end":
                    return _context11.stop();
                }
              }
            });
          });
        }
      });
    } else {
      errors.push({
        msg: 'Authentication Error'
      });
      res.render('Staff/resetPassword', {
        errors: errors
      });
    }
  }
};