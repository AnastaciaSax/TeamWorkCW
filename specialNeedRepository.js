const pool = require('../config/db');

class SpecialNeedRepository {
  async findByPetId(petId) {
    const query = 'SELECT * FROM Special_Need WHERE id_pet = $1 ORDER BY need_type';
    const result = await pool.query(query, [petId]);
    return result.rows;
  }

  async create(data) {
    const { id_pet, need_type, description } = data;
    const result = await pool.query(
      'INSERT INTO Special_Need (id_pet, need_type, description) VALUES ($1, $2, $3) RETURNING *',
      [id_pet, need_type, description]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { need_type, description } = data;
    const result = await pool.query(
      'UPDATE Special_Need SET need_type = $1, description = $2 WHERE id_need = $3 RETURNING *',
      [need_type, description, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM Special_Need WHERE id_need = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = new SpecialNeedRepository();