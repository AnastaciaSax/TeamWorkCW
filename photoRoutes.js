const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');

router.get('/', photoController.getPhotos);
router.post('/', photoController.createPhoto);
router.delete('/:id', photoController.deletePhoto);

module.exports = router;