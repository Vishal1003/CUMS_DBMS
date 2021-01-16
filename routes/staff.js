const express = require('express');
const controller = require('../controllers/staff');

const router = express.Router();

// get login page
router.get('/', controller.getLogin);

module.exports = router;
