process.env.TZ = 'UTC';

const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await pool.query("SET timezone TO 'UTC';");
  await cleanupDatabase();
});

describe('POST /api/vaccinations', () => {
  it('should create a new vaccination', async () => {
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Cat']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Siamese', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['John', '+123456789']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Fluffy', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-01-01']
    );
    const passportId = passportRes.rows[0].id_passport;

    const vaccineRes = await pool.query(
      'INSERT INTO vaccine (vaccine_name) VALUES ($1) RETURNING id_vaccine',
      ['Rabies']
    );
    const vaccineId = vaccineRes.rows[0].id_vaccine;

    const newVaccination = {
      id_passport: passportId,
      id_vaccine: vaccineId,
      vaccination_date: '2023-06-01',
      expiration_date: '2024-06-01',
      notes: 'First rabies shot'
    };

    const response = await request(app)
      .post('/api/vaccinations')
      .send(newVaccination)
      .expect(201);

    expect(response.body).toHaveProperty('id_vaccination');
    expect(response.body).toHaveProperty('vaccination_date');
    expect(typeof response.body.vaccination_date).toBe('string');
    expect(response.body.vaccination_date).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(response.body.notes).toBe('First rabies shot');
  });
});

describe('GET /api/vaccinations', () => {
  it('should return vaccinations by passportId', async () => {
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Dog']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Labrador', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['Jane', '+987654321']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Buddy', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-02-02']
    );
    const passportId = passportRes.rows[0].id_passport;

    const vaccineRes = await pool.query(
      'INSERT INTO vaccine (vaccine_name) VALUES ($1), ($2) RETURNING id_vaccine',
      ['Rabies', 'Distemper']
    );
    const vaccineIds = vaccineRes.rows;

    await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date, notes) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)',
      [passportId, vaccineIds[0].id_vaccine, '2023-06-01', '2024-06-01', 'Rabies',
       passportId, vaccineIds[1].id_vaccine, '2023-05-15', '2024-05-15', 'Distemper']
    );

    const response = await request(app)
      .get(`/api/vaccinations?passportId=${passportId}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('vaccine_name');
  });
});

describe('PUT /api/vaccinations/:id', () => {
  it('should update vaccination', async () => {
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Bird']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Parrot', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['Alice', '+555555555']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Tweety', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-03-03']
    );
    const passportId = passportRes.rows[0].id_passport;

    const vaccineRes = await pool.query(
      'INSERT INTO vaccine (vaccine_name) VALUES ($1) RETURNING id_vaccine',
      ['Avian Flu']
    );
    const vaccineId = vaccineRes.rows[0].id_vaccine;

    const vaccRes = await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id_vaccination',
      [passportId, vaccineId, '2023-07-01', '2024-07-01', 'Initial notes']
    );
    const vaccId = vaccRes.rows[0].id_vaccination;

    const updated = {
      id_vaccine: vaccineId,
      vaccination_date: '2023-08-01',
      expiration_date: '2024-08-01',
      notes: 'Updated notes'
    };

    const response = await request(app)
      .put(`/api/vaccinations/${vaccId}`)
      .send(updated)
      .expect(200);

    expect(response.body.notes).toBe('Updated notes');
    expect(response.body).toHaveProperty('vaccination_date');
    expect(typeof response.body.vaccination_date).toBe('string');
    // Проверяем, что дата изменилась (не равна старой)
    expect(response.body.vaccination_date.split('T')[0]).not.toBe('2023-07-01');
  });
});

describe('DELETE /api/vaccinations/:id', () => {
  it('should delete vaccination', async () => {
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Fish']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Goldfish', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['Bob', '+666666666']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Nemo', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-04-04']
    );
    const passportId = passportRes.rows[0].id_passport;

    const vaccineRes = await pool.query(
      'INSERT INTO vaccine (vaccine_name) VALUES ($1) RETURNING id_vaccine',
      ['Fish Vaccine']
    );
    const vaccineId = vaccineRes.rows[0].id_vaccine;

    const vaccRes = await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date) VALUES ($1, $2, $3, $4) RETURNING id_vaccination',
      [passportId, vaccineId, '2023-09-01', '2024-09-01']
    );
    const vaccId = vaccRes.rows[0].id_vaccination;

    const response = await request(app)
      .delete(`/api/vaccinations/${vaccId}`)
      .expect(200);
    expect(response.body).toHaveProperty('message', 'Vaccination deleted');
  });
});