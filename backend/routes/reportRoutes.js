// backend/routes/reportRoutes.js
const express = require('express');
const { getWeeklyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/weekly', protect, getWeeklyReport);

module.exports = router;