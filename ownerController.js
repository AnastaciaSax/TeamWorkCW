const OwnerService = require('../services/ownerService');

exports.getOwners = async (req, res, next) => {
  try {
    const result = await OwnerService.getOwners(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOwnerById = async (req, res, next) => {
  try {
    const owner = await OwnerService.getOwnerById(req.params.id);
    res.json(owner);
  } catch (err) {
    if (err.message === 'Owner not found') {
      return res.status(404).json({ error: 'Owner not found' });
    }
    next(err);
  }
};

exports.createOwner = async (req, res, next) => {
  try {
    const owner = await OwnerService.createOwner(req.body);
    res.status(201).json(owner);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    next(err);
  }
};

exports.updateOwner = async (req, res, next) => {
  try {
    const owner = await OwnerService.updateOwner(req.params.id, req.body);
    res.json(owner);
  } catch (err) {
    if (err.message === 'Owner not found') {
      return res.status(404).json({ error: 'Owner not found' });
    }
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    next(err);
  }
};

exports.deleteOwner = async (req, res, next) => {
  try {
    const result = await OwnerService.deleteOwner(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Owner not found') {
      return res.status(404).json({ error: 'Owner not found' });
    }
    if (err.message === 'Cannot delete owner with existing pets') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};