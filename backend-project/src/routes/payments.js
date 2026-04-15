const express = require('express');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();

router.use(verifyToken);

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*,
             c.CarType, c.Model,
             s.ServiceName, s.ServicePrice,
             sr.ServiceDate
      FROM Payment p
      JOIN Car           c  ON p.PlateNumber  = c.PlateNumber
      JOIN ServiceRecord sr ON p.RecordNumber = sr.RecordNumber
      JOIN Services      s  ON sr.ServiceCode = s.ServiceCode
      ORDER BY p.PaymentDate DESC, p.PaymentNumber DESC
    `);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/payments/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*,
             c.CarType, c.Model, c.DriverPhone,
             s.ServiceName, s.ServicePrice,
             sr.ServiceDate, sr.Notes
      FROM Payment p
      JOIN Car           c  ON p.PlateNumber  = c.PlateNumber
      JOIN ServiceRecord sr ON p.RecordNumber = sr.RecordNumber
      JOIN Services      s  ON sr.ServiceCode = s.ServiceCode
      WHERE p.PaymentNumber = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/payments — INSERT only (per exam rules)
router.post('/', async (req, res) => {
  const { AmountPaid, PaymentDate, PlateNumber, RecordNumber, PaymentMethod, ReceivedBy } = req.body;
  if (!AmountPaid || !PaymentDate || !PlateNumber || !RecordNumber || !ReceivedBy)
    return res.status(400).json({ error: 'AmountPaid, PaymentDate, PlateNumber, RecordNumber, ReceivedBy are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO Payment (AmountPaid, PaymentDate, PlateNumber, RecordNumber, PaymentMethod, ReceivedBy) VALUES (?,?,?,?,?,?)',
      [AmountPaid, PaymentDate, PlateNumber.toUpperCase(), RecordNumber, PaymentMethod || 'Cash', ReceivedBy]
    );
    return res.status(201).json({ message: 'Payment recorded', PaymentNumber: result.insertId });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/payments/bill/:id — generate bill for one payment
router.get('/bill/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*,
             c.CarType, c.Model, c.ManufacturingYear, c.DriverPhone, c.MechanicName,
             s.ServiceName, s.ServicePrice,
             sr.ServiceDate, sr.Notes
      FROM Payment p
      JOIN Car           c  ON p.PlateNumber  = c.PlateNumber
      JOIN ServiceRecord sr ON p.RecordNumber = sr.RecordNumber
      JOIN Services      s  ON sr.ServiceCode = s.ServiceCode
      WHERE p.PaymentNumber = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
