const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');

// Эндпоинты для справочников
router.get('/animal-types', dictionaryController.getAnimalTypes);
router.get('/breeds', dictionaryController.getBreeds);
router.get('/vaccines', dictionaryController.getVaccines);

module.exports = router;