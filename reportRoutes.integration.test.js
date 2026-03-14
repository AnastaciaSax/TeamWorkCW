process.env.TZ = 'UTC';

const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await pool.query("SET timezone TO 'UTC';");
  await cleanupDatabase();
});

describe('GET /api/reports/animals-by-type', () => {
  it('should return count per animal type', async () => {
    // Добавляем данные для отчёта
    const typeRes1 = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Cat']
    );
    const typeId1 = typeRes1.rows[0].id_type;

    const typeRes2 = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Dog']
    );
    const typeId2 = typeRes2.rows[0].id_type;

    const breedRes1 = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Siamese', typeId1]
    );
    const breedId1 = breedRes1.rows[0].id_breed;

    const breedRes2 = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Labrador', typeId2]
    );
    const breedId2 = breedRes2.rows[0].id_breed;

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['John', '+123456789']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3)',
      ['CatPet', ownerId, breedId1]
    );
    await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3)',
      ['DogPet', ownerId, breedId2]
    );

    const response = await request(app).get('/api/reports/animals-by-type').expect(200);

    // Преобразуем count в число, если пришло строкой (PostgreSQL может возвращать строки)
    const data = response.body.map(item => ({
      type: item.type,
      count: Number(item.count)
    }));

    expect(data).toEqual(expect.arrayContaining([
      { type: 'Cat', count: 1 },
      { type: 'Dog', count: 1 }
    ]));
  });
});

describe('GET /api/reports/owner/:id', () => {
  it('should return owner report with pets and vaccinations', async () => {
    // Создаём владельца
    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['Jane', '+987654321']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    // Создаём типы, породы
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

    // Создаём питомца
    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Buddy', ownerId, breedId]
    );
    const petId = petRes.rows[0].id_pet;

    // Создаём паспорт и прививку
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

    await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date) VALUES ($1, $2, $3, $4)',
      [passportId, vaccineId, '2023-06-01', '2024-06-01']
    );

    const response = await request(app)
      .get(`/api/reports/owner/${ownerId}`)
      .expect(200);

    expect(response.body).toHaveProperty('owner');
    expect(response.body.owner.id_owner).toBe(ownerId);
    expect(response.body.pets).toHaveLength(1);
    expect(response.body.pets[0].pet_name).toBe('Buddy');
    expect(response.body.pets[0].vaccinations).toHaveLength(1);
    expect(response.body.pets[0].vaccinations[0].vaccine_name).toBe('Rabies');
  });

  it('should return 404 if owner not found', async () => {
    const response = await request(app).get('/api/reports/owner/999').expect(404);
    expect(response.body).toHaveProperty('error', 'Owner not found');
  });
});

describe('GET /api/reports/expiring-vaccinations', () => {
  it('should return pets with expiring vaccinations', async () => {
    // Создаём данные с истекающей прививкой (сегодня + 15 дней)
    const today = new Date().toISOString().split('T')[0];
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 15);
    const expiringDateStr = expiringDate.toISOString().split('T')[0];

    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['ExpiringOwner', '+111111111']
    );
    const ownerId = ownerRes.rows[0].id_owner;

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

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['ExpiringPet', ownerId, breedId]
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

    await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date) VALUES ($1, $2, $3, $4)',
      [passportId, vaccineId, today, expiringDateStr]
    );

    const response = await request(app)
      .get('/api/reports/expiring-vaccinations?days=30')
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('pet_name', 'ExpiringPet');
  });
});

describe('GET /api/reports/expired-vaccinations', () => {
  it('should return pets with expired vaccinations', async () => {
    // Создаём данные с просроченной прививкой
    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['ExpiredOwner', '+222222222']
    );
    const ownerId = ownerRes.rows[0].id_owner;

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

    const petRes = await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['ExpiredPet', ownerId, breedId]
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

    // Дата истечения в прошлом (например, год назад)
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() - 1);
    const expiredDateStr = expiredDate.toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date) VALUES ($1, $2, $3, $4)',
      [passportId, vaccineId, '2022-01-01', expiredDateStr]
    );

    const response = await request(app)
      .get('/api/reports/expired-vaccinations')
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('pet_name', 'ExpiredPet');
  });
});