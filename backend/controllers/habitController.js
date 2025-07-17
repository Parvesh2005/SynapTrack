const Habit = require('../models/Habit');

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const getHabits = async (req, res) => {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
};

const createHabit = async (req, res) => {
    const { habitName, targetFrequency, specificDays } = req.body;

    if (!habitName || !targetFrequency) {
        return res.status(400).json({ message: 'Please add habit name and target frequency' });
    }

    const habit = await Habit.create({
        userId: req.user._id,
        habitName,
        targetFrequency,
        specificDays: targetFrequency === 'specific_days' ? specificDays : [],
    });
    res.status(201).json(habit);
};

const markHabitComplete = async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit || habit.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (habit.lastCompletedDate && isSameDay(habit.lastCompletedDate, today)) {
        return res.status(400).json({ message: 'Habit already marked complete for today' });
    }

    let newStreak = habit.currentStreak;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (habit.lastCompletedDate && isSameDay(habit.lastCompletedDate, yesterday)) {
        newStreak++;
    } else if (!habit.lastCompletedDate || !isSameDay(habit.lastCompletedDate, today)) {
        newStreak = 1;
    }

    habit.lastCompletedDate = Date.now();
    habit.currentStreak = newStreak;
    if (newStreak > habit.longestStreak) {
        habit.longestStreak = newStreak;
    }
    habit.completionDates.push(Date.now());

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
};

const updateHabit = async (req, res) => {
    const { habitName, targetFrequency, specificDays } = req.body;
    const habit = await Habit.findById(req.params.id);

    if (!habit || habit.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    habit.habitName = habitName || habit.habitName;
    habit.targetFrequency = targetFrequency || habit.targetFrequency;
    habit.specificDays = targetFrequency === 'specific_days' ? specificDays : [];

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
};

const deleteHabit = async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit || habit.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    await Habit.deleteOne({ _id: req.params.id });
    res.json({ message: 'Habit removed' });
};

module.exports = {
    getHabits,
    createHabit,
    markHabitComplete,
    updateHabit,
    deleteHabit,
};