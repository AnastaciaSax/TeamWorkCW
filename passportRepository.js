const pool = require('../config/db');

class PassportRepository {
  async findByPetId(petId) {
    const result = await pool.query('SELECT * FROM Pet_Passport WHERE id_pet = $1', [petId]);
    return result.rows[0];
  }

  async searchByNumber(number) {
    const query = `
      SELECT Pet_Passport.*,
        Pet.pet_name,
        Pet.birthdate,
        Pet.gender,
        Owner.owner_name,
        Owner.phone as owner_phone
      FROM Pet_Passport
      JOIN Pet ON Pet_Passport.id_pet = Pet.id_pet
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Pet_Passport.id_passport = $1
    `;
    const result = await pool.query(query, [number]);
    return result.rows[0];
  }

  async create(data) {
    const { id_pet, issue_date } = data;
    const result = await pool.query(
      'INSERT INTO Pet_Passport (issue_date, id_pet) VALUES ($1, $2) RETURNING *',
      [issue_date, id_pet]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM Pet_Passport WHERE id_passport = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = new PassportRepository();