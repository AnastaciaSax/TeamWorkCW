const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/animals-by-type', reportController.animalsByType);
router.get('/owner/:id', reportController.ownerReport);
router.get('/expiring-vaccinations', reportController.expiringVaccinations);
router.get('/expired-vaccinations', reportController.expiredVaccinations);

module.exports = router;