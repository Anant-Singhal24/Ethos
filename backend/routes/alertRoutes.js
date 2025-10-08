const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStats);
router.post('/check', alertController.checkAlerts);
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);
router.patch('/:id/resolve', alertController.resolveAlert);

module.exports = router;
