const PomodoroSession = require('../models/PomodoroSession');

const logPomodoroSession = async (req, res) => {
    const { startTime, endTime, durationMinutes, sessionType, taskAssociated } = req.body;

    if (!startTime || !endTime || !durationMinutes || !sessionType) {
        return res.status(400).json({ message: 'Missing required fields for Pomodoro session' });
    }

    try {
        const session = await PomodoroSession.create({
            userId: req.user._id,
            startTime,
            endTime,
            durationMinutes,
            sessionType,
            taskAssociated,
        });
        res.status(201).json(session);
    } catch (error) {
        console.error('Error logging Pomodoro session:', error);
        res.status(500).json({ message: 'Server error logging session' });
    }
};

const getPomodoroSessions = async (req, res) => {
    try {
        const sessions = await PomodoroSession.find({ userId: req.user._id }).sort({ startTime: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching Pomodoro sessions:', error);
        res.status(500).json({ message: 'Server error fetching sessions' });
    }
};

module.exports = { logPomodoroSession, getPomodoroSessions };