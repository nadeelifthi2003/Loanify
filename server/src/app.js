const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;
