const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

let db;
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

if (isProduction) {
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Add compatibility helpers for PostgreSQL to match the SQLite promise wrappers used elsewhere
    db.execute = async (sql, params = []) => {
        const res = await db.query(sql.replace(/\?/g, (val, i) => `$${params.indexOf(params[i]) + 1}`), params);
        return [res.rows];
    };
    
    db.run_async = async (sql, params = []) => {
        // PostgreSQL uses $1, $2 instead of ?
        let i = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++i}`);
        const res = await db.query(pgSql, params);
        return { insertId: res.rows[0]?.id, changes: res.rowCount };
    };
} else {
    const dbPath = path.resolve(__dirname, '../database.sqlite');
    db = new sqlite3.Database(dbPath);
    
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
}

// Unified Initialization
const initDb = async () => {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'company',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    const createSubmissionsTable = `
        CREATE TABLE IF NOT EXISTS submissions (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            companyName TEXT,
            submissionDate TEXT,
            representativeName TEXT,
            phone TEXT,
            email TEXT,
            centralBankLicense TEXT,
            marketExperience TEXT,
            govInstitutionsCount TEXT,
            paidCapital TEXT,
            officialAddress TEXT,
            q2_1_settlement TEXT,
            q2_2_commissions TEXT,
            q2_3_intermediary TEXT,
            q2_4_delayPenalty TEXT,
            q2_5_atmCommitment TEXT,
            q2_6_studentCards TEXT,
            q2_7_chargingCenters TEXT,
            q2_8_posCommitment TEXT,
            q3a_1_integratedSystem TEXT,
            q3a_2_techSpecs TEXT,
            q3a_3_appSupport TEXT,
            q3a_4_webIntegration TEXT,
            q3a_5_reporting TEXT,
            q3a_6_training TEXT,
            q3b_1_certificates TEXT,
            q3b_2_encryption TEXT,
            q3b_3_rto_bcp TEXT,
            q3b_4_backups TEXT,
            q3b_5_supportSla TEXT,
            q3b_6_penTest TEXT,
            q3b_7_monitoring TEXT,
            q3b_8_incident TEXT,
            q4_1_bankGuarantee TEXT,
            q4_2_penaltyClause TEXT,
            q4_3_dataOwnership TEXT,
            q4_4_exitClause TEXT,
            q4_5_liability TEXT,
            q4_6_jurisdiction TEXT,
            q4_7_auditRight TEXT,
            q4_8_contractDuration TEXT,
            q4_9_renewal TEXT,
            q5_1_extraFeatures TEXT,
            q5_2_innovation TEXT,
            q5_3_scholarships TEXT,
            q5_4_staffTraining TEXT,
            q5_5_mobileApp TEXT,
            q5_6_foreignStudents TEXT,
            q5_7_complaints TEXT,
            q5_8_socialResp TEXT,
            additionalNotes TEXT,
            signedBy TEXT,
            position TEXT,
            document_url TEXT,
            evaluation_score INTEGER DEFAULT 0,
            status TEXT DEFAULT 'draft',
            lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    if (isProduction) {
        await db.query(createUsersTable);
        await db.query(createSubmissionsTable);
    } else {
        db.serialize(() => {
            db.run(createUsersTable.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT').replace('TIMESTAMP', 'DATETIME'));
            db.run(createSubmissionsTable.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT').replace('TIMESTAMP', 'DATETIME'));
        });
    }
};

initDb().catch(err => console.error('Database initialization failed:', err));

module.exports = db;
