require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',           require('./src/routes/auth'));
app.use('/api/services',       require('./src/routes/services'));
app.use('/api/cars',           require('./src/routes/cars'));
app.use('/api/servicerecords', require('./src/routes/servicerecords'));
app.use('/api/payments',       require('./src/routes/payments'));
app.use('/api/reports',        require('./src/routes/reports'));

// Health check
app.get('/', (req, res) => res.json({ message: '✅ CRPMS API is running', version: '1.0.0' }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CRPMS Server → http://localhost:${PORT}`);
});
