const express = require('express');
const router = express.Router();
const specialNeedController = require('../controllers/specialNeedController');

router.get('/', specialNeedController.getSpecialNeeds);
router.post('/', specialNeedController.createSpecialNeed);
router.put('/:id', specialNeedController.updateSpecialNeed);
router.delete('/:id', specialNeedController.deleteSpecialNeed);

module.exports = router;