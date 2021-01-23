const express = require('express');
const controller = require('../controllers/admin');
const { requireAuth, forwardAuth } = require('../middlewares/adminAuth');

const router = express.Router();

// get login page
router.get('/login', forwardAuth, controller.getLogin);
router.post('/login', controller.postLogin);

router.get('/register', forwardAuth, controller.getRegister);
router.post('/register', controller.postRegister);

router.get('/dashboard', requireAuth, controller.getDashboard);

router.get('/logout', requireAuth, controller.getLogout);

router.get('/getStaff', controller.getStaff);
router.get('/addStaff', controller.getAddStaff);
router.post('/addStaff', controller.postAddStaff);

router.get('/addStudent', controller.getAddStudent);
router.get('/addClass', controller.getAddClass);

router.get('/getDept', controller.getDept);
router.get('/addDept', controller.getAddDept);
router.post('/addDept', controller.postAddDept);

router.get('/addCourse', controller.getAddCourse);

module.exports = router;
