const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mailgun = require('mailgun-js');
const DOMAIN = process.env.DOMAIN_NAME;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dateStrings: 'date',
  database: 'cumsdbms',
});

// Database query promises
const zeroParamPromise = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const queryParamPromise = (sql, queryParam) => {
  return new Promise((resolve, reject) => {
    db.query(sql, queryParam, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

// LOGIN
exports.getLogin = (req, res, next) => {
  res.render('Staff/login');
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];
  const sql1 = 'SELECT * FROM staff WHERE email = ?';
  const users = await queryParamPromise(sql1, [email]);
  if (
    users.length === 0 ||
    !(await bcrypt.compare(password, users[0].password))
  ) {
    errors.push({ msg: 'Email or Password is Incorrect' });
    res.status(401).render('Staff/login', { errors });
  } else {
    const token = jwt.sign({ id: users[0].st_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect('/staff/dashboard');
  }
};

exports.getDashboard = async (req, res, next) => {
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);
  res.render('Staff/dashboard', { user: data[0], page_name: 'overview' });
};

exports.getProfile = async (req, res, next) => {
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);
  const userDOB = data[0].dob;
  const sql2 = 'SELECT d_name FROM department WHERE dept_id = ?';
  const deptData = await queryParamPromise(sql2, [data[0].dept_id]);

  const sql3 =
    'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id;';
  const classData = await queryParamPromise(sql3, [data[0].st_id]);

  res.render('Staff/profile', {
    user: data[0],
    userDOB,
    deptData,
    classData,
    page_name: 'profile',
  });
};

exports.getTimeTable = async (req, res, next) => {
  const staffData = (
    await queryParamPromise('SELECT * FROM staff WHERE st_id = ?', [req.user])
  )[0];
  const timeTableData = await queryParamPromise(
    'select * from time_table where st_id = ? order by day, start_time',
    [req.user]
  );
  console.log(timeTableData);
  const startTimes = ['10:00', '11:00', '12:00', '13:00'];
  const endTimes = ['11:00', '12:00', '13:00', '14:00'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  res.render('Staff/timetable', {
    page_name: 'timetable',
    timeTableData,
    startTimes,
    staffData,
    endTimes,
    dayNames,
  });
};

exports.getAttendance = async (req, res, next) => {
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);

  const sql3 =
    'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
  const classData = await queryParamPromise(sql3, [data[0].st_id]);

  res.render('Staff/selectClassAttendance', {
    user: data[0],
    classData,
    btnInfo: 'Students List',
    page_name: 'attendance',
  });
};

exports.markAttendance = async (req, res, next) => {
  const { classdata, date } = req.body;
  const regex1 = /[A-Z]+[0-9]+/g;
  const regex2 = /[A-Z]+-[0-9]+/g;

  const c_id = classdata.match(regex1)[0];
  const class_sec = classdata.match(regex2)[0].split('-');
  const staffId = req.user;

  const sql = `
    SELECT * FROM student WHERE dept_id = ? AND section = ?
`;

  let students = await queryParamPromise(sql, [class_sec[0], class_sec[1]]);
  for (student of students) {
    const status = await queryParamPromise(
      'SELECT status FROM attendance WHERE c_id = ? AND s_id = ? AND date = ?',
      [c_id, student.s_id, date]
    );
    if (status.length !== 0) {
      student.status = status[0].status;
    } else {
      student.status = 0;
    }
  }

  return res.render('Staff/attendance', {
    studentData: students,
    courseId: c_id,
    date,
    page_name: 'attendance',
  });
};

exports.postAttendance = async (req, res, next) => {
  const { date, courseId, ...students } = req.body;
  let attedData = await queryParamPromise(
    'SELECT * FROM attendance WHERE date = ? AND c_id = ?',
    [date, courseId]
  );

  if (attedData.length === 0) {
    for (const s_id in students) {
      const isPresent = students[s_id];
      await queryParamPromise('insert into attendance set ?', {
        s_id: s_id,
        date: date,
        c_id: courseId,
        status: isPresent == 'True' ? 1 : 0,
      });
    }
    req.flash('success_msg', 'Attendance done successfully');
    return res.redirect('/staff/student-attendance');
  }

  for (const s_id in students) {
    const isPresent = students[s_id] === 'True' ? 1 : 0;
    await queryParamPromise(
      'update attendance set status = ? WHERE s_id = ? AND date = ? AND c_id = ?',
      [isPresent, s_id, date, courseId]
    );
  }

  req.flash('success_msg', 'Attendance updated successfully');
  return res.redirect('/staff/student-attendance');
};

exports.getStudentReport = async (req, res, next) => {
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);

  const sql3 =
    'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
  const classData = await queryParamPromise(sql3, [data[0].st_id]);

  res.render('Staff/selectClass', {
    user: data[0],
    classData,
    btnInfo: 'Students',
    page_name: 'stu-report',
  });
};

exports.selectClassReport = async (req, res, next) => {
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);

  const sql3 =
    'SELECT cl.class_id, cl.section, cl.semester, cl.c_id, co.name FROM class AS cl, course AS co WHERE st_id = ? AND co.c_id = cl.c_id ORDER BY cl.semester;';
  const classData = await queryParamPromise(sql3, [data[0].st_id]);

  res.render('Staff/selectClassReport', {
    user: data[0],
    classData,
    btnInfo: 'Check Status',
    page_name: 'cls-report',
  });
};

exports.getClassReport = async (req, res, next) => {
  const courseId = req.params.id;
  const staffId = req.user;
  const section = req.query.section;
  const classData = await queryParamPromise(
    'SELECT * FROM class WHERE c_id = ? AND st_id = ? AND section = ?',
    [courseId, staffId, section]
  );
  const sql1 = 'SELECT * FROM staff WHERE st_id = ?';
  const user = req.user;
  const data = await queryParamPromise(sql1, [user]);
  res.render('Staff/getClassReport', {
    user: data[0],
    classData,
    page_name: 'cls-report',
  });
};

exports.getLogout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/staff/login');
};

