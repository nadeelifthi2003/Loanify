const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
