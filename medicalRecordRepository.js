const pool = require('../config/db');

class MedicalRecordRepository {
  async findByPetId(petId) {
    const query = 'SELECT * FROM Medical_Record WHERE id_pet = $1 ORDER BY record_date DESC';
    const result = await pool.query(query, [petId]);
    return result.rows;
  }

  async create(data) {
    const { id_pet, record_date, record_type, notes } = data;
    const result = await pool.query(
      'INSERT INTO Medical_Record (id_pet, record_date, record_type, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pet, record_date, record_type, notes]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { record_date, record_type, notes } = data;
    const result = await pool.query(
      'UPDATE Medical_Record SET record_date = $1, record_type = $2, notes = $3 WHERE id_record = $4 RETURNING *',
      [record_date, record_type, notes, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM Medical_Record WHERE id_record = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = new MedicalRecordRepository();