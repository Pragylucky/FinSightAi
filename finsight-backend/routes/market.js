const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { overview } = require('../controllers/marketController');

// Public: powers the live ticker and movers on the landing page. Market data only, nothing personal.
router.get('/pulse', overview);

router.use(protect);
router.get('/overview', overview);

module.exports = router;
