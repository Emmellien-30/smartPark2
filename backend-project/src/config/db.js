require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || 'Emmellien@123',
  database:           process.env.DB_NAME     || 'crpms',
  port:               parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:    10,
});

pool.getConnection((err, conn) => {
  if (err) { console.error('❌ MySQL connection failed:', err.message); return; }
  console.log('✅ MySQL connected to: crpms');
  conn.release();
});

module.exports = pool.promise();
