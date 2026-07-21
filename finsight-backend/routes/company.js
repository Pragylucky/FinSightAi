const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCompany, getQuote, getChartData, getCompanyNewsRoute, searchCompanies } = require('../controllers/companyController');

// All company routes protected
router.use(protect);

router.get('/search', searchCompanies);
router.get('/:symbol', getCompany);
router.get('/:symbol/quote', getQuote);
router.get('/:symbol/chart', getChartData);
router.get('/:symbol/news', getCompanyNewsRoute);

module.exports = router;
