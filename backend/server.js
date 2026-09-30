const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Initialize db
getDb().then(database => {
  db = database;
  console.log('Database connected');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Get or Create User
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  try {
    let user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
    if (!user) {
      const result = await db.run('INSERT INTO users (name) VALUES (?)', [name]);
      user = { id: result.lastID, name };
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save Score
app.post('/api/scores', async (req, res) => {
  const { user_id, game_id, score, duration } = req.body;
  
  if (!user_id || !game_id || score === undefined || duration === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const result = await db.run(
      'INSERT INTO scores (user_id, game_id, score, duration) VALUES (?, ?, ?, ?)',
      [user_id, game_id, score, duration]
    );
    res.json({ id: result.lastID, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Stats
app.get('/api/users/:id/stats', async (req, res) => {
  const { id } = req.params;
  
  try {
    const scores = await db.all('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC', [id]);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
