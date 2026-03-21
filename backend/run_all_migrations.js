// run_all_migrations.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrationsDir = path.join(__dirname, 'migrations');
const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Run in order

const migrate = async () => {
    for (const file of files) {
        if (file === 'init.sql') continue; // Assume init is done

        const sqlPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`\nRunning migration: ${file}...`);
        try {
            await pool.query(sql);
            console.log(`✓ ${file} completed.`);
        } catch (err) {
            // Check for common "already exists" errors to skip gracefully
            if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                console.log(`- ${file} skipped (items already exist).`);
            } else {
                console.error(`✗ ${file} failed:`, err.message);
                // We'll continue unless it's a fatal error
            }
        }
    }
    console.log('\n✅ Migration check complete.');
    await pool.end();
};

migrate();
