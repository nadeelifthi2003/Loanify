require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/User');
    const hash = await bcrypt.hash('password123', 10);
    
    // Update all users to have the same password
    await User.updateMany({}, { password: hash });
    
    // Ensure manager exists
    const manager = await User.findOne({role: 'manager'});
    if(!manager) {
        await User.create({name: 'Manager Silva', email: 'manager@loanify.com', role: 'manager', password: hash});
    }

    // Ensure all roles exist
    const roles = ['customer', 'officer', 'manager', 'admin'];
    for(const role of roles) {
        const u = await User.findOne({role});
        console.log(`Role ${role}: ${u.email}`);
    }
    
    console.log('Done updating passwords');
    process.exit(0);
}).catch(console.error);
