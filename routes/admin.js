const express = require('express');
const controller = require('../controllers/admin');
const { requireAuth, forwardAuth } = require('../middlewares/adminAuth');

const router = express.Router();

// 1. ADMIN

// 1.1 LOGIN
router.get('/login', forwardAuth, controller.getLogin);
router.post('/login', controller.postLogin);

// 1.2 REGISTER
router.get('/register', forwardAuth, controller.getRegister);
router.post('/register', controller.postRegister);

// 1.3 DASHBOARD
router.get('/dashboard', requireAuth, controller.getDashboard);
router.get('/logout', requireAuth, controller.getLogout);

// 1.4 Profile
router.get('/profile', requireAuth, controller.getProfile);

// 1.5 FORGET PASSWORD
router.get('/forgot-password', controller.getForgotPassword);
router.put('/forgot-password', controller.forgotPassword);

// 1.6 RESET PASSWORD
router.get('/resetpassword/:id', controller.getResetPassword);
router.put('/resetpassword', controller.resetPassword);

// 2.STAFFS
// 2.1 Add Staff
router.get('/addStaff', controller.getAddStaff);
router.post('/addStaff', controller.postAddStaff);
// 2.2 Get Staffs on Query
router.get('/getStaff', controller.getRelevantStaff);
router.post('/getStaff', controller.postRelevantStaff);
// 2.3 Get all Staffs
router.get('/getAllStaffs', controller.getAllStaff);
// 2.4 Modify existing Staffs
router.get('/settings/staff/:id', controller.getStaffSettings);
router.post('/settings/staff', controller.postStaffSettings);

// 3.STUDENTS
// 3.1 Add Student
router.get('/addStudent', controller.getAddStudent);
router.post('/addStudent', controller.postAddStudent);
// 3.2 Get Students on query
router.get('/getStudent', controller.getRelevantStudent);
router.post('/getStudent', controller.postRelevantStudent);
// 3.3 Get all Students
router.get('/getAllStudents', controller.getAllStudent);
// 3.4 Modify existing students
router.get('/settings/student/:id', controller.getStudentSettings);
router.post('/settings/student', controller.postStudentSettings);

// 4.CLASSES
router.get('/getClass', controller.getClass);
router.get('/addClass', controller.getAddClass);
router.post('/addClass', controller.postAddClass);
router.get('/settings/class/:id', controller.getClassSettings);
router.post('/settings/class', controller.postClassSettings);

// 5.DEPARTMENTS
router.get('/getDept', controller.getDept);
router.get('/addDept', controller.getAddDept);
router.post('/addDept', controller.postAddDept);
router.get('/settings/departments/:id', controller.getDeptSettings);
router.post('/settings/departments', controller.postDeptSettings);

// 6.COURSES
router.get('/getCourse', controller.getRelevantCourse);
router.post('/getCourse', controller.postRelevantCourse);
router.get('/getAllCourses', controller.getAllCourse);
router.get('/addCourse', controller.getAddCourse);
router.post('/addCourse', controller.postAddCourse);
router.get('/settings/course/:id', controller.getCourseSettings);
router.post('/settings/course', controller.postCourseSettings);

module.exports = router;
