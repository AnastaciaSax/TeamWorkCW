const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
  // Заполняем тестовыми данными
  await pool.query("INSERT INTO animal_type (type) VALUES ('Cat'), ('Dog')");
  await pool.query("INSERT INTO vaccine (vaccine_name) VALUES ('Rabies'), ('Parvo')");
  await pool.query("INSERT INTO breed (breed_name, id_animal_type) VALUES ('Siamese', 1), ('Labrador', 2)");
});

describe('GET /api/animal-types', () => {
  it('should return list of animal types', async () => {
    const response = await request(app).get('/api/animal-types').expect(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('type');
  });
});

describe('GET /api/breeds', () => {
  it('should return all breeds when no filter', async () => {
    const response = await request(app).get('/api/breeds').expect(200);
    expect(response.body).toHaveLength(2);
  });

  it('should return breeds filtered by animalTypeId', async () => {
    const response = await request(app).get('/api/breeds?animalTypeId=1').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].breed_name).toBe('Siamese');
  });
});

describe('GET /api/vaccines', () => {
  it('should return list of vaccines', async () => {
    const response = await request(app).get('/api/vaccines').expect(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('vaccine_name');
  });
});