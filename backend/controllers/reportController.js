// backend/controllers/reportController.js
const PomodoroSession = require('../models/PomodoroSession');
const Habit = require('../models/Habit');
const Todo = require('../models/Todo');

// @desc    Get weekly productivity report
// @route   GET /api/reports/weekly
// @access  Private
const getWeeklyReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        sevenDaysAgo.setHours(0,0,0,0); // Start of 7 days ago

        // Pomodoro Data
        const weeklyPomodoroSessions = await PomodoroSession.find({
            userId,
            startTime: { $gte: sevenDaysAgo },
            sessionType: 'work'
        });

        let totalWorkMinutes = 0;
        const workMinutesByDay = {}; // { 'YYYY-MM-DD': minutes }
        const workMinutesByHour = new Array(24).fill(0); // [0-23]

        weeklyPomodoroSessions.forEach(session => {
            totalWorkMinutes += session.durationMinutes;
            const sessionDate = session.startTime.toISOString().split('T')[0];
            workMinutesByDay[sessionDate] = (workMinutesByDay[sessionDate] || 0) + session.durationMinutes;

            const sessionHour = new Date(session.startTime).getHours();
            workMinutesByHour[sessionHour] += session.durationMinutes;
        });

        // Habit Data
        const habits = await Habit.find({ userId });
        let totalHabitsCompleted = 0;
        let habitsCompletedToday = 0;
        let habitsCompletedLast7Days = {}; // { 'HabitName': count }

        habits.forEach(habit => {
            const today = new Date();
            today.setHours(0,0,0,0);
            if (habit.lastCompletedDate && habit.lastCompletedDate.setHours(0,0,0,0) === today.getTime()) {
                habitsCompletedToday++;
            }

            habit.completionDates.forEach(dateStr => {
                const compDate = new Date(dateStr);
                if (compDate >= sevenDaysAgo) {
                    totalHabitsCompleted++;
                    habitsCompletedLast7Days[habit.habitName] = (habitsCompletedLast7Days[habit.habitName] || 0) + 1;
                }
            });
        });

        // Todo Data
        const completedTodos = await Todo.find({
            userId,
            isCompleted: true,
            completedAt: { $gte: sevenDaysAgo }
        });

        res.json({
            totalWorkMinutes,
            workMinutesByDay,
            workMinutesByHour,
            totalHabitsCompletedInLast7Days: totalHabitsCompleted,
            habitsCompletedToday,
            habitsCompletedLast7Days,
            totalTodosCompletedInLast7Days: completedTodos.length,
            // You can add more detailed todo analysis if needed
        });

    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ message: 'Server error fetching report' });
    }
};

module.exports = { getWeeklyReport };