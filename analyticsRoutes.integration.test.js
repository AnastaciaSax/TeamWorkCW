const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
  // Создаём немного данных
  await pool.query("INSERT INTO owner (owner_name, phone) VALUES ('John', '+1111'), ('Jane', '+2222')");
  await pool.query("INSERT INTO animal_type (type) VALUES ('Cat')");
  await pool.query("INSERT INTO breed (breed_name, id_animal_type) VALUES ('Siamese', 1)");
  await pool.query("INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ('Whiskers', 1, 1)");
  await pool.query("INSERT INTO pet_passport (issue_date, id_pet) VALUES ('2023-01-01', 1)");
  await pool.query("INSERT INTO vaccine (vaccine_name) VALUES ('Rabies')");
  await pool.query(
    "INSERT INTO vaccination (id_passport, id_vaccine, vaccination_date, expiration_date) VALUES (1, 1, CURRENT_DATE, CURRENT_DATE + 15)"
  );
});

describe('GET /api/analytics/summary', () => {
  it('should return summary data', async () => {
    const response = await request(app).get('/api/analytics/summary').expect(200);
    expect(response.body).toHaveProperty('owners', 2);
    expect(response.body).toHaveProperty('pets', 1);
    expect(response.body.expiringVaccinations).toBeDefined();
  });
});