const express = require('express');
const controller = require('../controllers/admin');
const { requireAuth, forwardAuth } = require('../middlewares/adminAuth');

const router = express.Router();

// 1. ADMIN

// 1.1 Login
router.get('/login', forwardAuth, controller.getLogin);
router.post('/login', controller.postLogin);

// 1.2 Register
router.get('/register', forwardAuth, controller.getRegister);
router.post('/register', controller.postRegister);

// 1.3 Dashboard
router.get('/dashboard', requireAuth, controller.getDashboard);

// 1.4 Logout
router.get('/logout', requireAuth, controller.getLogout);

// 1.5 Profile
router.get('/profile', requireAuth, controller.getProfile);

// 1.6 Forgot password
router.get('/forgot-password', forwardAuth, controller.getForgotPassword);
router.put('/forgot-password', forwardAuth, controller.forgotPassword);

// 1.7 Reset Password
router.get('/resetpassword/:id', forwardAuth, controller.getResetPassword);
router.put('/resetpassword', forwardAuth, controller.resetPassword);

// 1.8 Settings
router.get('/info_settings', requireAuth, controller.getInfoSettings);
router.post('/info_settings', requireAuth, controller.postInfoSettings);
router.get('/password_settings', requireAuth, controller.getPasswordSettings);
router.post('/password_settings', requireAuth, controller.postPasswordSettings);

// 2.STAFFS
// 2.1 Add staff
router.get('/addStaff', requireAuth, controller.getAddStaff);
router.post('/addStaff', requireAuth, controller.postAddStaff);
// 2.2 Get staffs on query
router.get('/getStaff', requireAuth, controller.getRelevantStaff);
router.post('/getStaff', requireAuth, controller.postRelevantStaff);
// 2.3 Get all staffs
router.get('/getAllStaffs', requireAuth, controller.getAllStaff);
// 2.4 Modify existing staffs
router.get('/settings/staff/:id', requireAuth, controller.getStaffSettings);
router.post('/settings/staff', requireAuth, controller.postStaffSettings);

// 3.STUDENTS
// 3.1 Add Student
router.get('/addStudent', requireAuth, controller.getAddStudent);
router.post('/addStudent', requireAuth, controller.postAddStudent);
// 3.2 Get Students on query
router.get('/getStudent', requireAuth, controller.getRelevantStudent);
router.post('/getStudent', requireAuth, controller.postRelevantStudent);
// 3.3 Get all Students
router.get('/getAllStudents', requireAuth, controller.getAllStudent);
// 3.4 Modify existing students
router.get('/settings/student/:id', requireAuth, controller.getStudentSettings);
router.post('/settings/student', requireAuth, controller.postStudentSettings);

// 4.CLASSES (subjects mapping courses ,staffs and section)
// 4.1 Select class
router.get('/getClass', requireAuth, controller.getClass);
// 4.2 Add class
router.get('/addClass', requireAuth, controller.getAddClass);
router.post('/addClass', controller.postAddClass);
// 4.3 Modify existing classes
router.get('/settings/class/:id', requireAuth, controller.getClassSettings);
router.post('/settings/class', requireAuth, controller.postClassSettings);

// 5.DEPARTMENTS
// 5.1 Select department
router.get('/getDept', requireAuth, controller.getDept);
// 5.2 Add department
router.get('/addDept', requireAuth, controller.getAddDept);
router.post('/addDept', requireAuth, controller.postAddDept);
// 5.3 Modify existing department
router.get('/settings/department/:id', requireAuth, controller.getDeptSettings);
router.post('/settings/department', requireAuth, controller.postDeptSettings);

// 6.COURSES
// 6.1 Get all courses
router.get('/getAllCourses', requireAuth, controller.getAllCourse);
// 6.2 Get courses on query
router.get('/getCourse', requireAuth, controller.getRelevantCourse);
router.post('/getCourse', requireAuth, controller.postRelevantCourse);
// 6.3 Add course
router.get('/addCourse', requireAuth, controller.getAddCourse);
router.post('/addCourse', requireAuth, controller.postAddCourse);
// 6.4 Modify existing courses
router.get('/settings/course/:id', requireAuth, controller.getCourseSettings);
router.post('/settings/course', requireAuth, controller.postCourseSettings);

module.exports = router;
