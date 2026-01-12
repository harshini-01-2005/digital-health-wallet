const path = require('path'); // <--- ADD THIS LINE HERE
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "harshu";



const app = express();
app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware for Role Check
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Access Denied: Requires " + role + " role" });
        }
        next();
    };
};

// Registration
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    db.run(sql, [username, hashedPassword, role || 'Viewer'], (err) => {
        if (err) return res.status(400).json({ error: "Username already exists" });
        res.json({ message: "User registered successfully" });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "User not found" });
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role, username: user.username });
    });
});

// THIS LINE IS THE SECRET FIX
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'upload/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

app.post('/api/upload', authenticateToken, authorizeRole('Owner'), upload.single('report'), (req, res) => {
    const { type, date, heartRate, sugar, bp } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const ownerId = req.user.id;
    const sql = `INSERT INTO reports (report_type, report_date, heart_rate, sugar_level, blood_pressure, file_path, owner_id) VALUES (?, ?, ?, ?, ?,?,?)`;
    db.run(sql, [type, date, heartRate, sugar, bp, fileName, ownerId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Success!" });
    });
});

app.get('/api/reports', authenticateToken, (req, res) => {
    const { start, end, category } = req.query;
    const userId = req.user.id;

    // We use a CASE statement to check if the current user is the owner
    let sql = `
        SELECT r.*, 
        CASE WHEN r.owner_id = ? THEN 1 ELSE 0 END as is_owner
        FROM reports r
        LEFT JOIN shares s ON r.id = s.report_id
        WHERE (r.owner_id = ? OR s.shared_with_user_id = ?)
    `;
    let params = [userId, userId, userId];

    if (start && end && start !== '' && end !== '') {
        sql += " AND r.report_date BETWEEN ? AND ?";
        params.push(start, end);
    }

    if (category && category !== '') {
        sql += " AND r.report_type LIKE ?";
        params.push(`%${category}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/share', authenticateToken, authorizeRole('Owner'), (req, res) => {
    const { reportId, targetUsername } = req.body;

    // Find the user to share with
    db.get("SELECT id FROM users WHERE username = ?", [targetUsername], (err, targetUser) => {
        if (err || !targetUser) return res.status(404).json({ error: "User not found" });

        const sql = `INSERT INTO shares (report_id, shared_with_user_id) VALUES (?, ?)`;
        db.run(sql, [reportId, targetUser.id], (err) => {
            if (err) return res.status(500).json({ error: "Already shared or database error" });
            res.json({ message: `Report shared with ${targetUsername}` });
        });
    });
});

app.listen(5000, () => console.log("✅ Backend is running on port 5000"));
