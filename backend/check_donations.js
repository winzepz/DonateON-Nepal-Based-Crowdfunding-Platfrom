const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkDonations() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'donations'
    `);
    
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDonations();
