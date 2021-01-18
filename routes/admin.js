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

router.get('/addStaff', (req, res) => {
    res.render('Admin/addStaff')
})

module.exports = router;

