const path = require('path');
const express = require('express');


const router = express.Router();

// get login page
router.get('/', (req, res, next) => {
    res.render('Admin/login-admin')
});

module.exports = router;