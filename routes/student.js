const express = require('express');
const controller = require('../controllers/student');

const router = express.Router();

// get login page
router.get('/', controller.getLogin);

module.exports = router;
