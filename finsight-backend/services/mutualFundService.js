const axios = require('axios');

const MFAPI_BASE = 'https://api.mfapi.in/mf';

// ── Search mutual fund schemes ─────────────────────────────
const searchMutualFund = async (fundName) => {
  try {
    const response = await axios.get(
      `${MFAPI_BASE}/search`,
      {
        params: {
          q: fundName,
        },
        timeout: 10000,
      }
    );

    return response.data || [];
  } catch (error) {
    console.error(
      `❌ Mutual fund search error for ${fundName}:`,
      error.message
    );

    return [];
  }
};

// ── Get NAV + historical NAV ───────────────────────────────
const getMutualFundData = async (schemeCode) => {
  try {
    const response = await axios.get(
      `${MFAPI_BASE}/${schemeCode}`,
      {
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `❌ Mutual fund data error for ${schemeCode}:`,
      error.message
    );

    return null;
  }
};

module.exports = {
  searchMutualFund,
  getMutualFundData,
};