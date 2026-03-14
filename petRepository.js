const pool = require('../config/db');

class PetRepository {
  async count(whereClause, values) {
    const countQuery = `
      SELECT COUNT(*) FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      ${whereClause}
    `;
    const result = await pool.query(countQuery, values);
    return parseInt(result.rows[0].count);
  }

  async findAll(whereClause, values, sortBy, sortOrder, limit, offset) {
    const dataQuery = `
      SELECT Pet.*,
        Breed.breed_name,
        Breed.id_animal_type,
        Animal_Type.type as animal_type_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        (SELECT photo_url FROM Photo WHERE Photo.id_pet = Pet.id_pet ORDER BY upload_date LIMIT 1) as main_photo_url,
        (SELECT COUNT(*) FROM Photo WHERE Photo.id_pet = Pet.id_pet) as photos_count
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    const finalValues = [...values, limit, offset];
    const result = await pool.query(dataQuery, finalValues);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT Pet.*,
        Breed.breed_name,
        Breed.id_animal_type,
        Animal_Type.type as animal_type_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        Owner.email as owner_email,
        Owner.address as owner_address
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Pet.id_pet = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async create(data) {
    const { pet_name, birthdate, gender, unique_traits, id_owner, id_breed } = data;
    const query = `
      INSERT INTO Pet (pet_name, birthdate, gender, unique_traits, id_owner, id_breed)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const result = await pool.query(query, [pet_name, birthdate, gender, unique_traits, id_owner, id_breed]);
    return result.rows[0];
  }

  async update(id, data) {
    const { pet_name, birthdate, gender, unique_traits, id_owner, id_breed } = data;
    const query = `
      UPDATE Pet SET pet_name = $1, birthdate = $2, gender = $3, unique_traits = $4,
        id_owner = $5, id_breed = $6 WHERE id_pet = $7 RETURNING *
    `;
    const result = await pool.query(query, [pet_name, birthdate, gender, unique_traits, id_owner, id_breed, id]);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM Pet WHERE id_pet = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new PetRepository();