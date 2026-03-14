const DictionaryService = require('../services/dictionaryService');

exports.getAnimalTypes = async (req, res, next) => {
  try {
    const types = await DictionaryService.getAnimalTypes();
    res.json(types);
  } catch (err) {
    next(err);
  }
};

exports.getBreeds = async (req, res, next) => {
  try {
    const breeds = await DictionaryService.getBreeds(req.query.animalTypeId);
    res.json(breeds);
  } catch (err) {
    next(err);
  }
};

exports.getVaccines = async (req, res, next) => {
  try {
    const vaccines = await DictionaryService.getVaccines();
    res.json(vaccines);
  } catch (err) {
    next(err);
  }
};