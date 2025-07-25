const express = require('express');
const { protect } = require('../middleware/auth');
const { getAllProduction } = require('../controllers/productionController');

const router = express.Router();

router.use(protect);

router.get('/', getAllProduction);

module.exports = router; 