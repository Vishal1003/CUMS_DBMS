const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid').v4;
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

// Students limit per section
const SECTION_LIMIT = 20;

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

// Hash password
const hashing = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 8, function (err, hashedPassword) {
      if (err) return reject(err);
      return resolve(hashedPassword);
    });
  });
};

// 1. ADMIN
// 1.1 Login
exports.getLogin = (req, res, next) => {
  res.render('Admin/login');
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];
  const sql1 = 'SELECT * FROM admin WHERE email = ?';
  const users = await queryParamPromise(sql1, [email]);
  if (
    users.length === 0 ||
    !(await bcrypt.compare(password, users[0].password))
  ) {
    errors.push({ msg: 'Email or Password is Incorrect' });
    res.status(401).render('Admin/login', { errors });
  } else {
    const token = jwt.sign({ id: users[0].admin_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect('/admin/dashboard');
  }
};

// 1.2 Register
// ADMIN REGISTER ==> To be commented
exports.getRegister = (req, res, next) => {
  res.render('Admin/register');
};

exports.postRegister = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  let errors = [];
  if (password !== confirmPassword) {
    errors.push({ msg: 'Passwords do not match' });
    return res.render('Admin/register', { errors });
  } else {
    const sql1 = 'select count(*) as `count` from admin where email = ?';
    const count = (await queryParamPromise(sql1, [email]))[0].count;
    if (count !== 0) {
      errors.push({ msg: 'That email is already in use' });
      return res.render('Admin/register', { errors });
    } else {
      const hashedPassword = await bcrypt.hash(password, 8);
      const sql2 = 'INSERT INTO ADMIN SET ?';
      await queryParamPromise(sql2, {
        admin_id: uuidv4(),
        name: name,
        email: email,
        password: hashedPassword,
      });
      req.flash('success_msg', 'You are now registered and can log in');
      return res.redirect('/admin/login');
    }
  }
};

// 1.3 Dashboard
exports.getDashboard = async (req, res, next) => {
  const sql = 'SELECT * FROM admin WHERE admin_id = ?';
  const user = (await queryParamPromise(sql, [req.user]))[0];
  res.render('Admin/dashboard', { user: user, page_name: 'overview' });
};

// 1.4 Logout
exports.getLogout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
};

// 1.5 Profile
exports.getProfile = async (req, res, next) => {
  const sql = 'SELECT * FROM admin WHERE admin_id = ?';
  const user = (await queryParamPromise(sql, [req.user]))[0];
  const students = await zeroParamPromise('SELECT * FROM student');
  const staffs = await zeroParamPromise('SELECT * FROM staff');
  const departments = await zeroParamPromise('SELECT * FROM department');
  const courses = await zeroParamPromise('SELECT * FROM course');
  const classes = await zeroParamPromise('SELECT * FROM class');
  res.render('Admin/profile', {
    user,
    students,
    staffs,
    departments,
    courses,
    classes,
    page_name: 'profile',
  });
};

// 1.6 Forgot Password
exports.getForgotPassword = (req, res, next) => {
  res.render('Admin/forgotPassword');
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).render('Admin/forgotPassword');
  }

  let errors = [];

  const sql1 = 'SELECT * from admin WHERE email = ?';
  const results = await queryParamPromise(sql1, [email]);
  if (!results || results.length === 0) {
    errors.push({ msg: 'That email is not registered!' });
    res.status(401).render('Admin/forgotPassword', {
      errors,
    });
  }

  const token = jwt.sign(
    { _id: results[0].admin_id },
    process.env.RESET_PASSWORD_KEY,
    { expiresIn: '20m' }
  );

  const data = {
    from: 'noreplyCMS@mail.com',
    to: email,
    subject: 'Reset Password Link',
    html: `<h2>Please click on given link to reset your password</h2>
                <p><a href="${process.env.URL}/admin/resetpassword/${token}">Reset Password</a></p>
                <hr>
                <p><b>The link will expire in 20m!</b></p>
              `,
  };

  const sql2 = 'UPDATE admin SET resetLink = ? WHERE email = ?';
  db.query(sql2, [token, email], (err, success) => {
    if (err) {
      errors.push({ msg: 'Error In ResetLink' });
      res.render('Admin/forgotPassword', { errors });
    } else {
      mg.messages().send(data, (err, body) => {
        if (err) throw err;
        else {
          req.flash('success_msg', 'Reset Link Sent Successfully!');
          res.redirect('/admin/forgot-password');
        }
      });
    }
  });
};

