const pool = require('../config/db');

class AnalyticsService {
  async getSummary() {
    const ownersCount = await pool.query('SELECT COUNT(*) FROM Owner');
    const petsCount = await pool.query('SELECT COUNT(*) FROM Pet');
    const expiringVaccinations = await pool.query(
      `SELECT COUNT(*) FROM Vaccination 
       WHERE expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 30)`
    );
    return {
      owners: parseInt(ownersCount.rows[0].count),
      pets: parseInt(petsCount.rows[0].count),
      expiringVaccinations: parseInt(expiringVaccinations.rows[0].count),
    };
  }
}

module.exports = new AnalyticsService();