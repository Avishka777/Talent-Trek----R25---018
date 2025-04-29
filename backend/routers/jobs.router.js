const express = require('express');
const { getAllPosts, deleteAll, scrapeAndSave } = require('../controllers/jobs.controller');
const router = express.Router();

router.get('/', getAllPosts);
router.delete('/deleteall', deleteAll)
router.post('/scrape', scrapeAndSave);

module.exports = router;
