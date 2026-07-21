const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPortfolio, addHolding, updateHolding, removeHolding } = require('../controllers/portfolioController');

router.use(protect);

router.get('/', getPortfolio);
router.post('/holdings', addHolding);
router.put('/holdings/:symbol', updateHolding);
router.delete('/holdings/:symbol', removeHolding);

module.exports = router;
