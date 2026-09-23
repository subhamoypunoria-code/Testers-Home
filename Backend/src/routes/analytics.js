const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, checkProjectAccess } = require('../middleware/auth');
const { getProjectAnalytics, getDashboardStats } = require('../controllers/analyticsController');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/:projectId', checkProjectAccess, getProjectAnalytics);

module.exports = router;
