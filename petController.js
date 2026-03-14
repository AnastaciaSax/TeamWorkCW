const PetService = require('../services/petService');

exports.getPets = async (req, res, next) => {
  try {
    const result = await PetService.getPets(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPetById = async (req, res, next) => {
  try {
    const pet = await PetService.getPetById(req.params.id);
    res.json(pet);
  } catch (err) {
    if (err.message === 'Pet not found') {
      return res.status(404).json({ error: 'Pet not found' });
    }
    next(err);
  }
};

exports.createPet = async (req, res, next) => {
  try {
    const pet = await PetService.createPet(req.body);
    res.status(201).json(pet);
  } catch (err) {
    if (err.message === 'Owner not found' || err.message === 'Breed not found') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.updatePet = async (req, res, next) => {
  try {
    const pet = await PetService.updatePet(req.params.id, req.body);
    res.json(pet);
  } catch (err) {
    if (err.message === 'Pet not found') {
      return res.status(404).json({ error: 'Pet not found' });
    }
    next(err);
  }
};

exports.deletePet = async (req, res, next) => {
  try {
    const result = await PetService.deletePet(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Pet not found') {
      return res.status(404).json({ error: 'Pet not found' });
    }
    next(err);
  }
};