const SpecialNeedService = require('../services/specialNeedService');

exports.getSpecialNeeds = async (req, res, next) => {
  try {
    const needs = await SpecialNeedService.getSpecialNeeds(req.query.petId);
    res.json(needs);
  } catch (err) {
    next(err);
  }
};

exports.createSpecialNeed = async (req, res, next) => {
  try {
    const need = await SpecialNeedService.createSpecialNeed(req.body);
    res.status(201).json(need);
  } catch (err) {
    next(err);
  }
};

exports.updateSpecialNeed = async (req, res, next) => {
  try {
    const need = await SpecialNeedService.updateSpecialNeed(req.params.id, req.body);
    res.json(need);
  } catch (err) {
    if (err.message === 'Need not found') {
      return res.status(404).json({ error: 'Need not found' });
    }
    next(err);
  }
};

exports.deleteSpecialNeed = async (req, res, next) => {
  try {
    const result = await SpecialNeedService.deleteSpecialNeed(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Need not found') {
      return res.status(404).json({ error: 'Need not found' });
    }
    next(err);
  }
};