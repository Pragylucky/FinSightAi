const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNews, summarizeArticle } = require('../controllers/newsController');

router.use(protect);

router.get('/', getNews);
router.post('/summarize', summarizeArticle);

module.exports = router;
