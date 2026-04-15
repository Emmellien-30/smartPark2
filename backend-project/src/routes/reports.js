const express = require('express');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router  = express.Router();

router.use(verifyToken);

// GET /api/reports/daily?date=2025-04-01
// Daily report: services offered + amount paid per car
router.get('/daily', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Query param "date" is required. E.g. ?date=2025-04-01' });
  try {
    const [rows] = await db.query(`
      SELECT
        p.PaymentNumber,
        p.PlateNumber,
        c.CarType,
        c.Model,
        c.DriverPhone,
        s.ServiceName,
        s.ServicePrice,
        p.AmountPaid,
        p.PaymentMethod,
        p.ReceivedBy,
        p.PaymentDate,
        sr.ServiceDate,
        sr.RecordNumber
      FROM Payment p
      JOIN Car           c  ON p.PlateNumber  = c.PlateNumber
      JOIN ServiceRecord sr ON p.RecordNumber = sr.RecordNumber
      JOIN Services      s  ON sr.ServiceCode = s.ServiceCode
      WHERE DATE(p.PaymentDate) = ?
      ORDER BY p.PaymentDate ASC
    `, [date]);

    const totalAmount = rows.reduce((sum, r) => sum + Number(r.AmountPaid), 0);
    return res.json({ date, total_cars: rows.length, total_amount: totalAmount, records: rows });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /api/reports/dates — list all distinct payment dates (for dropdown)
router.get('/dates', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT DATE_FORMAT(PaymentDate, '%Y-%m-%d') AS date FROM Payment ORDER BY date DESC"
    );
    return res.json(rows.map(r => r.date));
  } catch (err) {
    console.error("DATABASE ERROR:", err); // <--- ADD THIS LINE
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/summary — overall summary stats
router.get('/summary', async (req, res) => {
  try {
    const [[cars]]    = await db.query('SELECT COUNT(*) as count FROM Car');
    const [[services]]= await db.query('SELECT COUNT(*) as count FROM Services');
    const [[records]] = await db.query('SELECT COUNT(*) as count FROM ServiceRecord');
    const [[payments]]= await db.query('SELECT COUNT(*) as count, COALESCE(SUM(AmountPaid),0) as total FROM Payment');
    return res.json({
      total_cars:     cars.count,
      total_services: services.count,
      total_records:  records.count,
      total_payments: payments.count,
      total_revenue:  payments.total,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
