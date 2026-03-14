const express = require('express');
const router = express.Router();
const passportController = require('../controllers/passportController');

router.get('/', passportController.getPassportByPetId);
router.get('/search', passportController.searchPassport);
router.post('/', passportController.createPassport);
router.delete('/:id', passportController.deletePassport);

module.exports = router;