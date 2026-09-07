const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const filter = {};
		if (req.query.date) filter.date = req.query.date;
		if (req.query.studentId) filter.studentId = req.query.studentId;
		const tasks = await Task.find(filter).sort({ dueTime: 1, createdAt: 1 });
		res.json(tasks);
	} catch (error) {
		res.status(500).json({ message: "Unable to load tasks." });
	}
});

router.post("/", async (req, res) => {
	try {
		const { title, dueTime, date, studentId } = req.body;
		if (!title || !date || !studentId) return res.status(400).json({ message: "Title, date, and student are required." });
		const task = await Task.create({ title, dueTime, date, studentId });
		res.status(201).json(task);
	} catch (error) {
		res.status(400).json({ message: "Unable to create task." });
	}
});

router.patch("/:id", async (req, res) => {
	try {
		const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!task) return res.status(404).json({ message: "Task not found." });
		res.json(task);
	} catch (error) {
		res.status(400).json({ message: "Unable to update task." });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const task = await Task.findByIdAndDelete(req.params.id);
		if (!task) return res.status(404).json({ message: "Task not found." });
		res.status(204).send();
	} catch (error) {
		res.status(400).json({ message: "Unable to delete task." });
	}
});

module.exports = router;
