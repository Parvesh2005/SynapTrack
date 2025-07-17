const express = require('express');
const { getHabitSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/habit-suggestions', protect, getHabitSuggestions);

module.exports = router;