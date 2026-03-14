const pool = require('../config/db');

class VaccinationRepository {
  async findByPassportId(passportId) {
    const query = `
      SELECT Vaccination.*, Vaccine.vaccine_name
      FROM Vaccination
      JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
      WHERE Vaccination.id_passport = $1
      ORDER BY vaccination_date DESC
    `;
    const result = await pool.query(query, [passportId]);
    return result.rows;
  }

  async create(data) {
    const { id_passport, id_vaccine, vaccination_date, expiration_date, notes } = data;
    const result = await pool.query(
      'INSERT INTO Vaccination (id_passport, id_vaccine, vaccination_date, expiration_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_passport, id_vaccine, vaccination_date, expiration_date, notes]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { id_vaccine, vaccination_date, expiration_date, notes } = data;
    const result = await pool.query(
      'UPDATE Vaccination SET id_vaccine = $1, vaccination_date = $2, expiration_date = $3, notes = $4 WHERE id_vaccination = $5 RETURNING *',
      [id_vaccine, vaccination_date, expiration_date, notes, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM Vaccination WHERE id_vaccination = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = new VaccinationRepository();