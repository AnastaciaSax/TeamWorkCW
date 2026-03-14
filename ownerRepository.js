const pool = require('../config/db');

class OwnerRepository {
  async count(searchPattern) {
    const query = `
      SELECT COUNT(*) FROM Owner
      WHERE owner_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
    `;
    const result = await pool.query(query, [searchPattern]);
    return parseInt(result.rows[0].count);
  }

  async findAll(searchPattern, sortBy, sortOrder, limit, offset) {
    const query = `
      SELECT Owner.*,
        (SELECT COUNT(*) FROM Pet WHERE Pet.id_owner = Owner.id_owner) as pets_count
      FROM Owner
      WHERE owner_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
      ORDER BY ${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [searchPattern, limit, offset]);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT Owner.*,
        (SELECT COUNT(*) FROM Pet WHERE Pet.id_owner = Owner.id_owner) as pets_count
      FROM Owner WHERE id_owner = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async create(data) {
    const { owner_name, phone, email, address } = data;
    const query = `
      INSERT INTO Owner (owner_name, phone, email, address)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await pool.query(query, [owner_name, phone, email, address]);
    return result.rows[0];
  }

  async update(id, data) {
    const { owner_name, phone, email, address } = data;
    const query = `
      UPDATE Owner SET owner_name = $1, phone = $2, email = $3, address = $4
      WHERE id_owner = $5 RETURNING *
    `;
    const result = await pool.query(query, [owner_name, phone, email, address, id]);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM Owner WHERE id_owner = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async checkPets(id) {
    const query = 'SELECT id_pet FROM Pet WHERE id_owner = $1';
    const result = await pool.query(query, [id]);
    return result.rows;
  }
}

module.exports = new OwnerRepository();