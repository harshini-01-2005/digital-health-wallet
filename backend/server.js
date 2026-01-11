const path = require('path'); // <--- ADD THIS LINE HERE
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const fs = require('fs');



const app = express();
app.use(cors());
app.use(express.json());

// THIS LINE IS THE SECRET FIX
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('report'), (req, res) => {
    const { type, date, heartRate, sugar } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const sql = `INSERT INTO reports (report_type, report_date, heart_rate, sugar_level, file_path) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [type, date, heartRate, sugar, fileName], (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: "Success!" });
    });
});

app.get('/api/reports', (req, res) => {
    db.all("SELECT * FROM reports", [], (err, rows) => {
        res.json(rows);
    });
});

app.listen(5000, () => console.log("✅ Backend is running on port 5000"));