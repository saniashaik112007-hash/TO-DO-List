import { useEffect, useMemo, useState } from "react";
import LoginPage from "./components/LoginPage";
import { createTask, getTasks, removeTask, updateTask } from "./services/taskService";

const REMINDER_WINDOW = 15 * 60 * 1000;

function getToday() {
	const date = new Date();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

function formatDate(date) {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(date);
}

function formatTime(time) {
	if (!time) return "Anytime";
	const [hour, minute] = time.split(":");
	const date = new Date();
	date.setHours(Number(hour), Number(minute));
	return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function App() {
	const [student, setStudent] = useState(() => {
		const saved = localStorage.getItem("student");
		return saved ? JSON.parse(saved) : null;
	});
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("all");
	const [showForm, setShowForm] = useState(false);
	const [remindersOn, setRemindersOn] = useState(false);
	const [form, setForm] = useState({ title: "", dueTime: "" });
	const today = getToday();

	useEffect(() => {
		if (!student) return;
		localStorage.setItem("student", JSON.stringify(student));
	}, [student]);

	useEffect(() => {
		if (!student) return;
		getTasks(today, student._id)
			.then(setTasks)
			.catch(() => setError("Could not connect to the backend. Start the API and refresh."))
			.finally(() => setLoading(false));
	}, [today, student]);

	useEffect(() => {
		const checkReminders = () => {
			if (!remindersOn || !("Notification" in window) || Notification.permission !== "granted") return;
			const now = Date.now();
			tasks.forEach((task) => {
				if (task.date !== today || task.completed || !task.dueTime || task.reminded) return;
				const [hours, minutes] = task.dueTime.split(":").map(Number);
				const due = new Date();
				due.setHours(hours, minutes, 0, 0);
				if (due.getTime() >= now && due.getTime() - now <= REMINDER_WINDOW) {
					new Notification(`Coming up: ${task.title}`, { body: `This task is due at ${formatTime(task.dueTime)}.` });
					updateTask(task._id, { reminded: true }).catch(() => {});
					setTasks((current) => current.map((item) => (item._id === task._id ? { ...item, reminded: true } : item)));
				}
			});
		};
		checkReminders();
		const interval = window.setInterval(checkReminders, 60_000);
		return () => window.clearInterval(interval);
	}, [remindersOn, tasks, today]);

	const todayTasks = useMemo(() => tasks.filter((task) => task.date === today), [tasks, today]);
	const completedCount = todayTasks.filter((task) => task.completed).length;
	const progress = todayTasks.length ? Math.round((completedCount / todayTasks.length) * 100) : 0;
	const visibleTasks = todayTasks.filter((task) => {
		if (filter === "open") return !task.completed;
		if (filter === "completed") return task.completed;
		return true;
	});

	async function toggleTask(id) {
		const task = tasks.find((item) => item._id === id);
		if (!task) return;
		try {
			const updated = await updateTask(id, { completed: !task.completed });
			setTasks((current) => current.map((item) => (item._id === id ? updated : item)));
		} catch {
			setError("That task could not be updated. Please try again.");
		}
	}

	async function addTask(event) {
		event.preventDefault();
		if (!form.title.trim()) return;
		try {
			const task = await createTask({ ...form, title: form.title.trim(), date: today, studentId: student._id });
			setTasks((current) => [...current, task]);
			setForm({ title: "", dueTime: "" });
			setShowForm(false);
		} catch {
			setError("That task could not be saved. Please check the backend connection.");
		}
	}

	async function deleteTask(id) {
		try {
			await removeTask(id);
			setTasks((current) => current.filter((task) => task._id !== id));
		} catch {
			setError("That task could not be removed. Please try again.");
		}
	}

	async function enableReminders() {
		if (!("Notification" in window)) return;
		const permission = await Notification.requestPermission();
		setRemindersOn(permission === "granted");
	}

	if (!student) {
		return <LoginPage onLogin={setStudent} />;
	}

	return (
		<main className="app-shell">
			<aside className="sidebar">
				<div className="brand"><span className="brand-mark">✓</span><span>daymark</span></div>
				<div className="side-date"><span className="eyebrow">TODAY</span><strong>{formatDate(new Date())}</strong></div>
				<div className="student-badge">{student.name}<br /><small>Roll No: {student.rollNo}</small></div>
				<nav className="nav-list" aria-label="Task views">
					<button className={`nav-item ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}><span>◷</span> My day <b>{todayTasks.length}</b></button>
					<button className={`nav-item ${filter === "open" ? "active" : ""}`} onClick={() => setFilter("open")}><span>◷</span> To do</button>
					<button className={`nav-item ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}><span>✓</span> Completed</button>
				</nav>
				<div className="sidebar-note"><span className="note-icon">✦</span><p>Small steps add up to big progress.</p></div>
				<div className="sidebar-footer">Student planner<br /><span>Focus on what matters today.</span></div>
			</aside>

			<section className="content">
				<header className="topbar"><div><span className="eyebrow">YOUR DAILY PLAN</span><h1>Welcome, <em>{student.name}.</em></h1></div><div className="topbar-actions"><button className="logout-button" onClick={() => { localStorage.removeItem("student"); setStudent(null); setTasks([]); }}>Logout</button><button className={`reminder-button ${remindersOn ? "enabled" : ""}`} onClick={enableReminders}><span>♧</span>{remindersOn ? "Reminders on" : "Turn on reminders"}</button></div></header>
				{error && <div className="error-banner" role="alert">{error}</div>}

				<div className="overview-grid">
					<section className="progress-panel">
						<div className="progress-copy"><div><span className="eyebrow">TODAY'S PROGRESS</span><strong>{completedCount}<small> / {todayTasks.length}</small></strong><p>{completedCount === todayTasks.length && todayTasks.length ? "Everything is complete. Nice work!" : `${todayTasks.length - completedCount} ${todayTasks.length - completedCount === 1 ? "task" : "tasks"} still to go`}</p></div><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` }}><span>{progress}<small>%</small></span></div></div>
						<div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
					</section>
					<section className="focus-panel"><span className="eyebrow">FOCUS NOTE</span><p>Make space for the task that moves your day forward.</p><span className="focus-line" /></section>
				</div>

				<section className="tasks-section">
					<div className="section-heading"><div><h2>Today's tasks</h2><p>{todayTasks.length ? "Keep going, one task at a time." : "Your day is ready for a fresh start."}</p></div><button className="add-button" onClick={() => setShowForm((current) => !current)}><span>+</span> Add task</button></div>
					{showForm && <form className="task-form" onSubmit={addTask}><input autoFocus placeholder="What needs to get done?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><input type="time" aria-label="Due time" value={form.dueTime} onChange={(event) => setForm({ ...form, dueTime: event.target.value })} /><button type="submit">Save task</button></form>}
					<div className="filter-row"><div className="filters">{[["all", "All tasks"], ["open", "To do"], ["completed", "Completed"]].map(([key, label]) => <button key={key} className={filter === key ? "selected" : ""} onClick={() => setFilter(key)}>{label}{key === "all" && <span>{todayTasks.length}</span>}</button>)}</div><span className="task-count">{visibleTasks.length} shown</span></div>
					<div className="task-list">{loading ? <div className="empty-state"><h3>Loading your tasks...</h3></div> : visibleTasks.length ? visibleTasks.map((task) => <article className={`task-card ${task.completed ? "done" : ""}`} key={task._id}><button className="check-button" aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`} onClick={() => toggleTask(task._id)}>{task.completed ? "✓" : ""}</button><div className="task-details"><h3>{task.title}</h3><div>{task.dueTime ? <><span className="clock">◷</span>{formatTime(task.dueTime)}</> : "No time set"}</div></div><span className={`task-status ${task.completed ? "complete" : "upcoming"}`}>{task.completed ? "Done" : "Upcoming"}</span><button className="delete-button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task._id)}>×</button></article>) : <div className="empty-state"><span>✦</span><h3>No tasks in this view</h3><p>Add a task and give your day some direction.</p></div>}</div>
				</section>
			</section>
		</main>
	);
}

export default App;
