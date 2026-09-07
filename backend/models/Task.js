const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String, required: true, trim: true },
		dueTime: { type: String, default: "" },
		date: { type: String, required: true },
		completed: { type: Boolean, default: false },
		reminded: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
