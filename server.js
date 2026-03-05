// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// ==================== ВЛАДЕЛЬЦЫ (OWNERS) ====================

// GET /api/owners – список владельцев с пагинацией, поиском, сортировкой
app.get('/api/owners', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'owner_name', sortOrder = 'asc' } = req.query;
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    // Подсчёт общего количества записей (для пагинации)
    const countQuery = `
      SELECT COUNT(*) FROM Owner
      WHERE owner_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
    `;
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    // Основной запрос с сортировкой и пагинацией
    const dataQuery = `
      SELECT Owner.*,
        (SELECT COUNT(*) FROM Pet WHERE Pet.id_owner = Owner.id_owner) as pets_count
      FROM Owner
      WHERE owner_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
      ORDER BY ${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;
    const dataResult = await pool.query(dataQuery, [searchPattern, limit, offset]);

    res.json({
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/owners/:id – один владелец
app.get('/api/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT Owner.*,
        (SELECT COUNT(*) FROM Pet WHERE Pet.id_owner = Owner.id_owner) as pets_count
       FROM Owner WHERE id_owner = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/owners – создание владельца
app.post('/api/owners', async (req, res) => {
  try {
    const { owner_name, phone, email, address } = req.body;
    const result = await pool.query(
      'INSERT INTO Owner (owner_name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [owner_name, phone, email, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // уникальность phone
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/owners/:id – обновление владельца
app.put('/api/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_name, phone, email, address } = req.body;
    const result = await pool.query(
      'UPDATE Owner SET owner_name = $1, phone = $2, email = $3, address = $4 WHERE id_owner = $5 RETURNING *',
      [owner_name, phone, email, address, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/owners/:id – удаление владельца
app.delete('/api/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Проверка, есть ли у владельца животные
    const petCheck = await pool.query('SELECT id_pet FROM Pet WHERE id_owner = $1', [id]);
    if (petCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete owner with existing pets' });
    }
    const result = await pool.query('DELETE FROM Owner WHERE id_owner = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json({ message: 'Owner deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== СПРАВОЧНИКИ ====================

// GET /api/animal-types – список видов животных
app.get('/api/animal-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Animal_Type ORDER BY type');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/breeds – список пород (можно фильтровать по виду)
app.get('/api/breeds', async (req, res) => {
  try {
    const { animalTypeId } = req.query;
    let query = 'SELECT Breed.*, Animal_Type.type as animal_type_name FROM Breed JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type';
    const params = [];
    if (animalTypeId) {
      query += ' WHERE Breed.id_animal_type = $1';
      params.push(animalTypeId);
    }
    query += ' ORDER BY Breed.breed_name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/vaccines – список вакцин
app.get('/api/vaccines', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Vaccine ORDER BY vaccine_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ЖИВОТНЫЕ (PET) – базовые эндпоинты ====================

// GET /api/pets – список животных с пагинацией, фильтрами, поиском
app.get('/api/pets', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      animalTypeId,
      breedId,
      gender,
      ageGroup, // 'puppy', 'young', 'adult'
      sortBy = 'pet_name',
      sortOrder = 'asc',
    } = req.query;

    const offset = (page - 1) * limit;
    const values = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      values.push(`%${search}%`);
      whereClause += ` AND Pet.pet_name ILIKE $${values.length}`;
    }
    if (animalTypeId) {
      values.push(animalTypeId);
      whereClause += ` AND Breed.id_animal_type = $${values.length}`;
    }
    if (breedId) {
      values.push(breedId);
      whereClause += ` AND Pet.id_breed = $${values.length}`;
    }
    if (gender) {
      values.push(gender);
      whereClause += ` AND Pet.gender = $${values.length}`;
    }
    // Возрастная группа вычисляется на основе birthdate
    if (ageGroup) {
      const today = new Date().toISOString().split('T')[0];
      if (ageGroup === 'puppy') {
        whereClause += ` AND Pet.birthdate > (CURRENT_DATE - INTERVAL '1 year')`;
      } else if (ageGroup === 'young') {
        whereClause += ` AND Pet.birthdate <= (CURRENT_DATE - INTERVAL '1 year') AND Pet.birthdate > (CURRENT_DATE - INTERVAL '3 years')`;
      } else if (ageGroup === 'adult') {
        whereClause += ` AND Pet.birthdate <= (CURRENT_DATE - INTERVAL '3 years')`;
      }
    }

    // Подсчёт общего количества
    const countQuery = `
      SELECT COUNT(*) FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Основной запрос с JOIN для получения породы, вида, владельца
    const dataQuery = `
      SELECT Pet.*,
        Breed.breed_name,
        Breed.id_animal_type,
        Animal_Type.type as animal_type_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        (SELECT COUNT(*) FROM Photo WHERE Photo.id_pet = Pet.id_pet) as photos_count
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const finalValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, finalValues);

    res.json({
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pets/:id – детальная информация о животном
app.get('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT Pet.*,
        Breed.breed_name,
        Breed.id_animal_type,
        Animal_Type.type as animal_type_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        Owner.email as owner_email,
        Owner.address as owner_address
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Pet.id_pet = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/pets – создание животного
app.post('/api/pets', async (req, res) => {
  try {
    const { pet_name, birthdate, gender, unique_traits, id_owner, id_breed } = req.body;
    const result = await pool.query(
      'INSERT INTO Pet (pet_name, birthdate, gender, unique_traits, id_owner, id_breed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pet_name, birthdate, gender, unique_traits, id_owner, id_breed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/pets/:id – обновление животного
app.put('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pet_name, birthdate, gender, unique_traits, id_owner, id_breed } = req.body;
    const result = await pool.query(
      'UPDATE Pet SET pet_name = $1, birthdate = $2, gender = $3, unique_traits = $4, id_owner = $5, id_breed = $6 WHERE id_pet = $7 RETURNING *',
      [pet_name, birthdate, gender, unique_traits, id_owner, id_breed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/pets/:id – удаление животного
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Удаление каскадное через ON DELETE CASCADE в БД, но можно проверить
    const result = await pool.query('DELETE FROM Pet WHERE id_pet = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ФОТО (PHOTO) ====================
// Для простоты пока без загрузки файлов, только CRUD для метаданных

app.get('/api/photos', async (req, res) => {
  try {
    const { petId } = req.query;
    let query = 'SELECT * FROM Photo';
    const params = [];
    if (petId) {
      query += ' WHERE id_pet = $1';
      params.push(petId);
    }
    query += ' ORDER BY upload_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/photos', async (req, res) => {
  try {
    const { id_pet, photo_url, description } = req.body;
    const result = await pool.query(
      'INSERT INTO Photo (id_pet, photo_url, upload_date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [id_pet, photo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Photo WHERE id_photo = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== МЕДИЦИНСКИЕ ЗАПИСИ ====================

app.get('/api/medical-records', async (req, res) => {
  try {
    const { petId } = req.query;
    let query = 'SELECT * FROM Medical_Record';
    const params = [];
    if (petId) {
      query += ' WHERE id_pet = $1';
      params.push(petId);
    }
    query += ' ORDER BY record_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/medical-records', async (req, res) => {
  try {
    const { id_pet, record_date, record_type, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO Medical_Record (id_pet, record_date, record_type, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pet, record_date, record_type, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/medical-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Medical_Record WHERE id_record = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ОСОБЫЕ ПОТРЕБНОСТИ ====================

app.get('/api/special-needs', async (req, res) => {
  try {
    const { petId } = req.query;
    let query = 'SELECT * FROM Special_Need';
    const params = [];
    if (petId) {
      query += ' WHERE id_pet = $1';
      params.push(petId);
    }
    query += ' ORDER BY need_type';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/special-needs', async (req, res) => {
  try {
    const { id_pet, need_type, description } = req.body;
    const result = await pool.query(
      'INSERT INTO Special_Need (id_pet, need_type, description) VALUES ($1, $2, $3) RETURNING *',
      [id_pet, need_type, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/special-needs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Special_Need WHERE id_need = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Need not found' });
    }
    res.json({ message: 'Need deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ПАСПОРТ И ПРИВИВКИ ====================

// Поиск паспорта по номеру (id_passport)
app.get('/api/passports/search', async (req, res) => {
  try {
    const { number } = req.query;
    if (!number) {
      return res.status(400).json({ error: 'Passport number required' });
    }
    const result = await pool.query(
      `SELECT Pet_Passport.*,
        Pet.pet_name,
        Pet.birthdate,
        Pet.gender,
        Owner.owner_name,
        Owner.phone as owner_phone
      FROM Pet_Passport
      JOIN Pet ON Pet_Passport.id_pet = Pet.id_pet
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Pet_Passport.id_passport = $1`,
      [number]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Passport not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Прививки для паспорта
app.get('/api/vaccinations', async (req, res) => {
  try {
    const { passportId } = req.query;
    if (!passportId) {
      return res.status(400).json({ error: 'passportId required' });
    }
    const result = await pool.query(
      `SELECT Vaccination.*,
        Vaccine.vaccine_name
      FROM Vaccination
      JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
      WHERE Vaccination.id_passport = $1
      ORDER BY vaccination_date DESC`,
      [passportId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/vaccinations', async (req, res) => {
  try {
    const { id_passport, id_vaccine, vaccination_date, expiration_date, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO Vaccination (id_passport, id_vaccine, vaccination_date, expiration_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_passport, id_vaccine, vaccination_date, expiration_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/vaccinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_vaccine, vaccination_date, expiration_date, notes } = req.body;
    const result = await pool.query(
      'UPDATE Vaccination SET id_vaccine = $1, vaccination_date = $2, expiration_date = $3, notes = $4 WHERE id_vaccination = $5 RETURNING *',
      [id_vaccine, vaccination_date, expiration_date, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/vaccinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Vaccination WHERE id_vaccination = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    res.json({ message: 'Vaccination deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ОТЧЁТЫ ====================

// Количество животных по видам
app.get('/api/reports/animals-by-type', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT Animal_Type.type, COUNT(Pet.id_pet) as count
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      GROUP BY Animal_Type.type
      ORDER BY Animal_Type.type
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Отчёт по владельцу (все животные с паспортами и последними прививками)
app.get('/api/reports/owner/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Проверить существование владельца
    const ownerCheck = await pool.query('SELECT * FROM Owner WHERE id_owner = $1', [id]);
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    const pets = await pool.query(
      `SELECT Pet.*,
        Breed.breed_name,
        Animal_Type.type as animal_type,
        Pet_Passport.id_passport,
        Pet_Passport.issue_date
      FROM Pet
      JOIN Breed ON Pet.id_breed = Breed.id_breed
      JOIN Animal_Type ON Breed.id_animal_type = Animal_Type.id_type
      LEFT JOIN Pet_Passport ON Pet.id_pet = Pet_Passport.id_pet
      WHERE Pet.id_owner = $1
      ORDER BY Pet.pet_name`,
      [id]
    );

    // Для каждого животного можно получить последние прививки
    const petsWithVaccinations = await Promise.all(pets.rows.map(async (pet) => {
      if (pet.id_passport) {
        const vaccs = await pool.query(
          `SELECT Vaccination.*, Vaccine.vaccine_name
          FROM Vaccination
          JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
          WHERE Vaccination.id_passport = $1
          ORDER BY vaccination_date DESC`,
          [pet.id_passport]
        );
        return { ...pet, vaccinations: vaccs.rows };
      }
      return { ...pet, vaccinations: [] };
    }));

    res.json({
      owner: ownerCheck.rows[0],
      pets: petsWithVaccinations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Животные с истекающими вакцинами (ближайшие N дней)
app.get('/api/reports/expiring-vaccinations', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = await pool.query(
      `SELECT DISTINCT ON (Pet.id_pet)
        Pet.id_pet,
        Pet.pet_name,
        Owner.owner_name,
        Owner.phone as owner_phone,
        Vaccination.expiration_date,
        Vaccine.vaccine_name,
        Pet_Passport.id_passport
      FROM Pet
      JOIN Pet_Passport ON Pet.id_pet = Pet_Passport.id_pet
      JOIN Vaccination ON Pet_Passport.id_passport = Vaccination.id_passport
      JOIN Vaccine ON Vaccination.id_vaccine = Vaccine.id_vaccine
      JOIN Owner ON Pet.id_owner = Owner.id_owner
      WHERE Vaccination.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $1::integer)
      ORDER BY Pet.id_pet, Vaccination.expiration_date ASC`,
      [days]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ОБЩАЯ АНАЛИТИКА ====================
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const ownersCount = await pool.query('SELECT COUNT(*) FROM Owner');
    const petsCount = await pool.query('SELECT COUNT(*) FROM Pet');
    const expiringVaccinations = await pool.query(
      `SELECT COUNT(*) FROM Vaccination 
       WHERE expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 30)`
    );
    res.json({
      owners: parseInt(ownersCount.rows[0].count),
      pets: parseInt(petsCount.rows[0].count),
      expiringVaccinations: parseInt(expiringVaccinations.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});