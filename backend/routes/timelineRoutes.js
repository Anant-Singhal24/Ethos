const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');

router.get('/:entityId', timelineController.getTimeline);
router.get('/:entityId/today', timelineController.getTodayTimeline);
router.get('/:entityId/with-predictions', timelineController.getTimelineWithPredictions);

module.exports = router;
