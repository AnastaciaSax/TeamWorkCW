const VaccinationService = require('../services/vaccinationService');

exports.getVaccinations = async (req, res, next) => {
  try {
    const vaccinations = await VaccinationService.getVaccinations(req.query.passportId);
    res.json(vaccinations);
  } catch (err) {
    next(err);
  }
};

exports.createVaccination = async (req, res, next) => {
  try {
    const vaccination = await VaccinationService.createVaccination(req.body);
    res.status(201).json(vaccination);
  } catch (err) {
    next(err);
  }
};

exports.updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await VaccinationService.updateVaccination(req.params.id, req.body);
    res.json(vaccination);
  } catch (err) {
    if (err.message === 'Vaccination not found') {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    next(err);
  }
};

exports.deleteVaccination = async (req, res, next) => {
  try {
    const result = await VaccinationService.deleteVaccination(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Vaccination not found') {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    next(err);
  }
};