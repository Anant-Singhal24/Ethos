const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

router.get('/search', entityController.searchEntities);
router.get('/stats', entityController.getEntityStats);
router.get('/:id', entityController.getEntityById);
router.get('/', entityController.getAllEntities);
router.post('/resolve', entityController.resolveEntity);

module.exports = router;
