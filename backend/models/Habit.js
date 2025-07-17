const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    habitName: {
        type: String,
        required: true,
        trim: true,
    },
    targetFrequency: { // e.g., "daily", "weekly", "x_times_a_week"
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'x_times_a_week', 'specific_days'],
        default: 'daily'
    },
    specificDays: { // For 'specific_days' frequency: [0=Sun, 1=Mon, ..., 6=Sat]
        type: [Number],
        default: []
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastCompletedDate: { // Date when the habit was last marked complete
        type: Date,
        default: null,
    },
    // Array to store completion dates for tracking consistency
    completionDates: [
        {
            type: Date,
            default: []
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;