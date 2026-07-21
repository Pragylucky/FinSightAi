const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { screenStocks, getSectors } = require('../controllers/screenerController');

router.use(protect);

router.get('/', screenStocks);
router.get('/sectors', getSectors);

module.exports = router;
