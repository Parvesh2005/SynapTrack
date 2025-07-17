// backend/routes/habitRoutes.js
const express = require('express');
const {
    getHabits,
    createHabit,
    markHabitComplete,
    updateHabit,
    deleteHabit,
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);

router.route('/:id')
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

router.put('/:id/complete', protect, markHabitComplete);

module.exports = router;