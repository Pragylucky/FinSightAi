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

  return closest ? parseFloat(closest.nav) : null;
};

// Calculate annualized return (CAGR)
const calculateReturn = (currentNav, oldNav, years) => {
  if (!currentNav || !oldNav || oldNav <= 0) return 0;

  const cagr =
    (Math.pow(currentNav / oldNav, 1 / years) - 1) * 100;

  return Number(cagr.toFixed(2));
};

// GET /api/mutual-funds
const getMutualFunds = async (req, res, next) => {
  try {
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