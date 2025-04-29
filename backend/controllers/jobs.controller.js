// controllers/jobs.controller.js
const Job = require('../module/jobs.model');  // Ensure the path is correct
const scrap = require('../utils/scraper');

// Function to start scraping and save data to the database
// const scrapeAndSave = async () => {
//     try {
//         const jobs = await scrap();
//         const createdJobs = await Job.insertMany(jobs);
//         console.log(`Successfully saved ${createdJobs.length} jobs.`);
//     } catch (error) {
//         console.error('Failed to scrape and save jobs:', error);
//     }
// };

const scrapeAndSave = async (req, res) => {
    try {
        console.log('Starting the scraping process...');
        const scrapedJobs = await scrap();
        console.log(`Scraping completed. Number of jobs scraped: ${scrapedJobs.length}`);

        const jobsToSave = [];
        for (const job of scrapedJobs) {
            const exists = await Job.findOne({ link: job.link });
            if (!exists) {
                jobsToSave.push(job);
            }
        }

        if (jobsToSave.length > 0) {
            const savedJobs = await Job.insertMany(jobsToSave);
            console.log(`Successfully saved ${savedJobs.length} jobs to the database.`);
            res.status(201).json({ message: `Scraped and saved ${savedJobs.length} jobs.` });
        } else {
            console.log('No jobs to save, as no new jobs were scraped.');
            res.status(200).json({ message: 'No new jobs were scraped.' });
        }
    } catch (error) {
        console.error('Error during scraping and saving:', error);
        res.status(500).json({ message: 'Failed to scrape and save jobs', error });
    }
};


const getAllPosts = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Failed to get posts:', error);
        res.status(500).json({ message: 'Failed to get posts', error });
    }
};

const deleteAll = async (req, res) => {
    try {
        const result = await Job.deleteMany({});
        console.log(`Deleted ${result.deletedCount} jobs.`);
        res.status(200).json({ message: `Successfully deleted ${result.deletedCount} jobs.` });
    } catch (error) {
        console.error('Failed to delete jobs:', error);
        res.status(500).json({ message: 'Failed to delete jobs', error });
    }
};

module.exports = {
    scrapeAndSave,
    getAllPosts,
    deleteAll
};