// 1.7 Reset Password
exports.getResetPassword = (req, res, next) => {
  const resetLink = req.params.id;
  res.render('Admin/resetPassword', { resetLink });
};

exports.resetPassword = (req, res, next) => {
  const { resetLink, password, confirmPass } = req.body;

  let errors = [];

  if (password !== confirmPass) {
    req.flash('error_msg', 'Passwords do not match!');
    res.redirect(`/admin/resetpassword/${resetLink}`);
  } else {
    if (resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, data) => {
        if (err) {
          errors.push({ msg: 'Token Expired!' });
          res.render('Admin/resetPassword', { errors });
        } else {
          const sql1 = 'SELECT * FROM admin WHERE resetLink = ?';
          db.query(sql1, [resetLink], async (err, results) => {
            if (err || results.length === 0) {
              throw err;
            } else {
              let hashed = await bcrypt.hash(password, 8);

              const sql2 = 'UPDATE admin SET password = ? WHERE resetLink = ?';
              db.query(sql2, [hashed, resetLink], (errorData, retData) => {
                if (errorData) {
                  throw errorData;
                } else {
                  req.flash(
                    'success_msg',
                    'Password Changed Successfully! Login Now'
                  );
                  res.redirect('/admin/login');
                }
              });
            }
          });
        }
      });
    } else {
      errors.push({ msg: 'Authentication Error' });
      res.render('Admin/resetPassword', { errors });
    }
  }
};

// 1.8 Settings
exports.getInfoSettings = async (req, res, next) => {
  const sql = 'SELECT * FROM admin WHERE admin_id = ?';
  const user = (await queryParamPromise(sql, [req.user]))[0];
  return res.render('Admin/infoSettings', {
    user: user,
    page_name: 'settings',
  });
};

exports.postInfoSettings = async (req, res, next) => {
  const { old_email, email, name, password } = req.body;
  const sql1 = 'SELECT * FROM admin WHERE email = ?';
  const user = (await queryParamPromise(sql1, [old_email]))[0];
  if (!(await bcrypt.compare(password, user.password))) {
    req.flash('error_msg', 'Incorrect password');
    return res.redirect('/admin/info_settings');
  } else {
    const sql2 = 'update admin set name = ?,email = ? where email = ?';
    await queryParamPromise(sql2, [name, email, old_email]);
    req.flash('success_msg', 'Information Updated Successfully');
    return res.redirect('/admin/info_settings');
  }
};

exports.getPasswordSettings = async (req, res, next) => {
  return res.render('Admin/passwordSettings', {
    page_name: 'settings',
  });
};

exports.postPasswordSettings = async (req, res, next) => {
  const { old_password, new_password, confirm_new_password } = req.body;
  if (new_password !== confirm_new_password) {
    req.flash('error_msg', 'Passwords does not match');
    return res.redirect('/admin/password_settings');
  }
  const sql1 = 'SELECT * FROM admin WHERE admin_id = ?';
  const user = (await queryParamPromise(sql1, [req.user]))[0];
  if (!(await bcrypt.compare(old_password, user.password))) {
    req.flash('error_msg', 'Incorrect password');
    return res.redirect('/admin/password_settings');
  } else {
    const hashedPassword = await hashing(new_password);
    const sql2 = 'update admin set password = ? where admin_id = ?';
    await queryParamPromise(sql2, [hashedPassword, req.user]);
    req.flash('success_msg', 'Password Changed Successfully');
    return res.redirect('/admin/password_settings');
  }
};

