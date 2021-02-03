const express = require('express');
const homeController = require('../controllers/home');

const router = express.Router();
router.get('/', homeController.getIndex);

router.get('/error', homeController.getError);

module.exports = router;
