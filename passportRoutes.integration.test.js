const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
});

describe('POST /api/passports', () => {
  it('should create a new passport', async () => {
    // Сначала нужно создать животное
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
      ['John', '+111111111']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Fluffy', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const newPassport = {
      id_pet: petId,
      issue_date: '2023-01-01'
    };

    const response = await request(app)
      .post('/api/passports')
      .send(newPassport)
      .expect(201);

    expect(response.body).toHaveProperty('id_passport');
    // Используем toLocaleDateString с локалью 'en-CA' для получения YYYY-MM-DD
    expect(new Date(response.body.issue_date).toLocaleDateString('en-CA')).toBe('2023-01-01');
  });
});

describe('GET /api/passports', () => {
  it('should return passport by petId if exists', async () => {
    // Создаём животное и паспорт
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
      ['Jane', '+222222222']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Buddy', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2)',
      [petId, '2023-01-01']
    );

    const response = await request(app)
      .get(`/api/passports?petId=${petId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id_passport');
    expect(new Date(response.body.issue_date).toLocaleDateString('en-CA')).toBe('2023-01-01');
  });

  it('should return null if no passport', async () => {
    const response = await request(app)
      .get('/api/passports?petId=999')
      .expect(200);
    expect(response.body).toBeNull();
  });
});

describe('GET /api/passports/search', () => {
  it('should find passport by number with pet and owner info', async () => {
    // Создаём данные
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Cat']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Persian', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['Tom', '+333333333']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Garfield', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-05-15']
    );
    const passportId = passportRes.rows[0].id_passport;

    const response = await request(app)
      .get(`/api/passports/search?number=${passportId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id_passport', passportId);
    expect(response.body).toHaveProperty('pet_name', 'Garfield');
    expect(response.body).toHaveProperty('owner_name', 'Tom');
    expect(response.body).toHaveProperty('owner_phone', '+333333333');
    expect(new Date(response.body.issue_date).toLocaleDateString('en-CA')).toBe('2023-05-15');
  });

  it('should return 404 if passport not found', async () => {
    const response = await request(app)
      .get('/api/passports/search?number=999')
      .expect(404);
    expect(response.body).toHaveProperty('error', 'Passport not found');
  });
});

describe('DELETE /api/passports/:id', () => {
  it('should delete passport', async () => {
    // Создаём данные
    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Dog']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Beagle', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['ToDelete', '+444444444']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['PetToDelete', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    const passportRes = await pool.query(
      'INSERT INTO pet_passport (id_pet, issue_date) VALUES ($1, $2) RETURNING id_passport',
      [petId, '2023-06-01']
    );
    const passportId = passportRes.rows[0].id_passport;

    const response = await request(app)
      .delete(`/api/passports/${passportId}`)
      .expect(200);
    expect(response.body).toHaveProperty('message', 'Passport deleted');
  });
});