const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function inspect() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL.split('?')[0] + '...');
  try {
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    console.log('Checking "birds" table structure...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'birds'
    `);
    
    console.log('Columns in "birds":');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    client.release();
  } catch (err) {
    console.error('DATABASE ERROR:', err.message);
    if (err.detail) console.error('DETAIL:', err.detail);
    if (err.hint) console.error('HINT:', err.hint);
  } finally {
    await pool.end();
  }
}

inspect();
