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
          name: name,
          email: email,
          password: hashedPassword,
        },
        (error, results) => {
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

    let sql3 = 'SELECT * FROM admin WHERE email = ?';
    db.query(sql3, [email], async (err, results) => {
      if (
        results.length === 0 ||
        !(await bcrypt.compare(password, results[0].password))
      ) {
        errors.push({ msg: 'Email or Password is Incorrect' });
        res.status(401).render('Admin/login', { errors });
      } else {
        const user = results[0];
        const token = jwt.sign({ id: user.admin_id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.redirect('/admin/dashboard');
      }
    });
  } catch (err) {
    throw err;
  }
};

// DASHBOARD
exports.getDashboard = (req, res, next) => {
  let sql4 = 'SELECT * FROM admin WHERE admin_id = ?';
  db.query(sql4, [req.user], (err, result) => {
    if (err) throw err;
    res.render('Admin/dashboard', { user: result[0], page_name: 'overview' });
  });
};

// LOGOUT
exports.getLogout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
};

// STAFFS
exports.getStaff = (req, res, next) => {
  const sql1 = 'SELECT * FROM staff';
  db.query(sql1, (err, results) => {
    if (err) throw err;
    else {
      res.render('Admin/Staff/getStaff', { data: results, page_name: 'staff' });
    }
  });
};

exports.getAddStaff = (req, res, next) => {
  const sql1 = 'SELECT * from department';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let departments = [];
    for (let i = 0; i < results.length; ++i) {
      departments.push(results[i].dept_id);
    }
    res.render('Admin/Staff/addStaff', {
      departments: departments,
      page_name: 'staff',
    });
  });
};

exports.postAddStaff = async (req, res, next) => {
  const sql1 = 'SELECT * from staff where email = ?';
  db.query(sql1, [req.body.email], async (err, results) => {
    if (err) {
      console.log(err);
    }
    if (results.length !== 0) {
      req.flash('error', 'Staff with that email already exists');
      res.redirect('/admin/addStaff');
    } else {
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

      let hashedPassword = await bcrypt.hash(password, 8);

      const sql2 = 'INSERT INTO staff SET ?';
      db.query(
        sql2,
        {
          st_name: name,
          gender: gender,
          dob: dob,
          email: email,
          st_address: address + '-' + city + '-' + postalCode,
          contact: contact,
          dept_id: department,
          password: hashedPassword,
        },
        (err, results) => {
          if (err) {
            throw err;
          }
          req.flash('success_msg', 'Staff added successfully');
          res.redirect('/admin/getStaff');
        }
      );
    }
  });
};

// CLASSES

