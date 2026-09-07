const API_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000/api";

async function request(path, options = {}) {
	const response = await fetch(`${API_URL}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});

	if (response.status === 204) return null;

	const text = await response.text();
	const payload = text ? JSON.parse(text) : null;

	if (!response.ok) {
		throw new Error(payload?.message || "Request failed");
	}

	return payload;
}

export function getTasks(date, studentId) {
	const query = new URLSearchParams({ date });
	if (studentId) query.set("studentId", studentId);
	return request(`/tasks?${query.toString()}`);
}

export function createTask(task) {
	return request("/tasks", { method: "POST", body: JSON.stringify(task) });
}

export function updateTask(id, changes) {
	return request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
}

export function removeTask(id) {
	return request(`/tasks/${id}`, { method: "DELETE" });
}