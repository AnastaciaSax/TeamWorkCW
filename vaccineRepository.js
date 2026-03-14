const pool = require('../config/db');

class VaccineRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM Vaccine ORDER BY vaccine_name');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM Vaccine WHERE id_vaccine = $1', [id]);
    return result.rows[0];
  }
}

module.exports = new VaccineRepository();