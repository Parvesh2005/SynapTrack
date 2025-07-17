const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    durationMinutes: {
        type: Number,
        required: true,
    },
    sessionType: {
        type: String,
        required: true,
        enum: ['work', 'short_break', 'long_break'],
    },
    taskAssociated: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PomodoroSession = mongoose.model('PomodoroSession', pomodoroSessionSchema);
module.exports = PomodoroSession;