// 2. STAFFS
// 2.1 Add staff
exports.getAddStaff = async (req, res, next) => {
  const sql = 'SELECT dept_id from department';
  const results = await zeroParamPromise(sql);
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Staff/addStaff', {
    departments: departments,
    page_name: 'staff',
  });
};

exports.postAddStaff = async (req, res, next) => {
  const { email } = req.body;
  const sql1 = 'SELECT count(*) as `count` from staff where email = ?';
  const count = (await queryParamPromise(sql1, [email]))[0].count;
  if (count !== 0) {
    req.flash('error', 'Staff with that email already exists');
    res.redirect('/admin/addStaff');
  } else {
    const {
      dob,
      name,
      gender,
      department,
      address,
      city,
      postalCode,
      contact,
    } = req.body;

    if (contact.length > 11) {
      req.flash('error', 'Enter a valid phone number');
      return res.redirect('/admin/addStaff');
    }

    const password = dob.toString().split('-').join('');
    const hashedPassword = await bcrypt.hash(password, 8);

    const sql2 = 'INSERT INTO staff SET ?';
    await queryParamPromise(sql2, {
      st_id: uuidv4(),
      st_name: name,
      gender: gender,
      dob: dob,
      email: email,
      st_address: address + '-' + city + '-' + postalCode,
      contact: contact,
      dept_id: department,
      password: hashedPassword,
    });
    req.flash('success_msg', 'Staff added successfully');
    res.redirect('/admin/getAllStaffs');
  }
};
// 2.2 Get staffs on query
exports.getRelevantStaff = async (req, res, next) => {
  const sql = 'SELECT dept_id from department';
  const results = await zeroParamPromise(sql);
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Staff/selectStaff', {
    departments: departments,
    page_name: 'staff',
  });
};

exports.postRelevantStaff = async (req, res, next) => {
  const { section, department } = req.body;
  if (department === 'None' && section !== '') {
    req.flash('error', 'Please select department for the given section');
    res.redirect('/admin/getStaff');
  } else if (section !== '') {
    const sql1 =
      'select max(section) as `max_section` from student where dept_id = ?';
    const max_section = (await queryParamPromise(sql1, [department]))[0]
      .max_section;
    if (max_section !== null && section <= max_section) {
      // All teachers from given section and department
      const sql2 = 'select c_id from course where dept_id = ?';
      let course_ids = await queryParamPromise(sql2, [department]);
      if (course_ids.length === 0) {
        return res.render('Admin/Staff/getStaff', {
          data: [],
          page_name: 'staff',
        });
      }
      const courses = [];
      for (const course_id of course_ids) {
        courses.push(course_id.c_id);
      }
      const sql3 = 'select st_id from class where section = ? and c_id in (?)';
      const staff_ids = await queryParamPromise(sql3, [section, courses]);
      if (staff_ids.length === 0) {
        return res.render('Admin/Staff/getStaff', {
          data: [],
          page_name: 'staff',
        });
      }
      const staffs = [];
      for (const staff_id of staff_ids) {
        staffs.push(staff_id.st_id);
      }
      const sql4 = 'select * from staff where st_id in (?)';
      const results = await queryParamPromise(sql4, [staffs]);
      return res.render('Admin/Staff/getStaff', {
        data: results,
        page_name: 'staff',
      });
    } else {
      // section for the given department does not exist
      req.flash('error', 'Section for the given department does not exist');
      res.redirect('/admin/getStaff');
    }
  } else if (department !== 'None') {
    // All teachers from particular department
    const sql = 'select * from staff where dept_id = ?';
    const results = await queryParamPromise(sql, [department]);
    return res.render('Admin/Staff/getStaff', {
      data: results,
      page_name: 'staff',
    });
  } else {
    return res.redirect('/admin/getAllStaffs');
  }
};

