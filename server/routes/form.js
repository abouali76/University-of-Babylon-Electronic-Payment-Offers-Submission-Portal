const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed!'), false);
    }
});

// File Upload Endpoint
router.post('/upload', upload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Submit/Update Form
router.post('/submit', async (req, res) => {
    const data = req.body;
    const username = req.user.username || data.username;
    
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        // Build query dynamically based on keys provided
        const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'username' && k !== 'lastUpdated');
        const values = fields.map(k => data[k]);
        
        // Check if exists
        const [existing] = await db.execute('SELECT id FROM submissions WHERE username = ?', [username]);
        
        if (existing.length > 0) {
            // Update
            const setClause = fields.map((f, i) => `"${f}" = ?`).join(', ');
            await db.run_async(
                `UPDATE submissions SET ${setClause}, "lastUpdated" = CURRENT_TIMESTAMP WHERE username = ?`,
                [...values, username]
            );
        } else {
            // Insert
            const columns = ['username', ...fields].map(c => `"${c}"`).join(', ');
            const placeholders = ['?', ...fields.map(() => '?')].join(', ');
            await db.run_async(
                `INSERT INTO submissions (${columns}) VALUES (${placeholders})`,
                [username, ...values]
            );
        }

        res.json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get My Submission
router.get('/my-submission', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM submissions WHERE username = ?', [req.user.username]);
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
