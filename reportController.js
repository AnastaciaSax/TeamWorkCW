const ReportService = require('../services/reportService');

exports.animalsByType = async (req, res, next) => {
  try {
    const report = await ReportService.animalsByType();
    res.json(report);
  } catch (err) {
    next(err);
  }
};

exports.ownerReport = async (req, res, next) => {
  try {
    const report = await ReportService.ownerReport(req.params.id);
    res.json(report);
  } catch (err) {
    if (err.message === 'Owner not found') {
      return res.status(404).json({ error: 'Owner not found' });
    }
    next(err);
  }
};

exports.expiringVaccinations = async (req, res, next) => {
  try {
    const report = await ReportService.expiringVaccinations(req.query.days);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

exports.expiredVaccinations = async (req, res, next) => {
  try {
    const report = await ReportService.expiredVaccinations();
    res.json(report);
  } catch (err) {
    next(err);
  }
};