const express = require('express');
const controller = require('../controllers/admin');
const requireAuth = require('../middlewares/auth');

const router = express.Router();

// get login page
router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);

router.get('/register', controller.getRegister);
router.post('/register', controller.postRegister);


router.get('/dashboard', requireAuth, controller.getDashboard);

module.exports = router;

