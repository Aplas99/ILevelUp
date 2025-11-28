// backend/server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get User Status
app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'System Error' });
  }
});

// Get Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = 1 ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'System Error' });
  }
});

// Add Task
app.post('/api/tasks', async (req, res) => {
  const { title, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, type) VALUES (1, $1, $2) RETURNING *',
      [title, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'System Error' });
  }
});

// Complete Task (Logic for XP gain would go here in a real app)
app.put('/api/tasks/:id/complete', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = true WHERE id = $1 RETURNING *',
      [id]
    );
    // TODO: Add logic here to update User XP and Stats via SQL transaction
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'System Error' });
  }
});

app.listen(3000, () => {
  console.log('System initialized on port 3000');
});