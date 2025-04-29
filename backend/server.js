const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const jobsRouter = require('./routers/jobs.router');  // Ensure the path matches the actual file location

// Import the function to run the scraper
const { scrapeAndSave } = require('./controllers/jobs.controller');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB ✅');
        // Schedule the scraper to run daily at midnight
        cron.schedule('0 0 * * *', () => {
            console.log('Running daily job scrape at 00:00');
            scrapeAndSave();
        });
    })
    .catch(err => console.error('Could not connect to MongoDB ❌', err));

app.use('/api/jobs', jobsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
