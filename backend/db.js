const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./health.db');

db.serialize(() => {
    // 1. Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'Viewer'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        shared_with_user_id INTEGER,
        access_type TEXT DEFAULT 'read-only'
    )`);

    // 2. Create Reports Table with all required fields
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_type TEXT,
        report_date TEXT,
        heart_rate INTEGER, 
        sugar_level INTEGER,
        blood_pressure TEXT,  -- Added for BP
        file_path TEXT,
        owner_id INTEGER      -- Added for Auth
    )`);

    db.run(`ALTER TABLE reports ADD COLUMN blood_pressure TEXT`, (err) => {});
    db.run(`ALTER TABLE reports ADD COLUMN owner_id INTEGER`, (err) => {});
});

module.exports = db;
