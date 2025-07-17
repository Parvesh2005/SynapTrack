const Todo = require('../models/Todo');

const getTodos = async (req, res) => {
    const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
};

const createTodo = async (req, res) => {
    const { taskName } = req.body;

    if (!taskName) {
        return res.status(400).json({ message: 'Please add a task name' });
    }

    const todo = await Todo.create({
        userId: req.user._id,
        taskName,
    });
    res.status(201).json(todo);
};

const updateTodo = async (req, res) => {
    const { taskName, isCompleted } = req.body;

    const todo = await Todo.findById(req.params.id);

    if (todo && todo.userId.toString() === req.user._id.toString()) {
        todo.taskName = taskName || todo.taskName;
        if (isCompleted !== undefined) {
            todo.isCompleted = isCompleted;
            if (isCompleted) {
                todo.completedAt = Date.now();
            } else {
                todo.completedAt = undefined;
            }
        }

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } else {
        res.status(404).json({ message: 'Todo not found or not authorized' });
    }
};

const deleteTodo = async (req, res) => {
    const todo = await Todo.findById(req.params.id);

    if (todo && todo.userId.toString() === req.user._id.toString()) {
        await Todo.deleteOne({ _id: req.params.id });
        res.json({ message: 'Todo removed' });
    } else {
        res.status(404).json({ message: 'Todo not found or not authorized' });
    }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };