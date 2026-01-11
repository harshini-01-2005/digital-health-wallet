const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./health.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_type TEXT,
        report_date TEXT,
        heart_rate INTEGER, 
        sugar_level INTEGER,
        file_path TEXT
    )`);
});
module.exports = db;