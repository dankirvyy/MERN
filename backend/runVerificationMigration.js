const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'visit_mindoro_db',
            multipleStatements: true
        });

        console.log('Connected to database');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'create_verification_codes_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration
        await connection.query(sql);
        console.log('✓ verification_codes table created successfully');
        console.log('✓ Cleanup event scheduled');

        await connection.end();
        console.log('\nMigration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

runMigration();
