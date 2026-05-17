const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createNimal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loanify');
        console.log('Connected to DB');

        const email = 'nimal.jayasuriya@gmail.com';
        
        // Remove existing if any
        await User.deleteOne({ email });

        const hashedPassword = await bcrypt.hash('password123', 10);

        const nimal = new User({
            name: 'Nimal Jayasuriya',
            email: email,
            password: hashedPassword,
            role: 'customer',
            status: 'active',
            phone: '077 123 4567',
            branch: 'Colombo',
            department: 'Corporate',
        });

        await nimal.save();
        console.log('Successfully created user: Nimal Jayasuriya');
        console.log('Email: nimal.jayasuriya@gmail.com');
        console.log('Password: password123');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createNimal();
