const pool = require('../../config/db');

// Список таблиц в порядке удаления (учитывая внешние ключи)
const tables = [
  'vaccination',
  'pet_passport',
  'special_need',
  'medical_record',
  'photo',
  'pet',
  'owner',
  'breed',
  'animal_type',
  'vaccine'
];

const cleanupDatabase = async () => {
  for (const table of tables) {
    await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }
};

module.exports = { cleanupDatabase };