const pool = require('../config/db');

class AnimalTypeRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM Animal_Type ORDER BY type');
    return result.rows;
  }
}

module.exports = new AnimalTypeRepository();