import { useState, useEffect } from "react";
import "./index.css";
import api from "./services/api";

export default function App() {
  const [view, setView] = useState("login"); // 'login' | 'signup'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setView("users");
      fetchUsers();
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/signup", form);
      localStorage.setItem("token", res.data.token);
      setView("users");
      await fetchUsers();
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", form);
      localStorage.setItem("token", res.data.token);
      setView("users");
      await fetchUsers();
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setView("login");
      }
      console.error("Failed to fetch users:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setView("login");
    setUsers([]);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="os-shell">
      {/* Top nav */}
      <header className="os-nav glass">
        <div className="brand">
          <span className="orb" />
          <span className="logo-text">OS</span>
        </div>
        {view !== "users" && (
          <div className="nav-actions">
            <button
              className={`chip ${view === "login" ? "active" : ""}`}
              onClick={() => setView("login")}
            >
              Login
            </button>
            <button
              className={`chip ${view === "signup" ? "active" : ""}`}
              onClick={() => setView("signup")}
            >
              Sign up
            </button>
          </div>
        )}
      </header>

      {/* Two-column layout */}
      <main className="os-grid">
        {/* LEFT: Animated showcase */}
        <section className="showcase">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />

          <div className="showcase-card hero glass">
            <div className="hero-text">
              <h1>Build faster with <span>School System</span></h1>
              <p>Secure • Blazing-fast • Analytics-ready</p>
            </div>
            <div className="hero-images">
              {/* Attractive images */}
              <div className="img i1" />
              <div className="img i2" />
              <div className="img i3" />
            </div>
          </div>

          <div className="cards">
            {/* Metric card with animated bars */}
            <div className="mini-card glass">
              <div className="mini-title">Active Workspaces</div>
              <div className="metric">1,274</div>
              <div className="bars">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>

            {/* Response time card */}
            <div className="mini-card glass">
              <div className="mini-title">Avg. Response</div>
              <div className="metric">134 ms</div>
              <div className="sparkline">
                {Array.from({ length: 20 }).map((_, i) => (
                  <i key={i} style={{ animationDelay: `${i * 0.06}s` }} />
                ))}
              </div>
            </div>

            {/* USP badges */}
            <div className="badges glass">
              <span className="badge">Developer-First</span>
              <span className="badge">SOC-2 Ready</span>
              <span className="badge">99.99% Uptime</span>
              <span className="badge">Global Edge</span>
            </div>
          </div>
        </section>

        {/* RIGHT: Auth + list */}
        <section className="auth">
          {view !== "users" ? (
            <div className="auth-card glass">
              <div className="welcome-ribbon">
                <h3>Welcome to School System</h3>
                <p>Sign in or create an account in seconds.</p>
              </div>

              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${view === "login" ? "active" : ""}`}
                  onClick={() => setView("login")}
                >
                  Login
                </button>
                <button
                  className={`tab ${view === "signup" ? "active" : ""}`}
                  onClick={() => setView("signup")}
                >
                  Sign up
                </button>
              </div>

              {/* Forms */}
              {view === "signup" && (
                <form onSubmit={handleSignup} className="form">
                  <label>
                    <span>Full name</span>
                    <input
                      name="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <button className="cta" type="submit">
                    Create account
                  </button>

                  <p className="muted">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="linklike"
                      onClick={() => setView("login")}
                    >
                      Login
                    </button>
                  </p>
                </form>
              )}

              {view === "login" && (
                <form onSubmit={handleLogin} className="form">
                  <label>
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      name="password"
                      type="password"
                      placeholder="Your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <button className="cta" type="submit">
                    Continue
                  </button>

                  <p className="muted">
                    New to School System?{" "}
                    <button
                      type="button"
                      className="linklike"
                      onClick={() => setView("signup")}
                    >
                      Create account
                    </button>
                  </p>
                </form>
              )}
            </div>
          ) : (
            <div className="users-card glass">
              <div className="users-head">
                <h2>Users</h2>
                <button className="chip danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <ul className="users-list">
                {users.map((u) => (
                  <li key={u._id}>
                    <span className="avatar">{u.name?.[0] || "U"}</span>
                    <div>
                      <strong>{u.name}</strong>
                      <div className="email">{u.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      <footer className="os-foot">
        © {new Date().getFullYear()} School System Platform • Built for modern teams
      </footer>
    </div>
  );
}
