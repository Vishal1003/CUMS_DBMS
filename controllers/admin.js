const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'cumsdbms',
});


// ADMIN REGISTER ==> To be commented
exports.getRegister = (req, res, next) => {
  res.render('Admin/register');
};

exports.postRegister = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  let errors = [];

  if (password !== confirmPassword) {
    errors.push({ msg: 'Passwords do not match' });
    return res.render('Admin/register', { errors });
  }
  db.query(
    'SELECT EMAIL FROM ADMIN WHERE EMAIL = ?',
    [email],
    async (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        errors.push({ msg: 'That email is already in use' });
        return res.render('Admin/register', { errors });
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
          req.flash('success_msg', 'You are now registered and can log in');
          return res.redirect('/admin/login');
        }
      );
    }
  );
};

exports.getLogin = (req, res, next) => {
  res.render('Admin/login');
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let errors = [];

    if (!email || !password) {
      errors.push({ msg: 'Please enter all fields' });
      return res.status(400).render('Admin/login', { errors });
    }

    let sql3 = 'SELECT * FROM admin WHERE email = ?';
    db.query(sql3, [email], async (err, results) => {

      if (!results || !(await bcrypt.compare(password, results[0].passwrd))) {
        console.log("Email or Password is Incorrect");
        errors.push({ msg: 'Email or Password is Incorrect' });
        res.status(401).render('Admin/login', { errors });
      }

      else {
        const user = results[0];
        const token = jwt.sign({ id: user.personId }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE
        });

        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/admin/dashboard');
      }
    });

  } catch (err) {
    throw err;
  }
}

exports.getDashboard = (req, res, next) => {
  let sql4 = 'SELECT * FROM admin WHERE personId = ?';
  db.query(sql4, [req.user], (err, result) => {
    if (err)
      throw err;
    res.render('Admin/dashboard', { user: result[0] });
  });
}

exports.getLogout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
};


exports.getAddStaff = (req, res, next) => {
  res.render('Admin/Staff/addStaff');
};

exports.getAddClass = (req, res, next) => {
  res.render('Admin/Class/addClass');
};

exports.getAddStudent = (req, res, next) => {
  res.render('Admin/Student/addStudent');
};

exports.getAddDept = (req, res, next) => {
  res.render('Admin/Department/addDept');
};

exports.getAddCourse = (req, res, next) => {
  res.render('Admin/Course/addCourse');
};





