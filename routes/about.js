const express = require('express');
const router = express.Router();
const { index } = require('../controllers/about');

router.get('/', index);

module.exports = router;
