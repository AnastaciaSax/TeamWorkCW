const pool = require('../config/db');

class ReportService {
  async animalsByType() {
    const result = await pool.query(`
      SELECT Animal_Type.type, COUNT(Pet.id_pet) as count
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      GROUP BY Animal_Type.type
      ORDER BY Animal_Type.type
    `);
    return result.rows;
  }

  async ownerReport(ownerId) {
    // проверка существования владельца
    const ownerCheck = await pool.query('SELECT * FROM Owner WHERE id_owner = $1', [ownerId]);
    if (ownerCheck.rows.length === 0) throw new Error('Owner not found');

    const pets = await pool.query(
      `SELECT Pet.*,
        Breed.breed_name,
        Animal_Type.type as animal_type,
        Pet_Passport.id_passport,
        Pet_Passport.issue_date
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      LEFT JOIN Pet_Passport ON Pet.id_pet = Pet_Passport.id_pet
      WHERE Pet.id_owner = $1
      ORDER BY Pet.pet_name`,
      [ownerId]
    );

    const petsWithVaccinations = await Promise.all(pets.rows.map(async (pet) => {
      if (pet.id_passport) {
        const vaccs = await pool.query(
          `SELECT Vaccination.*, Vaccine.vaccine_name
          FROM Vaccination
          JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
          WHERE Vaccination.id_passport = $1
          ORDER BY vaccination_date DESC`,
          [pet.id_passport]
        );
        return { ...pet, vaccinations: vaccs.rows };
      }
      return { ...pet, vaccinations: [] };
    }));

    return {
      owner: ownerCheck.rows[0],
      pets: petsWithVaccinations,
    };
  }

  async expiringVaccinations(days = 30) {
    const result = await pool.query(
      `SELECT DISTINCT ON (Pet.id_pet)
        Pet.id_pet,
        Pet.pet_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        Vaccination.expiration_date,
        Vaccine.vaccine_name,
        Pet_Passport.id_passport
      FROM Pet
      JOIN Pet_Passport ON Pet.id_pet = Pet_Passport.id_pet
      JOIN Vaccination ON Pet_Passport.id_passport = Vaccination.id_passport
      JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Vaccination.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $1::integer)
      ORDER BY Pet.id_pet, Vaccination.expiration_date ASC`,
      [days]
    );
    return result.rows;
  }

  async expiredVaccinations() {
    const result = await pool.query(
      `SELECT DISTINCT ON (Pet.id_pet)
        Pet.id_pet,
        Pet.pet_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        Vaccination.expiration_date,
        Vaccine.vaccine_name,
        Pet_Passport.id_passport
      FROM Pet
      JOIN Pet_Passport ON Pet.id_pet = Pet_Passport.id_pet
      JOIN Vaccination ON Pet_Passport.id_passport = Vaccination.id_passport
      JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Vaccination.expiration_date < CURRENT_DATE
      ORDER BY Pet.id_pet, Vaccination.expiration_date DESC`
    );
    return result.rows;
  }
}

module.exports = new ReportService();