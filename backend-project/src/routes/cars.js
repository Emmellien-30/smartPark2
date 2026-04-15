const express = require('express');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();

router.use(verifyToken);

// GET /api/cars
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Car ORDER BY CreatedAt DESC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/cars/:plateNumber
router.get('/:plateNumber', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [req.params.plateNumber.toUpperCase()]);
    if (!rows.length) return res.status(404).json({ error: 'Car not found' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/cars — INSERT only (per exam rules)
router.post('/', async (req, res) => {
  const { PlateNumber, CarType, Model, ManufacturingYear, DriverPhone, MechanicName } = req.body;
  if (!PlateNumber || !CarType || !Model || !ManufacturingYear || !DriverPhone || !MechanicName)
    return res.status(400).json({ error: 'All fields are required' });

  // Validate Rwandan plate: 2 letters + 1 letter + 3 digits + 1 letter (e.g. RAG300S)
  const plateRegex = /^[A-Z]{2}[A-Z]\d{3}[A-Z]$/;
  if (!plateRegex.test(PlateNumber.toUpperCase()))
    return res.status(400).json({ error: 'Invalid plate number format. Expected: RAG300S (2 letters + letter + 3 digits + letter)' });

  try {
    const [check] = await db.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [PlateNumber.toUpperCase()]);
    if (check.length) return res.status(409).json({ error: 'Car with this plate number already exists' });

    await db.query(
      'INSERT INTO Car (PlateNumber, CarType, Model, ManufacturingYear, DriverPhone, MechanicName) VALUES (?,?,?,?,?,?)',
      [PlateNumber.toUpperCase(), CarType, Model, ManufacturingYear, DriverPhone, MechanicName]
    );
    return res.status(201).json({ message: 'Car registered', PlateNumber: PlateNumber.toUpperCase() });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