const coursePromise = () => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT c_id from course';
    db.query(sql1, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const staffPromise = () => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT st_id, st_name, email from staff';
    db.query(sql1, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const staffIdPromise = (st_id) => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT st_id, email FROM staff WHERE st_id = ?';
    db.query(sql1, [st_id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const setClassPromise = (classId) => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT * from class WHERE class_id = ?';
    db.query(sql1, [classId], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

exports.getClass = (req, res, next) => {
  const sql1 = 'SELECT * FROM class';

  db.query(sql1, (err, results) => {
    if (err) throw err;
    else {
      res.render('Admin/Class/getClass', {
        data: results,
        page_name: 'class',
      });
    }
  });
};

exports.getClassSettings = async (req, res, next) => {
  const classId = req.params.id;

  try {
    const classData = await setClassPromise(classId);
    const courseData = await coursePromise();
    const staffData = await staffPromise();
    const staffEmail = await staffIdPromise(classData[0].st_id);

    // console.table(staffEmail);
    res.render('Admin/Class/setClass', {
      classData,
      courseData,
      staffData,
      staffEmail: staffEmail[0],
      page_name: 'classes',
    });
  } catch (e) {
    throw e;
  }
};

exports.postClassSettings = (req, res, next) => {
  const { staff, course, section, classId } = req.body;

  const sql1 =
    'UPDATE class SET st_id = ?, c_id = ?, section = ? WHERE class_id = ?';
  db.query(sql1, [staff, course, section, classId], (err, results) => {
    if (err) throw err;
    else {
      req.flash('success_msg', 'Class changed successfully!');
      res.redirect('/admin/getClass');
    }
  });
};

exports.getAddClass = (req, res, next) => {
  const sql1 = 'SELECT c_id from course';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let courses = [];
    for (let i = 0; i < results.length; ++i) {
      courses.push(results[i].c_id);
    }
    const sql2 = 'SELECT st_id, email from staff';
    db.query(sql2, (err, staffs) => {
      if (err) {
        throw err;
      }

      res.render('Admin/Class/addClass', {
        page_name: 'classes',
        courses: courses,
        staffs: staffs,
      });
    });
  });
};

exports.postAddClass = (req, res, next) => {
  const { course, staff, section } = req.body;

  const sql2 = 'SELECT semester from course where c_id = ?';
  db.query(sql2, [course], (err2, results2) => {
    if (err2) {
      throw err2;
    }
    const semester = results2[0].semester;
    const sql3 = 'INSERT INTO class set ?';
    db.query(
      sql3,
      {
        section: section,
        semester: semester,
        c_id: course,
        st_id: staff.st_id,
      },
      (err3) => {
        if (err3) {
          throw err3;
        }
        res.redirect('/admin/getClass');
      }
    );
  });
};

// STUDENTS
exports.getAddStudent = (req, res, next) => {
  const sql1 = 'SELECT * from department';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let departments = [];
    for (let i = 0; i < results.length; ++i) {
      departments.push(results[i].dept_id);
    }
    res.render('Admin/Student/addStudent', {
      page_name: 'students',
      departments: departments,
    });
  });
};

exports.postAddStudent = (req, res, next) => {
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
  const SECTION_LIMIT = 2;
  const password = dob.toString().split('-').join('');
  bcrypt.hash(password, 8, function (err, hashedPassword) {
    if (err) throw err;
    const sql1 =
      'select count(*) as `count`, section from student where section = (select max(section) from student where dept_id = ?) AND dept_id = ?';
    db.query(sql1, [department, department], (err, results) => {
      if (err) throw err;
      let section = 1;
      if (results[0].count !== 0) {
        if (results[0].count == SECTION_LIMIT) {
          section = results[0].section + 1;
        } else {
          section = results[0].section;
        }
      }
      const sql2 = 'INSERT INTO STUDENT SET ?';
      db.query(
        sql2,
        {
          s_name: name,
          gender: gender,
          dob: dob,
          email: email,
          s_address: address + '-' + city + '-' + postalCode,
          contact: contact,
          password: hashedPassword,
          section: section,
          dept_id: department,
        },
        (err, results) => {
          if (err) throw err;
          req.flash('success_msg', 'Student added successfully');
          res.redirect('/admin/getAllStudents');
        }
      );
    });
  });
};

exports.getAllStudent = (req, res, next) => {
  const sql1 = 'SELECT * from student';
  db.query(sql1, (err, results) => {
    res.render('Admin/Student/getStudent', {
      data: results,
      page_name: 'students',
    });
  });
};

exports.getRelevantStudent = (req, res, next) => {
  const sql1 = 'SELECT * from department';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let departments = [];
    for (let i = 0; i < results.length; ++i) {
      departments.push(results[i].dept_id);
    }
    res.render('Admin/Student/deptSelect', {
      departments: departments,
      page_name: 'students',
    });
  });
};

exports.postRelevantStudent = (req, res, next) => {
  let { section, department } = req.body;
  section = parseInt(section);
  if (!section && department === 'None') {
    const sql1 = 'SELECT * FROM student';
    db.query(sql1, (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Student/getStudent', {
          data: results,
          page_name: 'students',
        });
      }
    });
  } else if (!section) {
    const sql2 = 'SELECT * FROM student WHERE dept_id = ?';
    db.query(sql2, [department], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Student/getStudent', {
          data: results,
          page_name: 'students',
        });
      }
    });
  } else if (department === 'None') {
    const sql2 = 'SELECT * FROM student WHERE section = ?';
    db.query(sql2, [section], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Student/getStudent', {
          data: results,
          page_name: 'students',
        });
      }
    });
  } else if (section && department !== 'None') {
    const sql2 =
      'SELECT * FROM student WHERE section = ? AND dept_id = ? GROUP BY s_id';
    db.query(sql2, [section, department], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Student/getStudent', {
          data: results,
          page_name: 'students',
        });
      }
    });
  }
};

exports.getStudentSettings = async (req, res, next) => {
  const studentEmail = req.params.id;
  const sql1 = 'SELECT * FROM STUDENT WHERE email = ?';
  db.query(sql1, [studentEmail], (req, result) => {
    const address = result[0].s_address.split('-');
    result[0].address = address;
    const sql2 = 'SELECT * from department';
    db.query(sql2, (err, results) => {
      if (err) {
        throw err;
      }
      let departments = [];
      for (let i = 0; i < results.length; ++i) {
        departments.push(results[i].dept_id);
      }
      res.render('Admin/Student/setStudent', {
        studentData: result,
        departments: departments,
        page_name: 'classes',
      });
    });
  });
};

