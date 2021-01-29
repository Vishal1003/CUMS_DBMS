const express = require('express');
const controller = require('../controllers/admin');
const { requireAuth, forwardAuth } = require('../middlewares/adminAuth');

const router = express.Router();

// LOGIN
router.get('/login', forwardAuth, controller.getLogin);
router.post('/login', controller.postLogin);

// REGISTER
router.get('/register', forwardAuth, controller.getRegister);
router.post('/register', controller.postRegister);

router.get('/getStaff', controller.getStaff);
router.get('/addStaff', controller.getAddStaff);
router.post('/addStaff', controller.postAddStaff);

router.get('/addStudent', controller.getAddStudent);
router.post('/addStudent', controller.postAddStudent);
router.get('/getStudent', controller.getRelevantStudent);
router.post('/getStudent', controller.postRelevantStudent);
router.get('/getAllStudents', controller.getAllStudent);

router.get('/settings/student/:id', controller.getStudentSettings);
router.post('/settings/student', controller.postStudentSettings);

router.get('/getClass', controller.getClass);
router.get('/addClass', controller.getAddClass);
router.post('/addClass', controller.postAddClass);

router.get('/settings/class/:id', controller.getClassSettings);
router.post('/settings/class', controller.postClassSettings);

router.get('/getDept', controller.getDept);
router.get('/addDept', controller.getAddDept);
router.post('/addDept', controller.postAddDept);

router.get('/settings/department/:id', controller.getDeptSettings);
router.post('/settings/department', controller.postDeptSettings);

router.get('/getCourse', controller.getRelevantCourse);
router.post('/getCourse', controller.postRelevantCourse);
router.get('/getAllCourses', controller.getAllCourse);
router.get('/addCourse', controller.getAddCourse);
router.post('/addCourse', controller.postAddCourse);

router.get('/settings/course/:id', controller.getCourseSettings);
router.post('/settings/course', controller.postCourseSettings);

router.get('/dashboard', requireAuth, controller.getDashboard);
router.get('/logout', requireAuth, controller.getLogout);

router.get('/forgot-password', controller.getForgotPassword);
router.put('/forgot-password', controller.forgotPassword);

router.get('/resetpassword/:id', controller.getResetPassword);
router.put('/resetpassword', controller.resetPassword);


module.exports = router;
