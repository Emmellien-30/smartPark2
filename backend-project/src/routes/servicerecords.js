const express = require('express');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();

router.use(verifyToken);

// GET /api/servicerecords — list all with car + service details
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sr.*,
             c.CarType, c.Model, c.DriverPhone, c.MechanicName,
             s.ServiceName, s.ServicePrice
      FROM ServiceRecord sr
      JOIN Car      c ON sr.PlateNumber = c.PlateNumber
      JOIN Services s ON sr.ServiceCode = s.ServiceCode
      ORDER BY sr.ServiceDate DESC, sr.RecordNumber DESC
    `);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/servicerecords/:id — one record
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sr.*,
             c.CarType, c.Model, c.DriverPhone, c.MechanicName,
             s.ServiceName, s.ServicePrice
      FROM ServiceRecord sr
      JOIN Car      c ON sr.PlateNumber = c.PlateNumber
      JOIN Services s ON sr.ServiceCode = s.ServiceCode
      WHERE sr.RecordNumber = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Service record not found' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/servicerecords — INSERT
router.post('/', async (req, res) => {
  const { ServiceDate, PlateNumber, ServiceCode, Notes } = req.body;
  if (!ServiceDate || !PlateNumber || !ServiceCode)
    return res.status(400).json({ error: 'ServiceDate, PlateNumber, and ServiceCode are required' });
  try {
    // Verify car exists
    const [car] = await db.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [PlateNumber.toUpperCase()]);
    if (!car.length) return res.status(400).json({ error: 'Car not found. Register the car first.' });
    // Verify service exists
    const [svc] = await db.query('SELECT ServiceCode FROM Services WHERE ServiceCode = ?', [ServiceCode]);
    if (!svc.length) return res.status(400).json({ error: 'Service not found.' });

    const [result] = await db.query(
      'INSERT INTO ServiceRecord (ServiceDate, PlateNumber, ServiceCode, Notes) VALUES (?,?,?,?)',
      [ServiceDate, PlateNumber.toUpperCase(), ServiceCode, Notes || null]
    );
    return res.status(201).json({ message: 'Service record created', RecordNumber: result.insertId });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// PUT /api/servicerecords/:id — UPDATE (per exam rules: full CRUD on ServiceRecord)
router.put('/:id', async (req, res) => {
  const { ServiceDate, PlateNumber, ServiceCode, Notes } = req.body;
  if (!ServiceDate || !PlateNumber || !ServiceCode)
    return res.status(400).json({ error: 'ServiceDate, PlateNumber, and ServiceCode are required' });
  try {
    const [result] = await db.query(
      'UPDATE ServiceRecord SET ServiceDate=?, PlateNumber=?, ServiceCode=?, Notes=? WHERE RecordNumber=?',
      [ServiceDate, PlateNumber.toUpperCase(), ServiceCode, Notes || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Service record not found' });
    return res.json({ message: 'Service record updated' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// DELETE /api/servicerecords/:id — DELETE (per exam rules: full CRUD on ServiceRecord)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ServiceRecord WHERE RecordNumber = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Service record not found' });
    return res.json({ message: 'Service record deleted' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
