const express = require('express');
const controller = require('../controllers/admin');

const router = express.Router();

// get login page
router.get('/', controller.getLogin);

router.get('/register', controller.getRegister);

router.post('/register', controller.postRegister);

module.exports = router;