// 2.3 Get all staffs
exports.getAllStaff = async (req, res, next) => {
  const sql = 'SELECT * FROM staff';
  const results = await zeroParamPromise(sql);
  res.render('Admin/Staff/getStaff', { data: results, page_name: 'staff' });
};

// 2.4 Modify existing staffs
exports.getStaffSettings = async (req, res, next) => {
  const staffEmail = req.params.id;
  const sql1 = 'SELECT * FROM staff WHERE email = ?';
  const staffData = await queryParamPromise(sql1, [staffEmail]);
  const address = staffData[0].st_address.split('-');
  staffData[0].address = address;
  const results = await zeroParamPromise('SELECT * from department');
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Staff/setStaff', {
    staffData: staffData,
    departments: departments,
    page_name: 'Staff Settings',
  });
};
exports.postStaffSettings = async (req, res, next) => {
  const {
    old_email,
    email,
    dob,
    name,
    gender,
    department,
    address,
    city,
    postalCode,
    contact,
  } = req.body;

  const password = dob.toString().split('-').join('');
  const hashedPassword = await hashing(password);

  const sql =
    'update staff set st_name=?, gender=?, dob=?, email=?, st_address=?, contact=?, password=?, dept_id=? where email=?';
  await queryParamPromise(sql, [
    name,
    gender,
    dob,
    email,
    address + '-' + city + '-' + postalCode,
    contact,
    hashedPassword,
    department,
    old_email,
  ]);
  req.flash('success_msg', 'Staff added successfully');
  res.redirect('/admin/getStaff');
};

// 3. STUDENTS
// 3.1 Add student
exports.getAddStudent = async (req, res, next) => {
  const sql = 'SELECT * from department';
  const results = await zeroParamPromise(sql);
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Student/addStudent', {
    page_name: 'students',
    departments: departments,
  });
};
exports.postAddStudent = async (req, res, next) => {
  const {
    email,
    dob,
    name,
    gender,
    department,
    address,
    city,
    postalCode,
    contact,
  } = req.body;
  const password = dob.toString().split('-').join('');
  const hashedPassword = await hashing(password);
  const sql1 =
    'select count(*) as `count`, section from student where section = (select max(section) from student where dept_id = ?) AND dept_id = ?';
  const results = await queryParamPromise(sql1, [department, department]);
  let section = 1;
  if (results[0].count !== 0) {
    if (results[0].count == SECTION_LIMIT) {
      section = results[0].section + 1;
    } else {
      section = results[0].section;
    }
  }
  const sql2 = 'INSERT INTO STUDENT SET ?';
  await queryParamPromise(sql2, {
    s_id: uuidv4(),
    s_name: name,
    gender: gender,
    dob: dob,
    email: email,
    s_address: address + '-' + city + '-' + postalCode,
    contact: contact,
    password: hashedPassword,
    section: section,
    dept_id: department,
  });
  req.flash('success_msg', 'Student added successfully');
  res.redirect('/admin/getAllStudents');
};

// 3.2 Get students on query
exports.getRelevantStudent = async (req, res, next) => {
  const sql = 'SELECT * from department';
  const results = await zeroParamPromise(sql);
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Student/deptSelect', {
    departments: departments,
    page_name: 'students',
  });
};

