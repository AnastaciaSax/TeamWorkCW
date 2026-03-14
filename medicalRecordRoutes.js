const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

router.get('/', medicalRecordController.getMedicalRecords);
router.post('/', medicalRecordController.createMedicalRecord);
router.put('/:id', medicalRecordController.updateMedicalRecord);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

module.exports = router;