exports.postStudentSettings = (req, res, next) => {
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
  const SECTION_LIMIT = 2;
  const password = dob.toString().split('-').join('');
  bcrypt.hash(password, 8, function (err, hashedPassword) {
    if (err) throw err;
    const sql1 =
      'select count(*) as `count`, section from student where section = (select max(section) from student where dept_id = ?) AND dept_id = ?';
    db.query(sql1, [department, department], (err, results) => {
      if (err) throw err;
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
      db.query(
        sql2,
        [
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
        ],
        (err, results) => {
          if (err) throw err;
          req.flash('success_msg', 'Student updated successfully');
          res.redirect('/admin/getAllStudents');
        }
      );
    });
  });
};

// DEPARTMENTS
exports.getDept = (req, res, next) => {
  const sql1 = 'SELECT * FROM department';

  db.query(sql1, (err, results) => {
    if (err) throw err;
    else {
      res.render('Admin/Department/getDept', {
        data: results,
        page_name: 'depts',
      });
    }
  });
};

exports.getAddDept = (req, res, next) => {
  res.render('Admin/Department/addDept', { page_name: 'depts' });
};

exports.postAddDept = async (req, res, next) => {
  const deptName = req.body.department;
  const deptId = req.body.deptId;

  const sql2 = 'SELECT * from department where dept_id = ? or d_name = ?';
  db.query(sql2, [deptId, deptName], (err, results) => {
    if (err) {
      throw err;
    }
    if (results.length !== 0) {
      req.flash('error', 'Department with that name or id already exists');
      return res.redirect('/admin/addDept');
    } else {
      const sql3 = 'INSERT INTO department SET ?';
      db.query(sql3, { dept_id: deptId, d_name: deptName }, (err, results) => {
        if (err) throw err;
        else {
          req.flash('success_msg', 'Department added successfully');
          res.redirect('/admin/getDept');
        }
      });
    }
  });
};

exports.getDeptSettings = (req, res, next) => {
  const deptId = req.params.id;
  const sql1 = 'SELECT * FROM department WHERE dept_id = ?';

  db.query(sql1, [deptId], (err, results) => {
    if (err) throw err;
    else {
      res.render('Admin/Department/setDept', {
        name: results[0].d_name,
        id: results[0].dept_id,
        page_name: 'depts',
      });
    }
  });
};

exports.postDeptSettings = (req, res, next) => {
  const { department, deptId } = req.body;

  const sql1 = 'UPDATE department SET d_name = ? WHERE dept_id = ?';
  db.query(sql1, [department, deptId], (err, results) => {
    if (err) throw err;
    else {
      req.flash('success_msg', 'Department changed successfully!');
      res.redirect('/admin/getDept');
    }
  });
};

// COURSE
exports.getRelevantCourse = (req, res, next) => {
  const sql1 = 'SELECT * from department';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let departments = [];
    for (let i = 0; i < results.length; ++i) {
      departments.push(results[i].dept_id);
    }
    res.render('Admin/Course/deptSelect', {
      departments: departments,
      page_name: 'courses',
    });
  });
};

exports.postRelevantCourse = (req, res, next) => {
  let { semester, department } = req.body;
  semester = parseInt(semester);
  if (!semester && department === 'None') {
    const sql1 = 'SELECT * FROM course';
    db.query(sql1, (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Course/getCourse', {
          data: results,
          page_name: 'courses',
        });
      }
    });
  } else if (!semester) {
    const sql2 = 'SELECT * FROM course WHERE dept_id = ?';
    db.query(sql2, [department], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Course/getCourse', {
          data: results,
          page_name: 'courses',
        });
      }
    });
  } else if (department === 'None') {
    const sql2 = 'SELECT * FROM course WHERE semester = ?';
    db.query(sql2, [semester], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Course/getCourse', {
          data: results,
          page_name: 'courses',
        });
      }
    });
  } else if (semester && department !== 'None') {
    const sql2 =
      'SELECT * FROM course WHERE semester = ? AND dept_id = ? GROUP BY c_id';
    db.query(sql2, [semester, department], (err, results) => {
      if (err) throw err;
      else {
        res.render('Admin/Course/getCourse', {
          data: results,
          page_name: 'courses',
        });
      }
    });
  }
};

exports.getAddCourse = (req, res, next) => {
  const sql1 = 'SELECT * from department';
  db.query(sql1, (err, results) => {
    if (err) {
      throw err;
    }
    let departments = [];
    for (let i = 0; i < results.length; ++i) {
      departments.push(results[i].dept_id);
    }
    res.render('Admin/Course/addCourse', {
      departments,
      page_name: 'courses',
    });
  });
};

