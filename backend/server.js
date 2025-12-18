const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();

// Standard CORS configuration
app.use(cors());
app.use(express.json());

// Database connection using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verification endpoint to test DB connection from browser
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "online", db: "connected", time: result.rows[0].now });
  } catch (err) {
    console.error("Database Connection Error:", err);
    res.status(500).json({ status: "error", detail: err.message });
  }
});

// Get User Status
app.get("/api/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "System Error" });
  }
});

// Get Tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = 1 ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "System Error" });
  }
});

// Add Task
app.post("/api/tasks", async (req, res) => {
  const { title, type } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, type) VALUES (1, $1, $2) RETURNING *",
      [title, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "System Error" });
  }
});

// Complete Task
app.put("/api/tasks/:id/complete", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE tasks SET completed = true WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "System Error" });
  }
});

// Bind to 0.0.0.0 to ensure the container is accessible externally
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible at http://[NAS_IP_ADDRESS]:${PORT}`);
});
