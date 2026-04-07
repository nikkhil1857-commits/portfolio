const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// This tells Express to serve static files from the root folder
app.use(express.static(__dirname)); 

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectTimeout: 10000
});

db.connect(err => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
    } else {
        console.log('✅ SUCCESS: Connected to TiDB Cloud!');
    }
});

// Serve index.html directly from the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api/projects', (req, res) => {
    db.query('SELECT * FROM projects', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`🚀 Server active at http://localhost:${port}`);
});