const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist } = require('../controllers/watchlistController');

router.use(protect);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.put('/:symbol', updateWatchlistItem);
router.delete('/:symbol', removeFromWatchlist);

module.exports = router;