// FORGOT PASSWORD
exports.getForgotPassword = (req, res, next) => {
  res.render('Staff/forgotPassword');
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).render('Staff/forgotPassword');
  }

  let errors = [];

  const sql1 = 'SELECT * FROM staff WHERE email = ?';
  const results = await queryParamPromise(sql1, [email]);
  if (!results || results.length === 0) {
    errors.push({ msg: 'That email is not registered!' });
    return res.status(401).render('Staff/forgotPassword', {
      errors,
    });
  }

  const token = jwt.sign(
    { _id: results[0].st_id },
    process.env.RESET_PASSWORD_KEY,
    { expiresIn: '20m' }
  );

  const data = {
    from: 'noreplyCMS@mail.com',
    to: email,
    subject: 'Reset Password Link',
    html: `<h2>Please click on given link to reset your password</h2>
                <p><a href="${process.env.URL}/staff/resetpassword/${token}">Reset Password</a></p>
                <hr>
                <p><b>The link will expire in 20m!</b></p>
              `,
  };

  const sql2 = 'UPDATE staff SET resetLink = ? WHERE email = ?';
  db.query(sql2, [token, email], (err, success) => {
    if (err) {
      errors.push({ msg: 'Error In ResetLink' });
      res.render('Staff/forgotPassword', { errors });
    } else {
      mg.messages().send(data, (err, body) => {
        if (err) throw err;
        else {
          req.flash('success_msg', 'Reset Link Sent Successfully!');
          res.redirect('/staff/forgot-password');
        }
      });
    }
  });
};

exports.getResetPassword = (req, res, next) => {
  const resetLink = req.params.id;
  res.render('Staff/resetPassword', { resetLink });
};

exports.resetPassword = (req, res, next) => {
  const { resetLink, password, confirmPass } = req.body;

  let errors = [];

  if (password !== confirmPass) {
    req.flash('error_msg', 'Passwords do not match!');
    res.redirect(`/staff/resetpassword/${resetLink}`);
  } else {
    if (resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, data) => {
        if (err) {
          errors.push({ msg: 'Token Expired!' });
          res.render('Staff/resetPassword', { errors });
        } else {
          const sql1 = 'SELECT * FROM staff WHERE resetLink = ?';
          db.query(sql1, [resetLink], async (err, results) => {
            if (err || results.length === 0) {
              throw err;
            } else {
              let hashed = await bcrypt.hash(password, 8);

              const sql2 = 'UPDATE staff SET password = ? WHERE resetLink = ?';
              db.query(sql2, [hashed, resetLink], (errorData, retData) => {
                if (errorData) {
                  throw errorData;
                } else {
                  req.flash(
                    'success_msg',
                    'Password Changed Successfully! Login Now'
                  );
                  res.redirect('/staff/login');
                }
              });
            }
          });
        }
      });
    } else {
      errors.push({ msg: 'Authentication Error' });
      res.render('Staff/resetPassword', { errors });
    }
  }
};
