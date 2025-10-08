const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.get('/:entityId/state', predictionController.predictState);
router.get('/:entityId/next-location', predictionController.predictNextLocation);
router.get('/:entityId/anomalies', predictionController.detectAnomalies);

module.exports = router;