exports.postRelevantStudent = async (req, res, next) => {
  let { section, department } = req.body;
  if (!section && department === 'None') {
    const results = await zeroParamPromise('SELECT * FROM student');
    res.render('Admin/Student/getStudent', {
      data: results,
      page_name: 'students',
    });
  } else if (!section) {
    const sql = 'SELECT * FROM student WHERE dept_id = ?';
    const results = await queryParamPromise(sql, [department]);
    res.render('Admin/Student/getStudent', {
      data: results,
      page_name: 'students',
    });
  } else if (department === 'None') {
    const sql = 'SELECT * FROM student WHERE section = ?';
    const results = await queryParamPromise(sql, [section]);
    res.render('Admin/Student/getStudent', {
      data: results,
      page_name: 'students',
    });
  } else if (section && department !== 'None') {
    const sql =
      'SELECT * FROM student WHERE section = ? AND dept_id = ? GROUP BY s_id';
    const results = await queryParamPromise(sql, [section, department]);
    res.render('Admin/Student/getStudent', {
      data: results,
      page_name: 'students',
    });
  }
};

// 3.3 Get all students
exports.getAllStudent = async (req, res, next) => {
  const sql = 'SELECT * from student';
  const results = await zeroParamPromise(sql);
  res.render('Admin/Student/getStudent', {
    data: results,
    page_name: 'students',
  });
};

// 3.4 Modify existing students
exports.getStudentSettings = async (req, res, next) => {
  const studentEmail = req.params.id;
  const sql1 = 'SELECT * FROM STUDENT WHERE email = ?';
  const studentData = await queryParamPromise(sql1, [studentEmail]);
  const address = studentData[0].s_address.split('-');
  studentData[0].address = address;
  const results = await zeroParamPromise('SELECT * from department');
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Student/setStudent', {
    studentData: studentData,
    departments: departments,
    page_name: 'students',
  });
};

exports.postStudentSettings = async (req, res, next) => {
  const {
    old_email,
    email,
    dob,
    name,
    gender,
    department,
    address,
    city,
    postalCode,
    contact,
  } = req.body;
  const password = dob.toString().split('-').join('');
  const hashedPassword = await hashing(password);
  const sql1 =
    'select count(*) as `count`, section from student where section = (select max(section) from student where dept_id = ?) AND dept_id = ?';
  const results = await queryParamPromise(sql1, [department, department]);
  let section = 1;
  if (results[0].count !== 0) {
    if (results[0].count == SECTION_LIMIT) {
      section = results[0].section + 1;
    } else {
      section = results[0].section;
    }
  }
  const sql2 =
    'UPDATE STUDENT SET s_name = ?, gender = ?, dob = ?,email = ?, s_address = ?, contact = ?, password = ?, section = ?, dept_id = ? WHERE email = ?';
  await queryParamPromise(sql2, [
    name,
    gender,
    dob,
    email,
    address + '-' + city + '-' + postalCode,
    contact,
    hashedPassword,
    section,
    department,
    old_email,
  ]);
  req.flash('success_msg', 'Student updated successfully');
  res.redirect('/admin/getAllStudents');
};

// 4. CLASSES

// 4.1 Select Class
exports.getClass = async (req, res, next) => {
  const sql = 'SELECT * FROM class';
  const results = await zeroParamPromise(sql);
  const staffData = [];
  for (const result of results) {
    const staffName = (
      await queryParamPromise(
        'SELECT st_name FROM STAFF WHERE st_id = ?',
        result.st_id
      )
    )[0].st_name;
    staffData.push(staffName);
  }
  res.render('Admin/Class/getClass', {
    data: results,
    staffData: staffData,
    page_name: 'classes',
  });
};

// 4.2 Add class
exports.getAddClass = async (req, res, next) => {
  const results = await zeroParamPromise('SELECT c_id from course');
  let courses = [];
  for (let i = 0; i < results.length; ++i) {
    courses.push(results[i].c_id);
  }
  const staffs = await zeroParamPromise(
    'SELECT st_id, email, dept_id from staff'
  );
  res.render('Admin/Class/addClass', {
    page_name: 'classes',
    courses: courses,
    staffs: staffs,
  });
};

