const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ownerRoutes = require('./routes/ownerRoutes');
const petRoutes = require('./routes/petRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const photoRoutes = require('./routes/photoRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const specialNeedRoutes = require('./routes/specialNeedRoutes');
const passportRoutes = require('./routes/passportRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/owners', ownerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api', dictionaryRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/special-needs', specialNeedRoutes);
app.use('/api/passports', passportRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;