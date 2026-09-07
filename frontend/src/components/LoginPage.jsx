import { useState } from "react";

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ name: "", rollNo: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim()) {
      setError("Please enter both your name and roll number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          rollNo: form.rollNo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      onLogin(data);
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">✓</span>
          <span>daymark</span>
        </div>

        <div className="login-header">
          <span className="eyebrow">STUDENT LOGIN</span>
          <h1>Welcome back</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              type="text"
              placeholder="Enter student name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label>
            <span>Roll No</span>
            <input
              type="text"
              placeholder="Enter roll number"
              value={form.rollNo}
              onChange={(event) => setForm((current) => ({ ...current, rollNo: event.target.value }))}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
