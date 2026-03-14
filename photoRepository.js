const pool = require('../config/db');

class PhotoRepository {
  async findByPetId(petId) {
    const query = 'SELECT * FROM Photo WHERE id_pet = $1 ORDER BY upload_date DESC';
    const result = await pool.query(query, [petId]);
    return result.rows;
  }

  async create(data) {
    const { id_pet, photo_url } = data;
    const result = await pool.query(
      'INSERT INTO Photo (id_pet, photo_url, upload_date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [id_pet, photo_url]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM Photo WHERE id_photo = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = new PhotoRepository();