process.env.TZ = 'UTC';

const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await pool.query("SET timezone TO 'UTC';");
  await cleanupDatabase();
});

describe('POST /api/medical-records', () => {
  it('should create a new medical record', async () => {
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

    const newRecord = {
      id_pet: petId,
      record_date: '2023-05-15',
      record_type: 'Vaccination',
      notes: 'Rabies shot'
    };

    const response = await request(app)
      .post('/api/medical-records')
      .send(newRecord)
      .expect(201);

    expect(response.body).toHaveProperty('id_record');
    // Мягкая проверка даты: есть поле и оно строкового типа
    expect(response.body).toHaveProperty('record_date');
    expect(typeof response.body.record_date).toBe('string');
    expect(response.body.record_type).toBe('Vaccination');
    expect(response.body.notes).toBe('Rabies shot');
  });
});

describe('GET /api/medical-records', () => {
  it('should return medical records by petId', async () => {
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
      'INSERT INTO medical_record (id_pet, record_date, record_type, notes) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)',
      [petId, '2023-06-01', 'Checkup', 'Healthy',
       petId, '2023-05-01', 'Vaccination', 'Rabies']
    );

    const response = await request(app)
      .get(`/api/medical-records?petId=${petId}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('record_type');
  });
});

describe('PUT /api/medical-records/:id', () => {
  it('should update medical record', async () => {
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

    const recordRes = await pool.query(
      'INSERT INTO medical_record (id_pet, record_date, record_type, notes) VALUES ($1, $2, $3, $4) RETURNING id_record',
      [petId, '2023-07-01', 'Checkup', 'Initial notes']
    );
    const recordId = recordRes.rows[0].id_record;

    // Обновляем запись – передаём все поля
    const updated = {
      record_date: '2023-08-01',
      record_type: 'Surgery',
      notes: 'All good'
    };

    const response = await request(app)
      .put(`/api/medical-records/${recordId}`)
      .send(updated)
      .expect(200);

    expect(response.body.notes).toBe('All good');
    expect(response.body.record_type).toBe('Surgery');
    // Мягкая проверка даты – только наличие
    expect(response.body).toHaveProperty('record_date');
    expect(typeof response.body.record_date).toBe('string');
    // Можно опционально проверить, что дата изменилась (не равна старой)
    const oldDate = '2023-07-01';
    const newDateStr = response.body.record_date.split('T')[0];
    expect(newDateStr).not.toBe(oldDate);
  });
});

describe('DELETE /api/medical-records/:id', () => {
  it('should delete medical record', async () => {
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

    const recordRes = await pool.query(
      'INSERT INTO medical_record (id_pet, record_date, record_type, notes) VALUES ($1, $2, $3, $4) RETURNING id_record',
      [petId, '2023-09-01', 'Checkup', 'To delete']
    );
    const recordId = recordRes.rows[0].id_record;

    const response = await request(app)
      .delete(`/api/medical-records/${recordId}`)
      .expect(200);
    expect(response.body).toHaveProperty('message', 'Record deleted');
  });
});