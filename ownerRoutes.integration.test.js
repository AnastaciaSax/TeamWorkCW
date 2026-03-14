const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');
const { cleanupDatabase } = require('../../tests/helpers/cleanup');

beforeEach(async () => {
  await cleanupDatabase();
});

afterAll(() => {}); // пустой afterAll

describe('POST /api/owners', () => {
  it('should create a new owner', async () => {
    const newOwner = {
      owner_name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St'
    };

    const response = await request(app)
      .post('/api/owners')
      .send(newOwner)
      .expect(201);

    expect(response.body).toHaveProperty('id_owner');
    expect(response.body.owner_name).toBe('John Doe');

    const dbResult = await pool.query(
      'SELECT * FROM owner WHERE id_owner = $1',
      [response.body.id_owner]
    );
    expect(dbResult.rows[0].owner_name).toBe('John Doe');
  });

  it('should return 400 if phone already exists', async () => {
    await pool.query(
      `INSERT INTO owner (owner_name, phone) VALUES ($1, $2)`,
      ['Existing', '+1111111111']
    );

    const response = await request(app)
      .post('/api/owners')
      .send({ owner_name: 'Duplicate', phone: '+1111111111' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Phone number already exists');
  });
});

describe('GET /api/owners', () => {
  it('should return paginated list of owners', async () => {
    for (let i = 1; i <= 5; i++) {
      await pool.query(
        'INSERT INTO owner (owner_name, phone) VALUES ($1, $2)',
        [`User ${i}`, `+1${i}0000000`]
      );
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM owner');
    expect(parseInt(countRes.rows[0].count)).toBe(5);

    const response = await request(app)
      .get('/api/owners?page=1&limit=3')
      .expect(200);

    expect(response.body.data).toHaveLength(3);
    expect(response.body.pagination.total).toBe(5);
    expect(response.body.pagination.page).toBe(1);
  });

  it('should search owners by name', async () => {
    await pool.query(
      `INSERT INTO owner (owner_name, phone) VALUES 
       ('John Smith', '+1111'),
       ('Jane Doe', '+2222'),
       ('Bob Johnson', '+3333')`
    );

    const response = await request(app)
      .get('/api/owners?search=john')
      .expect(200);

    expect(response.body.data.length).toBe(2);
    const names = response.body.data.map(o => o.owner_name);
    expect(names).toContain('John Smith');
    expect(names).toContain('Bob Johnson');
  });
});

describe('DELETE /api/owners/:id', () => {
  it('should delete owner if no pets', async () => {
    const insert = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['ToDelete', '+1999999999']
    );
    const ownerId = insert.rows[0].id_owner;

    const response = await request(app)
      .delete(`/api/owners/${ownerId}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Owner deleted successfully');

    const check = await pool.query('SELECT * FROM owner WHERE id_owner = $1', [ownerId]);
    expect(check.rows.length).toBe(0);
  });

  it('should return 400 if owner has pets', async () => {
    const ownerRes = await pool.query(
      'INSERT INTO owner (owner_name, phone) VALUES ($1, $2) RETURNING id_owner',
      ['HasPet', '+1888888888']
    );
    const ownerId = ownerRes.rows[0].id_owner;

    const typeRes = await pool.query(
      'INSERT INTO animal_type (type) VALUES ($1) RETURNING id_type',
      ['Cat']
    );
    const typeId = typeRes.rows[0].id_type;

    const breedRes = await pool.query(
      'INSERT INTO breed (breed_name, id_animal_type) VALUES ($1, $2) RETURNING id_breed',
      ['TestBreed', typeId]
    );
    const breedId = breedRes.rows[0].id_breed;

    await pool.query(
      'INSERT INTO pet (pet_name, id_owner, id_breed) VALUES ($1, $2, $3)',
      ['TestPet', ownerId, breedId]
    );

    const response = await request(app)
      .delete(`/api/owners/${ownerId}`)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Cannot delete owner with existing pets');
  });
});