exports.postAddClass = async (req, res, next) => {
  let { course, staff, section } = req.body;
  staff = staff.split(' ')[0];
  const sql1 = 'SELECT st_id, dept_id from staff where email = ?';
  const staffData = (await queryParamPromise(sql1, [staff]))[0];
  const sql2 = 'SELECT semester, dept_id from course where c_id = ?';
  const courseData = (await queryParamPromise(sql2, [course]))[0];
  if (staffData.dept_id !== courseData.dept_id) {
    req.flash('error', 'The staff and course are of different department');
    return res.redirect('/admin/addClass');
  }
  const sql3 =
    'select max(section) as `max_section` from student where dept_id = ?';
  const max_section = (await queryParamPromise(sql3, [staffData.dept_id]))[0]
    .max_section;
  if (section <= 0 || section > max_section) {
    req.flash('error', 'The section for the given department does not exist');
    return res.redirect('/admin/addClass');
  }
  const sql4 = 'INSERT INTO class set ?';
  await queryParamPromise(sql4, {
    section: section,
    semester: courseData.semester,
    c_id: course,
    st_id: staffData.st_id,
  });
  res.redirect('/admin/getClass');
};

// 4.3 Modify existing classes
exports.getClassSettings = async (req, res, next) => {
  const classId = req.params.id;
  const sql1 = 'SELECT * from class WHERE class_id = ?';
  const classData = await queryParamPromise(sql1, [classId]);
  const sql2 = 'SELECT c_id from course';
  const courseData = await zeroParamPromise(sql2);
  const sql3 = 'SELECT st_id, st_name, email from staff';
  const staffData = await zeroParamPromise(sql3);
  const sql4 = 'SELECT st_id, email FROM staff WHERE st_id = ?';
  const staffEmail = await queryParamPromise(sql4, [classData[0].st_id]);
  res.render('Admin/Class/setClass', {
    classData,
    courseData,
    staffData,
    staffEmail: staffEmail[0],
    page_name: 'classes',
  });
};

exports.postClassSettings = async (req, res, next) => {
  const { staff, course, section, classId } = req.body;
  const sql =
    'UPDATE class SET st_id = ?, c_id = ?, section = ? WHERE class_id = ?';
  await queryParamPromise(sql, [staff, course, section, classId]);
  req.flash('success_msg', 'Class changed successfully!');
  res.redirect('/admin/getClass');
};

// 5. DEPARTMENTS
// 5.1 Select department
exports.getDept = async (req, res, next) => {
  const results = await zeroParamPromise('SELECT * FROM department');
  res.render('Admin/Department/getDept', {
    data: results,
    page_name: 'depts',
  });
};

// 5.2 Add department
exports.getAddDept = (req, res, next) => {
  res.render('Admin/Department/addDept', { page_name: 'depts' });
};

exports.postAddDept = async (req, res, next) => {
  const deptName = req.body.department;
  const deptId = req.body.deptId;
  const sql1 = 'SELECT * from department where dept_id = ? or d_name = ?';
  const results = await queryParamPromise(sql1, [deptId, deptName]);
  if (results.length !== 0) {
    req.flash('error', 'Department with that name or id already exists');
    return res.redirect('/admin/addDept');
  } else {
    const sql2 = 'INSERT INTO department SET ?';
    await queryParamPromise(sql2, { dept_id: deptId, d_name: deptName });
    req.flash('success_msg', 'Department added successfully');
    res.redirect('/admin/getDept');
  }
};

// 5.3 Modify existing department
exports.getDeptSettings = async (req, res, next) => {
  const deptId = req.params.id;
  const sql1 = 'SELECT * FROM department WHERE dept_id = ?';
  const results = await queryParamPromise(sql1, [deptId]);
  res.render('Admin/Department/setDept', {
    name: results[0].d_name,
    id: results[0].dept_id,
    page_name: 'depts',
  });
};

