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
router.get('/addStaff', requireAuth, controller.getAddStaff);
router.post('/addStaff', requireAuth, controller.postAddStaff);
// 2.2 Get Staffs on Query
router.get('/getStaff', requireAuth, controller.getRelevantStaff);
router.post('/getStaff', requireAuth, controller.postRelevantStaff);
// 2.3 Get all Staffs
router.get('/getAllStaffs', requireAuth, controller.getAllStaff);
// 2.4 Modify existing Staffs
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

// 4.CLASSES
router.get('/getClass', requireAuth, controller.getClass);
router.get('/addClass', requireAuth, controller.getAddClass);
router.post('/addClass', requireAuth, controller.postAddClass);
router.get('/settings/class/:id', requireAuth, controller.getClassSettings);
router.post('/settings/class', requireAuth, controller.postClassSettings);

// 5.DEPARTMENTS
router.get('/getDept', requireAuth, controller.getDept);
router.get('/addDept', requireAuth, controller.getAddDept);
router.post('/addDept', requireAuth, controller.postAddDept);
router.get('/settings/department/:id', requireAuth, controller.getDeptSettings);
router.post('/settings/department', requireAuth, controller.postDeptSettings);

// 6.COURSES
router.get('/getCourse', requireAuth, controller.getRelevantCourse);
router.post('/getCourse', requireAuth, controller.postRelevantCourse);
router.get('/getAllCourses', requireAuth, controller.getAllCourse);
router.get('/addCourse', requireAuth, controller.getAddCourse);
router.post('/addCourse', requireAuth, controller.postAddCourse);
router.get('/settings/course/:id', requireAuth, controller.getCourseSettings);
router.post('/settings/course', requireAuth, controller.postCourseSettings);

module.exports = router;
