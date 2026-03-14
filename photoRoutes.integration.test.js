const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
  await pool.query("INSERT INTO animal_type (type) VALUES ('Cat')");
  await pool.query("INSERT INTO breed (breed_name, id_animal_type) VALUES ('Siamese', 1)");
  await pool.query("INSERT INTO owner (owner_name, phone) VALUES ('John', '+1111111111')");
  await pool.query("INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ('Whiskers', 1, 1)");
});

describe('POST /api/photos', () => {
  it('should create a new photo', async () => {
    const newPhoto = { id_pet: 1, photo_url: 'photo_1.jpg' };
    const response = await request(app)
      .post('/api/photos')
      .send(newPhoto)
      .expect(201);

    expect(response.body).toHaveProperty('id_photo');
    expect(response.body.photo_url).toBe('photo_1.jpg');
  });

  it('should return 400 if photo_url missing', async () => {
    const response = await request(app)
      .post('/api/photos')
      .send({ id_pet: 1 })
      .expect(400);
    expect(response.body).toHaveProperty('error', 'Photo filename is required');
  });
});

describe('GET /api/photos', () => {
  it('should return photos for a pet', async () => {
    await pool.query("INSERT INTO photo (id_pet, photo_url) VALUES (1, 'photo_1.jpg')");
    const response = await request(app).get('/api/photos?petId=1').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].photo_url).toBe('photo_1.jpg');
  });
});

describe('DELETE /api/photos/:id', () => {
  it('should delete photo', async () => {
    const photo = await pool.query("INSERT INTO photo (id_pet, photo_url) VALUES (1, 'photo_1.jpg') RETURNING id_photo");
    const photoId = photo.rows[0].id_photo;

    const response = await request(app).delete(`/api/photos/${photoId}`).expect(200);
    expect(response.body).toHaveProperty('message', 'Photo deleted');
  });
});