exports.postDeptSettings = async (req, res, next) => {
  const { department, deptId } = req.body;
  const sql = 'UPDATE department SET d_name = ? WHERE dept_id = ?';
  await queryParamPromise(sql, [department, deptId]);
  req.flash('success_msg', 'Department changed successfully!');
  res.redirect('/admin/getDept');
};

// 6. COURSE
// 6.1 Get all courses
exports.getAllCourse = async (req, res, next) => {
  const results = await zeroParamPromise('SELECT * FROM course');
  res.render('Admin/Course/getCourse', {
    data: results,
    page_name: 'courses',
  });
};

// 6.2 Get courses on query
exports.getRelevantCourse = async (req, res, next) => {
  const results = await zeroParamPromise('SELECT * from department');
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Course/deptSelect', {
    departments: departments,
    page_name: 'courses',
  });
};

exports.postRelevantCourse = async (req, res, next) => {
  let { semester, department } = req.body;
  if (!semester && department === 'None') {
    const results = await zeroParamPromise('SELECT * FROM course');
    res.render('Admin/Course/getCourse', {
      data: results,
      page_name: 'courses',
    });
  } else if (!semester) {
    const sql = 'SELECT * FROM course WHERE dept_id = ?';
    const results = await queryParamPromise(sql, [department]);
    res.render('Admin/Course/getCourse', {
      data: results,
      page_name: 'courses',
    });
  } else if (department === 'None') {
    const sql = 'SELECT * FROM course WHERE semester = ?';
    const results = await queryParamPromise(sql, [semester]);
    res.render('Admin/Course/getCourse', {
      data: results,
      page_name: 'courses',
    });
  } else if (semester && department !== 'None') {
    const sql =
      'SELECT * FROM course WHERE semester = ? AND dept_id = ? GROUP BY c_id';
    const results = await queryParamPromise(sql, [semester, department]);
    res.render('Admin/Course/getCourse', {
      data: results,
      page_name: 'courses',
    });
  }
};

// 6.3 Add course
exports.getAddCourse = async (req, res, next) => {
  const results = await zeroParamPromise('SELECT * from department');
  let departments = [];
  for (let i = 0; i < results.length; ++i) {
    departments.push(results[i].dept_id);
  }
  res.render('Admin/Course/addCourse', {
    departments,
    page_name: 'courses',
  });
};
exports.postAddCourse = async (req, res, next) => {
  let { course, semester, department, credits, c_type } = req.body;
  const sql1 = 'SELECT COUNT(dept_id) AS size FROM course WHERE dept_id = ?';
  const results = await queryParamPromise(sql1, [department]);
  let size = results[0].size + 1;
  const c_id = department + (size <= 9 ? '0' : '') + size.toString();
  const sql2 = 'INSERT INTO course SET ?';
  await queryParamPromise(sql2, {
    c_id,
    semester: semester,
    name: course,
    c_type: c_type,
    credits: credits,
    dept_id: department,
  });
  req.flash('success_msg', 'Course added successfully');
  return res.redirect('/admin/getAllCourses');
};

// 6.4 Modify existing courses
exports.getCourseSettings = async (req, res, next) => {
  const cId = req.params.id;
  const sql1 = 'SELECT * FROM course WHERE c_id = ?';
  const courseData = await queryParamPromise(sql1, [cId]);
  const deptData = await zeroParamPromise('SELECT * from department');
  res.render('Admin/Course/setCourse', {
    courseData,
    page_name: 'courses',
    departments: deptData,
  });
};

exports.postCourseSettings = async (req, res, next) => {
  let { course, semester, department, credits, c_type, courseId } = req.body;
  const sql =
    'UPDATE course SET name = ?, semester = ?, credits = ?, c_type = ?, dept_id = ? WHERE c_id = ?';
  await queryParamPromise(sql, [
    course,
    semester,
    credits,
    c_type,
    department,
    courseId,
  ]);
  req.flash('success_msg', 'Course changed successfully!');
  res.redirect('/admin/getAllCourses');
};
