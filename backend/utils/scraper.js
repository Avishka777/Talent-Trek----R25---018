// const puppeteer = require('puppeteer');

// const scrap = async () => {
//     const urls = [
//         "https://www.jobhunder.com/search/label/IT%20%2F%20Software",
//         "https://www.jobhunder.com/search?updated-max=2025-04-03T07:53:00%2B05:30&max-results=8#PageNo=2",
//         "https://www.jobhunder.com/search?updated-max=2025-04-01T07%3A09%3A00%2B05%3A30&max-results=6#PageNo=3",
//         "https://www.jobhunder.com/search?updated-max=2025-03-30T14%3A14%3A00%2B05%3A30&max-results=6#PageNo=4",
//         "https://www.jobhunder.com/search?updated-max=2025-03-28T08%3A54%3A00%2B05%3A30&max-results=6#PageNo=5"
//     ];
//     const browser = await puppeteer.launch();
//     let allJobs = [];

//     for (const url of urls) {
//         const page = await browser.newPage();
//         await page.goto(url);

//         const jobs = await page.evaluate(() => {
//             const jobElements = document.querySelectorAll('.post-filter-inside-wrap');
//             return Array.from(jobElements).map(job => {
//                 const imageElement = job.querySelector('img');
//                 const titleElement = job.querySelector('h2.entry-title');
//                 const dateElement = job.querySelector('.post-date.published');
//                 const linkElement = job.querySelector('a.post-filter-link');

//                 return {
//                     title: titleElement ? titleElement.textContent.trim() : 'No title available',
//                     date: dateElement ? dateElement.textContent.trim() : 'No date available',
//                     image: imageElement ? imageElement.getAttribute('src') : null,
//                     link: linkElement ? linkElement.getAttribute('href') : 'No link available'
//                 };
//             });
//         });

//         allJobs = allJobs.concat(jobs);
//         await page.close();
//     }

//     await browser.close();
//     return allJobs;
// };

// module.exports = scrap;

const puppeteer = require('puppeteer');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const scrap = async () => {
    const urls = [
        "https://www.jobhunder.com/search/label/IT%20%2F%20Software",
        "https://www.jobhunder.com/search?updated-max=2025-04-08T07:33:00%2B05:30&max-results=8#PageNo=2",
        "https://www.jobhunder.com/search?updated-max=2025-04-04T07%3A35%3A00%2B05%3A30&max-results=6#PageNo=3",
        "https://www.jobhunder.com/search?updated-max=2025-04-03T07%3A31%3A00%2B05%3A30&max-results=6#PageNo=4",
        "https://www.jobhunder.com/search?updated-max=2025-04-01T07%3A17%3A00%2B05%3A30&max-results=6#PageNo=5",
        "https://www.jobhunder.com/search?updated-max=2025-03-30T14%3A24%3A00%2B05%3A30&max-results=6#PageNo=6"
    ];
    // const urls = [
    //     "https://www.jobhunder.com/search/label/IT%20%2F%20Software",
    //     "https://www.jobhunder.com/search?updated-max=2025-04-03T07:53:00%2B05:30&max-results=8#PageNo=2",
    //     "https://www.jobhunder.com/search?updated-max=2025-04-01T07%3A09%3A00%2B05%3A30&max-results=6#PageNo=3",
    //     "https://www.jobhunder.com/search?updated-max=2025-03-30T14%3A14%3A00%2B05%3A30&max-results=6#PageNo=4",
    //     "https://www.jobhunder.com/search?updated-max=2025-03-28T08%3A54%3A00%2B05%3A30&max-results=6#PageNo=5"
    // ];

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let allJobs = [];

    for (const url of urls) {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await delay(2000);

            const jobLinks = await page.evaluate(() => {
                const jobElements = document.querySelectorAll('.post-filter-inside-wrap');
                return Array.from(jobElements).map(job => {
                    // Improved image selection - tries multiple selectors
                    let imageUrl = null;
                    const imgSelectors = [
                        'img[src]', // Basic img tag with src
                        '.post-thumb img', // Possible thumbnail class
                        'img.thumbnail', // Possible thumbnail class
                        'img.lazy', // Possible lazy-loaded image
                        'img[data-src]' // Possible lazy-loaded image with data-src
                    ];

                    for (const selector of imgSelectors) {
                        const img = job.querySelector(selector);
                        if (img) {
                            imageUrl = img.getAttribute('src') ||
                                img.getAttribute('data-src') ||
                                img.getAttribute('data-lazy-src');
                            if (imageUrl) break;
                        }
                    }

                    const titleElement = job.querySelector('h2.entry-title');
                    const dateElement = job.querySelector('.post-date.published');
                    const linkElement = job.querySelector('a.post-filter-link');

                    return {
                        title: titleElement ? titleElement.textContent.trim() : 'No title available',
                        date: dateElement ? dateElement.textContent.trim() : 'No date available',
                        image: imageUrl,
                        link: linkElement ? linkElement.getAttribute('href') : 'No link available',
                        description: 'Not loaded yet'
                    };
                });
            });

            // Process each job with retry logic
            for (const job of jobLinks) {
                let retries = 3;
                let success = false;

                while (retries > 0 && !success) {
                    const jobPage = await browser.newPage();
                    try {
                        await jobPage.setDefaultNavigationTimeout(60000);
                        await jobPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

                        console.log(`Scraping: ${job.link} (${retries} retries left)`);
                        await jobPage.goto(job.link, {
                            waitUntil: 'domcontentloaded',
                            timeout: 60000
                        });

                        await delay(1000);

                        job.description = await jobPage.evaluate(() => {
                            const descElement = document.querySelector('.post-body.entry-content');
                            return descElement ? descElement.textContent.trim().replace(/\s+/g, ' ') : 'No description available';
                        });

                        // If image is still null, try to get it from the job page
                        if (!job.image) {
                            job.image = await jobPage.evaluate(() => {
                                const imgSelectors = [
                                    'img[src]',
                                    '.post-thumb img',
                                    'img.thumbnail',
                                    'img.lazy',
                                    'img[data-src]',
                                    '.entry-content img'
                                ];

                                for (const selector of imgSelectors) {
                                    const img = document.querySelector(selector);
                                    if (img) {
                                        return img.getAttribute('src') ||
                                            img.getAttribute('data-src') ||
                                            img.getAttribute('data-lazy-src');
                                    }
                                }
                                return null;
                            });
                        }

                        allJobs.push(job);
                        success = true;
                    } catch (error) {
                        console.error(`Error scraping ${job.link}:`, error.message);
                        retries--;

                        if (retries === 0) {
                            job.description = 'Failed to load description after retries';
                            allJobs.push(job);
                        }
                    } finally {
                        await jobPage.close();
                        await delay(500);
                    }
                }
            }

        } catch (error) {
            console.error(`Error processing main page ${url}:`, error);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log(`Scraping completed. Found ${allJobs.length} jobs.`);
    return allJobs;
};

module.exports = scrap;