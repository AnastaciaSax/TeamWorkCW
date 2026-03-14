const request = require('supertest');
const app = require('../../app');
const pool  = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
});

describe('POST /api/pets', () => {
  it('should create a new pet', async () => {
    // Создаём тип
    const typeRes = await pool .query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Cat']
    );
    expect(typeRes.rows).toHaveLength(1);
    const typeId = typeRes.rows[0].id_type;

    // Создаём породу
    const breedRes = await pool .query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Siamese', typeId]
    );
    expect(breedRes.rows).toHaveLength(1);
    const breedId = breedRes.rows[0].id_breed;

    // Создаём владельца
    const ownerRes = await pool .query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['John Doe', '+123456789']
    );
    expect(ownerRes.rows).toHaveLength(1);
    const ownerId = ownerRes.rows[0].id_owner;

    const newPet = {
      pet_name: 'Whiskers',
      birthdate: '2020-01-01',
      gender: 'Male',
      unique_traits: 'Likes to sleep',
      id_owner: ownerId,
      id_breed: breedId
    };

    const response = await request(app)
      .post('/api/pets')
      .send(newPet)
      .expect(201);

    expect(response.body).toHaveProperty('id_pet');
    expect(response.body.pet_name).toBe('Whiskers');

    const dbResult = await pool .query('SELECT * FROM pet WHERE id_pet = $1', [response.body.id_pet]);
    expect(dbResult.rows[0].pet_name).toBe('Whiskers');
  });

  it('should return 400 if owner not found', async () => {
    const typeRes = await pool .query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Dog']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool .query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['Labrador', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    const newPet = {
      pet_name: 'Buddy',
      id_owner: 999,
      id_breed: breedId
    };

    const response = await request(app)
      .post('/api/pets')
      .send(newPet)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Owner not found');
  });
});

describe('GET /api/pets', () => {
  it('should return paginated list of pets with filters', async () => {
    // Создаём тип
    const typeRes = await pool .query('INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type', ['Dog']);
    expect(typeRes.rows).toHaveLength(1);
    const typeId = typeRes.rows[0].id_type;

    // Создаём породу
    const breedRes = await pool .query('INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed', ['Labrador', typeId]);
    expect(breedRes.rows).toHaveLength(1);
    const breedId = breedRes.rows[0].id_breed;

    // Создаём владельца
    const ownerRes = await pool .query('INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner', ['Jane', '+1111']);
    expect(ownerRes.rows).toHaveLength(1);
    const ownerId = ownerRes.rows[0].id_owner;

    for (let i = 1; i <= 5; i++) {
      await pool .query(
        'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3)',
        [`Pet${i}`, ownerId, breedId]
      );
    }

    const response = await request(app)
      .get('/api/pets?page=1&limit=3')
      .expect(200);

    expect(response.body.data).toHaveLength(3);
    expect(response.body.pagination.total).toBe(5);
    expect(response.body.pagination.page).toBe(1);
  });
});

describe('GET /api/pets/:id', () => {
  it('should return pet details', async () => {
    const typeRes = await pool .query('INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type', ['Cat']);
    expect(typeRes.rows).toHaveLength(1);
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool .query('INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed', ['Persian', typeId]);
    expect(breedRes.rows).toHaveLength(1);
    const breedId = breedRes.rows[0].id_breed;

const ownerRes = await pool.query(
  'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
  ['Tom', 'Tom-2222'] // уникальный телефон
);
    expect(ownerRes.rows).toHaveLength(1);
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool .query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Garfield', ownerId, breedId]
    );
    expect(petRes.rows).toHaveLength(1);
    const petId = petRes.rows[0].id_pet;

    const response = await request(app)
      .get(`/api/pets/${petId}`)
      .expect(200);

    expect(response.body).toHaveProperty('pet_name', 'Garfield');
    expect(response.body).toHaveProperty('owner_name', 'Tom');
    expect(response.body).toHaveProperty('breed_name', 'Persian');
  });

  it('should return 404 if pet not found', async () => {
    const response = await request(app)
      .get('/api/pets/999')
      .expect(404);
    expect(response.body).toHaveProperty('error', 'Pet not found');
  });
});

describe('PUT /api/pets/:id', () => {
  it('should update pet', async () => {
    const typeRes = await pool .query('INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type', ['Dog']);
    expect(typeRes.rows).toHaveLength(1);
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool .query('INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed', ['Beagle', typeId]);
    expect(breedRes.rows).toHaveLength(1);
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool .query('INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner', ['Snoopy', '+3333']);
    expect(ownerRes.rows).toHaveLength(1);
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool .query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['Snoopy', ownerId, breedId]
    );
    expect(petRes.rows).toHaveLength(1);
    const petId = petRes.rows[0].id_pet;

    const updatedData = {
      pet_name: 'Snoopy Updated',
      birthdate: '2020-01-01',
      gender: 'Male',
      unique_traits: 'Likes to sleep',
      id_owner: ownerId,
      id_breed: breedId
    };

    const response = await request(app)
      .put(`/api/pets/${petId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.pet_name).toBe('Snoopy Updated');
  });
});

describe('DELETE /api/pets/:id', () => {
  it('should delete pet', async () => {
    const typeRes = await pool .query('INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type', ['Dog']);
    expect(typeRes.rows).toHaveLength(1);
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool .query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['TempBreed', typeId]
    );
    expect(breedRes.rows).toHaveLength(1);
    const breedId = breedRes.rows[0].id_breed;

    const ownerRes = await pool .query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['ToDelete', '+4444']
    );
    expect(ownerRes.rows).toHaveLength(1);
    const ownerId = ownerRes.rows[0].id_owner;

    const petRes = await pool .query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3) RETURNING id_pet',
      ['TempPet', ownerId, breedId]
    );
    expect(petRes.rows).toHaveLength(1);
    const petId = petRes.rows[0].id_pet;

    const response = await request(app)
      .delete(`/api/pets/${petId}`)
      .expect(200);
    expect(response.body).toHaveProperty('message', 'Pet deleted successfully');
  });
});