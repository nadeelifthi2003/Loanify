const mongoose = require('mongoose');
require('dotenv').config();
const Application = require('./models/Application');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/loanify')
    .then(async () => {
        console.log('Successfully connected to MongoDB');
        
        const apps = await Application.find({ status: 'Approved' });
        console.log(`Found ${apps.length} approved applications to migrate.`);

        // Map by NIC to stagger them
        const nicMap = {};
        for (const app of apps) {
            if (!nicMap[app.nic]) nicMap[app.nic] = [];
            nicMap[app.nic].push(app);
        }

        const cycleDays = [25, 28, 5, 10]; 

        for (const [nic, customerApps] of Object.entries(nicMap)) {
            const existingDays = [];
            
            for (const application of customerApps) {
                if (application.nextDueDate) {
                    existingDays.push(new Date(application.nextDueDate).getDate());
                    continue; 
                }

                let targetDay = cycleDays.find(day => !existingDays.includes(day));
                if (!targetDay) targetDay = 25; // fallback
                existingDays.push(targetDay);

                const now = new Date();
                let targetMonth = now.getMonth();
                let targetYear = now.getFullYear();

                if (now.getDate() >= targetDay - 7 || targetDay < 15) {
                    targetMonth++;
                    if (targetMonth > 11) {
                        targetMonth = 0;
                        targetYear++;
                    }
                }

                application.nextDueDate = new Date(targetYear, targetMonth, targetDay);
                await application.save();
                console.log(`Updated App ${application.id} for NIC ${nic} | Next Due: ${application.nextDueDate.toDateString()}`);
            }
        }
        
        console.log('Migration complete.');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
