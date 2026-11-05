const express = require('express');
const { protect } = require('../middleware/auth');
const Event = require('../models/Event');

const router = express.Router();
router.use(protect);

// POST /api/events  { name, session }  — fire-and-forget, never fails the caller
router.post('/', async (req, res) => {
  const { name, session } = req.body || {};
  if (Event.NAMES.includes(name)) {
    Event.create({ user: req.user._id, name, session: typeof session === 'string' ? session.slice(0, 40) : undefined }).catch(() => {});
  }
  res.status(202).json({ success: true });
});

// GET /api/events/funnel?days=30
// Distinct users at each step, and the headline metric: companies researched per active user.
router.get('/funnel', async (req, res, next) => {
  try {
    const days = Math.min(180, Math.max(1, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 864e5);
    const steps = ['guest_started', 'company_view', 'ai_tab_open', 'compare_used', 'screen_applied', 'chat_message'];
    const counts = await Promise.all(steps.map(async (name) => ({
      name,
      users: (await Event.distinct('user', { name, createdAt: { $gte: since } })).length,
      events: await Event.countDocuments({ name, createdAt: { $gte: since } }),
    })));
    const by = Object.fromEntries(counts.map((c) => [c.name, c]));
    const started = by.guest_started.users;
    res.json({
      success: true,
      windowDays: days,
      steps: counts,
      conversion: {
        guestToCompanyView: started ? +(by.company_view.users / started).toFixed(3) : null,
        companyViewToAiTab: by.company_view.users ? +(by.ai_tab_open.users / by.company_view.users).toFixed(3) : null,
      },
      companiesResearchedPerActiveUser: by.company_view.users ? +(by.ai_tab_open.events / by.company_view.users).toFixed(2) : null,
    });
  } catch (error) { next(error); }
});

module.exports = router;
