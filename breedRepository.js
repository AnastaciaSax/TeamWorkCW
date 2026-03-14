const pool = require('../config/db');

class BreedRepository {
  async findAll(animalTypeId) {
    let query = 'SELECT Breed.*, Animal_Type.type as animal_type_name FROM Breed JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type';
    const params = [];
    if (animalTypeId) {
      query += ' WHERE Breed.id_animal_type = $1';
      params.push(animalTypeId);
    }
    query += ' ORDER BY Breed.breed_name';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id) {
    const query = 'SELECT * FROM Breed WHERE id_breed = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new BreedRepository();