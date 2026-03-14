const PassportService = require('../services/passportService');

exports.getPassportByPetId = async (req, res, next) => {
  try {
    const passport = await PassportService.getPassportByPetId(req.query.petId);
    res.json(passport || null);
  } catch (err) {
    next(err);
  }
};

exports.searchPassport = async (req, res, next) => {
  try {
    const passport = await PassportService.searchPassport(req.query.number);
    res.json(passport);
  } catch (err) {
    if (err.message === 'Passport not found') {
      return res.status(404).json({ error: 'Passport not found' });
    }
    next(err);
  }
};

exports.createPassport = async (req, res, next) => {
  try {
    const passport = await PassportService.createPassport(req.body);
    res.status(201).json(passport);
  } catch (err) {
    next(err);
  }
};

exports.deletePassport = async (req, res, next) => {
  try {
    const result = await PassportService.deletePassport(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Passport not found') {
      return res.status(404).json({ error: 'Passport not found' });
    }
    next(err);
  }
};