const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();




router.post('/register', async (req, res) => {
  const { username, password, fullname } = req.body;
  
  if (!username || !password || !fullname) {
    return res.status(400).json({ error: 'Username, password, and fullname are required' });
  }

  try {
    // 1. Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert into the database
    // Note: CreatedAt is handled by NOW() or CURRENT_TIMESTAMP
    const [result] = await db.query(
      'INSERT INTO Users (Username, Password, FullName, CreatedAt) VALUES (?, ?, ?, NOW())',
      [username, hashedPassword, fullname]
    );

    return res.status(201).json({ 
      message: 'User created successfully', 
      userId: result.insertId 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });
  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE Username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid username or password' });
    const user = rows[0];
    const isMatch = user.Password.startsWith('$2')
      ? await bcrypt.compare(password, user.Password)
      : password === user.Password;
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });
    const token = jwt.sign(
      { id: user.UserID, username: user.Username, fullname: user.FullName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    return res.json({ token, user: { id: user.UserID, username: user.Username, fullname: user.FullName } });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/auth/logout (client deletes token)
router.post('/logout', verifyToken, (req, res) =>
  res.json({ message: 'Logged out successfully' })
);

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) =>
  res.json({ user: req.user })
);

module.exports = router;
