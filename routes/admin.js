const path = require('path');
const express = require('express');
const controller = require('../controllers/admin');

const router = express.Router();

// get login page
router.get('/', (req, res, next) => {
  res.render('Admin/login-admin');
});

router.get('/register', (req, res, next) => {
  res.render('Admin/register-admin', {
    message: '',
  });
});

router.post('/register', controller.register);

module.exports = router;
