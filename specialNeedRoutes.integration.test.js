process.env.TZ = 'UTC';

const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await pool.query("SET timezone TO 'UTC';");
  await cleanupDatabase();
});

describe('POST /api/special-needs', () => {
  it('should create a new special need', async () => {
    // Создаём питомца
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

    const newNeed = {
      id_pet: petId,
      need_type: 'Diet',
      description: 'Grain-free food only'
    };

    const response = await request(app)
      .post('/api/special-needs')
      .send(newNeed)
      .expect(201);

    expect(response.body).toHaveProperty('id_need');
    expect(response.body.need_type).toBe('Diet');
    expect(response.body.description).toBe('Grain-free food only');
  });
});

describe('GET /api/special-needs', () => {
  it('should return special needs by petId', async () => {
    // Создаём питомца
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

    // Добавляем две записи
    await pool.query(
      'INSERT INTO special_need (id_pet, need_type, description) VALUES ($1, $2, $3), ($4, $5, $6)',
      [petId, 'Diet', 'Low fat', petId, 'Allergy', 'Chicken allergy']
    );

    const response = await request(app)
      .get(`/api/special-needs?petId=${petId}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('need_type');
  });
});

describe('PUT /api/special-needs/:id', () => {
  it('should update special need', async () => {
    // Создаём питомца и запись
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

    const needRes = await pool.query(
      'INSERT INTO special_need (id_pet, need_type, description) VALUES ($1, $2, $3) RETURNING id_need',
      [petId, 'Diet', 'Initial notes']
    );
    const needId = needRes.rows[0].id_need;

    // Обновляем запись
    const updated = {
      need_type: 'Medication',
      description: 'Daily supplement'
    };

    const response = await request(app)
      .put(`/api/special-needs/${needId}`)
      .send(updated)
      .expect(200);

    expect(response.body.need_type).toBe('Medication');
    expect(response.body.description).toBe('Daily supplement');
  });
});

describe('DELETE /api/special-needs/:id', () => {
  it('should delete special need', async () => {
    // Создаём питомца и запись
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

    const needRes = await pool.query(
      'INSERT INTO special_need (id_pet, need_type, description) VALUES ($1, $2, $3) RETURNING id_need',
      [petId, 'Diet', 'To delete']
    );
    const needId = needRes.rows[0].id_need;

    const response = await request(app)
      .delete(`/api/special-needs/${needId}`)
      .expect(200);
    expect(response.body).toHaveProperty('message', 'Need deleted');
  });
});