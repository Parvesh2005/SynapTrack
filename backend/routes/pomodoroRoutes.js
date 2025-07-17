const express = require('express');
const { logPomodoroSession, getPomodoroSessions } = require('../controllers/pomodoroController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, logPomodoroSession)
    .get(protect, getPomodoroSessions);

module.exports = router;