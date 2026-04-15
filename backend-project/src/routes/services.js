const express = require('express');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();

router.use(verifyToken);

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Services ORDER BY ServiceName');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Services WHERE ServiceCode = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/services — INSERT only (per exam rules)
router.post('/', async (req, res) => {
  const { ServiceName, ServicePrice } = req.body;
  if (!ServiceName || ServicePrice === undefined)
    return res.status(400).json({ error: 'ServiceName and ServicePrice are required' });
  try {
    const [check] = await db.query('SELECT ServiceCode FROM Services WHERE ServiceName = ?', [ServiceName]);
    if (check.length) return res.status(409).json({ error: 'Service already exists' });
    const [result] = await db.query(
      'INSERT INTO Services (ServiceName, ServicePrice) VALUES (?, ?)',
      [ServiceName, ServicePrice]
    );
    return res.status(201).json({ message: 'Service added', ServiceCode: result.insertId });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
