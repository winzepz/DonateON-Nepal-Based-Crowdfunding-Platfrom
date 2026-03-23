import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pool from '../src/db';

dotenv.config();

const migrationsDir = path.resolve(__dirname, '..', 'migrations');

const run = async () => {
    // 1. Ensure migrations table exists to track applied migrations
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    // 2. Fetch already applied migrations
    const appliedRes = await pool.query('SELECT name FROM migrations');
    const appliedSet = new Set(appliedRes.rows.map(r => r.name));

    // 3. Get all SQL migration files
    const files = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    let appliedCount = 0;
    for (const file of files) {
        if (appliedSet.has(file)) {
            // Skip already applied
            continue;
        }

        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        process.stdout.write(`Applying ${file}...\n`);
        
        try {
            // Apply migration in transaction (using our withTransaction helper ideally but pool is fine too)
            // But runMigrations is a script that has its own pool
            await pool.query('BEGIN');
            await pool.query(sql);
            await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            await pool.query('COMMIT');
            appliedCount++;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw new Error(`Failed to apply ${file}: ${error}`);
        }
    }

    await pool.end();
    process.stdout.write(`Migrations complete. ${appliedCount} new migrations applied.\n`);
};

run().catch(async (error) => {
    process.stderr.write(`\nMigration failed: ${error instanceof Error ? error.message : String(error)}\n`);
    await pool.end();
    process.exit(1);
});
