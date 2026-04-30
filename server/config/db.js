const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper to use promises with sqlite3
db.execute = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve([rows]);
        });
    });
};

db.run_async = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ insertId: this.lastID, changes: this.changes });
        });
    });
};

// Initialize tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'company',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        company_name TEXT,
        representative_name TEXT,
        phone TEXT,
        email TEXT,
        license_number TEXT,
        experience_years INTEGER,
        gov_entities_count INTEGER,
        capital REAL,
        address TEXT,
        submission_date TEXT,
        UNIQUE(user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS form_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        settlement_mechanism TEXT,
        commissions_discounts TEXT,
        intermediary_bank TEXT,
        delay_penalty TEXT,
        atm_commitment TEXT,
        student_cards_details TEXT,
        charging_centers TEXT,
        pos_commitment TEXT,
        integrated_system_details TEXT,
        special_cards_issuance TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id)
    )`);
});

module.exports = db;
