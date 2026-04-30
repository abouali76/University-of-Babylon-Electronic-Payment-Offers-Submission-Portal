const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.send('Babylon Payment Form API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/form');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/form', authMiddleware, formRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
