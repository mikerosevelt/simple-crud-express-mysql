const express = require('express');
const router = express.Router();
const { index } = require('../controllers/home');

router.get('/', index);

module.exports = router;
