import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pool from '../src/db';

dotenv.config();

const migrationsDir = path.resolve(__dirname, '..', 'migrations');

const run = async () => {
    const files = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        process.stdout.write(`Applying ${file}...\n`);
        await pool.query(sql);
    }

    await pool.end();
    process.stdout.write('All migrations applied successfully.\n');
};

run().catch(async (error) => {
    process.stderr.write(`Migration failed: ${error instanceof Error ? error.message : String(error)}\n`);
    await pool.end();
    process.exit(1);
});
