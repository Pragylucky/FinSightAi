// controllers/mutualFundController.js

const { mutualFundSchemes } = require('../data/mutualFundData');
const {
  searchMutualFund,
  getMutualFundData,
} = require('../services/mutualFundService');

// Find NAV closest to X years ago
const getHistoricalNav = (history, yearsAgo) => {
  if (!history || history.length === 0) return null;

  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);

  let closest = null;
  let smallestDifference = Infinity;

  for (const item of history) {
    const [day, month, year] = item.date.split('-');
    const itemDate = new Date(`${year}-${month}-${day}`);

    const difference = Math.abs(itemDate - targetDate);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closest = item;
    }
  }

  // A fund younger than the period has no NAV near that date: report "no data", not a made-up return
  const MAX_GAP_MS = 45 * 24 * 60 * 60 * 1000;
  return closest && smallestDifference <= MAX_GAP_MS ? parseFloat(closest.nav) : null;
};

// Calculate annualized return (CAGR)
const calculateReturn = (currentNav, oldNav, years) => {
  if (!currentNav || !oldNav || oldNav <= 0) return null;

  const cagr =
    (Math.pow(currentNav / oldNav, 1 / years) - 1) * 100;

  return Number(cagr.toFixed(2));
};

// Each fund needs a search plus a full NAV-history download, so cache the whole result.
const CACHE_MS = 6 * 60 * 60 * 1000;
let cached = { at: 0, funds: [] };

// GET /api/mutual-funds
const getMutualFunds = async (req, res, next) => {
  try {
    if (cached.funds.length && Date.now() - cached.at < CACHE_MS) {
      return res.json({ success: true, count: cached.funds.length, funds: cached.funds, cached: true });
    }

    const funds = await Promise.all(
      mutualFundSchemes.map(async (fund) => {
        try {
          // Search for the scheme
          const searchResults = await searchMutualFund(fund.name);

          if (!searchResults || searchResults.length === 0) {
            console.log(`⚠️ No scheme found for ${fund.name}`);
            return null;
          }

          // Use first matching scheme
          const scheme = searchResults[0];

          // Fetch full NAV history
          const fundData = await getMutualFundData(
            scheme.schemeCode
          );

          if (
            !fundData ||
            !fundData.data ||
            fundData.data.length === 0
          ) {
            return null;
          }

          const history = fundData.data;

          // MFAPI normally returns latest NAV first
          const currentNav = parseFloat(history[0].nav);

          const nav1Y = getHistoricalNav(history, 1);
          const nav3Y = getHistoricalNav(history, 3);
          const nav5Y = getHistoricalNav(history, 5);

          return {
            id: fund.id,

            schemeCode: scheme.schemeCode,

            name:
              fundData.meta?.scheme_name ||
              fund.name,

            amc:
              fundData.meta?.fund_house ||
              fund.amc,

            category: fund.category,

            riskLevel: fund.riskLevel,

            minSip: fund.minSip,

            nav: Number(currentNav.toFixed(2)),

            returns1Y: calculateReturn(
              currentNav,
              nav1Y,
              1
            ),

            returns3Y: calculateReturn(
              currentNav,
              nav3Y,
              3
            ),

            returns5Y: calculateReturn(
              currentNav,
              nav5Y,
              5
            ),
          };
        } catch (error) {
          console.error(
            `❌ Error processing ${fund.name}:`,
            error.message
          );

          return null;
        }
      })
    );

    const validFunds = funds.filter(Boolean);

    // If every fetch failed, serve the last good list instead of an empty page
    if (validFunds.length) cached = { at: Date.now(), funds: validFunds };
    else if (cached.funds.length) {
      return res.json({ success: true, count: cached.funds.length, funds: cached.funds, cached: true });
    }

    console.log(
      `🔥 Mutual funds successful: ${validFunds.length}/${mutualFundSchemes.length}`
    );

    res.json({
      success: true,
      count: validFunds.length,
      funds: validFunds,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMutualFunds,
};