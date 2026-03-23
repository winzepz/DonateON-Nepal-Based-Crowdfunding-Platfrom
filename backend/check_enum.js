const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkEnum() {
  try {
    const res = await pool.query(`
      SELECT e.enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'kyc_status'
    `);
    
    console.log('Enum values for kyc_status:');
    res.rows.forEach(row => {
      console.log(`- ${row.enumlabel}`);
    });
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkEnum();
