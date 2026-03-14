const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationController');

router.get('/', vaccinationController.getVaccinations);
router.post('/', vaccinationController.createVaccination);
router.put('/:id', vaccinationController.updateVaccination);
router.delete('/:id', vaccinationController.deleteVaccination);

module.exports = router;