// backend/controllers/aiController.js
// THIS IS THE UNIQUE CODE FOR VERIFICATION
console.log("aiController.js: Running version with daysInPeriod fix applied. (Build 2025-07-17)");

const { GoogleGenerativeAI } = require('@google/generative-ai');
const PomodoroSession = require('../models/PomodoroSession');
const Habit = require('../models/Habit');
const Todo = require('../models/Todo');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const getHabitSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        thirtyDaysAgo.setHours(0,0,0,0);

        // Calculation of daysInPeriod - THIS IS THE FIX
        const daysInPeriod = Math.floor((Date.now() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));

        // 1. Fetch Raw Data
        const pomodoroSessions = await PomodoroSession.find({
            userId,
            startTime: { $gte: thirtyDaysAgo },
            sessionType: 'work'
        }).sort({ startTime: 1 });

        const habits = await Habit.find({ userId });

        const todosCompleted = await Todo.find({
            userId,
            isCompleted: true,
            completedAt: { $gte: thirtyDaysAgo }
        }).sort({ completedAt: 1 });

        // 2. Perform Data Analysis and Summarization
        let totalWorkMinutes = 0;
        const workMinutesByHour = new Array(24).fill(0);
        const workMinutesByDayOfWeek = new Array(7).fill(0);

        pomodoroSessions.forEach(session => {
            totalWorkMinutes += session.durationMinutes;
            const sessionStartTime = new Date(session.startTime);
            workMinutesByHour[sessionStartTime.getHours()] += session.durationMinutes;
            workMinutesByDayOfWeek[sessionStartTime.getDay()] += session.durationMinutes;
        });

        const maxWorkMinutesInHour = Math.max(...workMinutesByHour);
        const peakHours = workMinutesByHour
            .map((minutes, hour) => ({ hour, minutes }))
            .filter(item => item.minutes === maxWorkMinutesInHour && item.minutes > 0)
            .map(item => `${item.hour}:00 - ${item.hour + 1}:00`);

        const maxWorkMinutesInDay = Math.max(...workMinutesByDayOfWeek);
        const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const peakDays = workMinutesByDayOfWeek
            .map((minutes, dayIndex) => ({ day: daysOfWeekNames[dayIndex], minutes }))
            .filter(item => item.minutes === maxWorkMinutesInDay && item.minutes > 0)
            .map(item => item.day);

        let habitSummaries = [];
        habits.forEach(habit => {
            const relevantCompletions = habit.completionDates.filter(date => new Date(date) >= thirtyDaysAgo);
            const completionCount = relevantCompletions.length;
            const currentStreak = habit.currentStreak;
            const longestStreak = habit.longestStreak;

            let consistencyMessage = ``;
            if (habit.targetFrequency === 'daily') {
                consistencyMessage = `Completed ${completionCount} out of ${daysInPeriod} days (daily target).`;
            } else if (habit.targetFrequency === 'weekly') {
                consistencyMessage = `Completed ${completionCount} times in last ${daysInPeriod} days (weekly target).`;
            } else if (habit.targetFrequency === 'specific_days') {
                const targetDaysInPeriod = habit.specificDays.length * Math.ceil(daysInPeriod / 7);
                consistencyMessage = `Completed ${completionCount} times out of approximately ${targetDaysInPeriod} target days (specific days target).`;
            }

            habitSummaries.push(
                `- "${habit.habitName}" (Target: ${habit.targetFrequency.replace(/_/g, ' ')}): Current Streak: ${currentStreak}, Longest Streak: ${longestStreak}. ${consistencyMessage}`
            );
        });

        const totalCompletedTodos = todosCompleted.length;

        // 3. Construct the Refined Prompt for Gemini
        // ---- THIS IS THE SECTION THAT NEEDS TO BE CORRECTED ----
        let promptContent = `As an expert productivity and habit formation coach, analyze the following summarized user data from the last 30 days. First, provide 2-3 concise, actionable insights about their current productivity patterns. Then, based on these insights, provide 3-5 highly personalized and actionable habit suggestions.

---
**User Productivity Summary (Last 30 Days):**

**Pomodoro Work Sessions:**
- Total Work Minutes Recorded: ${totalWorkMinutes} minutes.
- Peak Productivity Hours (based on work sessions): ${peakHours.length > 0 ? peakHours.join(', ') : 'No clear peak hours observed.'}
- Peak Productivity Days (based on work sessions): ${peakDays.length > 0 ? peakDays.join(', ') : 'No clear peak days observed.'}

**Habit Tracking Consistency:**
${habitSummaries.length > 0 ? habitSummaries.join('\n') : '- No habits tracked or data insufficient.'}

**To-Do Completion:**
- Total To-Dos Completed: ${totalCompletedTodos}

---
**Instructions for your response:**

1.  Insights (2-3 concise bullet points): Identify specific patterns, strengths, or areas for improvement based on the summary. Start this section with "Insights:".
2.  Habit Suggestions (3-5 numbered list): Each suggestion must be:
     Directly linked to an insight provided.
     Specific, actionable, and personalized.
     Include a practical tip on how to implement it.
     Focus on improving focus, consistency, energy management, or work-life balance.
    Start this section with "Suggestions:".

Example suggestion format:
Habit Name: [e.g., "Mindful Morning Routine"]
     Insight Link: [e.g., "Addresses the insight that mornings are often unstructured."]
     Tip: [e.g., "Start with 5 minutes of meditation, followed by planning the top 3 tasks for the day."]

Do not give your output with some text in bold
`; // END OF PROMPTCONTENT CONSTRUCTION
        // ----------------------------------------------------

        console.log("Sending prompt to Gemini (summarized data):", promptContent);
        const result = await model.generateContent(promptContent);
        const response = await result.response;
        const text = response.text();

        const sections = text.split('Suggestions:');
        let insights = [];
        let suggestions = [];

        if (sections.length > 0) {
            insights = sections[0]
                .replace('Insights:', '')
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                .map(line => line.trim());
        }

        if (sections.length > 1) {
            suggestions = sections[1]
                .split('\n')
                .filter(line => line.match(/^\d+\./))
                .map(line => line.trim());
        }

        res.json({ insights, suggestions });

    } catch (error) {
        console.error('Error getting AI habit suggestions:', error.response?.data || error.message);
        if (error.response) {
            console.error('Gemini API Error Response Data:', error.response.data);
            console.error('Gemini API Error Response Status:', error.response.status);
            if (error.response.data && error.response.data.error) {
                console.error('Gemini API Detailed Error:', error.response.data.error);
            }
        }
        res.status(500).json({ message: 'Error generating AI suggestions. Please ensure you have sufficient productivity data logged. Details logged on server.' });
    }
};

module.exports = { getHabitSuggestions };