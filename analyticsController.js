const AnalyticsService = require('../services/analyticsService');

exports.getSummary = async (req, res, next) => {
  try {
    const summary = await AnalyticsService.getSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};