exports.getAllCourse = (req, res, next) => {
  const sql1 = 'SELECT * FROM course';
  db.query(sql1, (err, results) => {
    if (err) throw err;
    else {
      res.render('Admin/Course/getCourse', {
        data: results,
        page_name: 'courses',
      });
    }
  });
};

exports.postAddCourse = async (req, res, next) => {
  let { course, semester, department, credits, c_type } = req.body;
  semester = parseInt(semester);
  credits = parseInt(credits);
  let year = parseInt((semester + 1) / 2);
  let sql1 = 'INSERT INTO course SET ?';

  const sql2 = 'SELECT COUNT(dept_id) AS size FROM course WHERE dept_id = ?';

  db.query(sql2, department, (err, results) => {
    if (err) throw err;
    else {
      let size = results[0].size + 1;
      const c_id = department + size;
      db.query(
        sql1,
        {
          c_id,
          semester: semester,
          year: year,
          name: course,
          c_type: c_type,
          credits: credits,
          dept_id: department,
        },
        (err, results) => {
          if (err) {
            throw err;
          }
          req.flash('success_msg', 'Course added successfully');
          return res.redirect('/admin/getAllCourses');
        }
      );
    }
  });
};

const getCoursePromise = (cId) => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT * FROM course WHERE c_id = ?';
    db.query(sql1, [cId], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

const getDeptPromise = () => {
  return new Promise((resolve, reject) => {
    const sql1 = 'SELECT * from department';
    db.query(sql1, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

exports.getCourseSettings = async (req, res, next) => {
  const cId = req.params.id;

  try {
    const courseData = await getCoursePromise(cId);
    const deptData = await getDeptPromise();
    console.table(courseData);
    console.table(deptData);
    res.render('Admin/Course/setCourse', {
      courseData,
      page_name: 'courses',
      departments: deptData,
    });
  } catch (e) {
    throw e;
  }
};

exports.postCourseSettings = (req, res, next) => {
  let { course, semester, department, credits, c_type, courseId } = req.body;
  semester = parseInt(semester);
  credits = parseInt(credits);
  let year = parseInt((semester + 1) / 2);

  const sql1 =
    'UPDATE course SET name = ?, semester = ?, credits = ?, year = ?, c_type = ?, dept_id = ? WHERE c_id = ?';
  db.query(
    sql1,
    [course, semester, credits, year, c_type, department, courseId],
    (err, results) => {
      if (err) throw err;
      else {
        req.flash('success_msg', 'Course changed successfully!');
        res.redirect('/admin/getAllCourses');
      }
    }
  );
};


exports.getForgotPassword = (req, res, next) => {
  res.render('Admin/forgotPassword');
}

exports.forgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).render('Admin/forgotPassword')
  }

  let errors = [];

  const sql1 = 'SELECT * from admin WHERE email = ?';
  db.query(sql1, [email], async (err, results) => {
    if (err) throw err;
    else {
      if (!results || results.length === 0) {
        errors.push({ msg: 'That email is not registered!' });
        res.status(401).render('Admin/forgotPassword', {
          errors
        });
      }

      const token = jwt.sign({ id: results[0].admin_id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });
      const data = {
        from: 'noreplyCMS@mail.com',
        to: email,
        subject: 'Reset Password Link',
        html: `<h2>Please click on given link to reset your password</h2>
                <p><a href="${process.env.URL}/admin/resetpassword/${token}">Reset Password</a></p>
                <hr>
                <p><b>The link will expire in 20m!</b></p>
              `
      };

      const sql2 = 'UPDATE admin SET resetLink = ? WHERE email = ?';
      db.query(sql2, [token, email], (err, success) => {
        if (err) {
          errors.push({ msg: 'Error In ResetLink' })
          res.render('Admin/forgotPassword', { errors });
        }
        else {
          mg.messages().send(data, (err, body) => {
            if (err) throw err;
            else {
              console.log(body);
              req.flash('success_msg', 'Reset Link Sent Successfully!');
              res.redirect('/admin/forgot-password');
            }
          });
        }
      });
    }
  });
}

exports.getResetPassword = (req, res, next) => {
  const resetLink = req.params.id;
  res.render('Admin/resetPassword', { resetLink })
}

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
                  throw errorData
                } else {
                  req.flash('success_msg', 'Password Changed Successfully! Login Now');
                  res.redirect('/admin/login');
                }
              })
            }
          });
        }

      })
    } else {
      errors.push({ msg: 'Authentication Error' })
      res.render('Admin/resetPassword', { errors });
    }
  }
}
