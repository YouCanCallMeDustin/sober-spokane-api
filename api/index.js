// index.js - Main entry for Local Event Scraper API
// Express server for Sober Spokane
// Ethical reminder: Always check site terms before scraping, limit request frequency, and use data responsibly.

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cors = require('cors');
app.use(cors());

// Only load dotenv in development (not needed on Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- Render Deployment: Environment Variable Checks ---
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Mongoose Event schema
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  description: String,
});
const Event = mongoose.model('Event', eventSchema);

// --- Health Check Endpoint for Render ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// /events endpoint: returns all stored events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// /scrape endpoint: uses Puppeteer to scrape meetings and store them in MongoDB
app.get('/scrape', async (req, res) => {
  // Ethical reminder: Limit scraping frequency and check site terms before use.
  let browser;
  try {
    const url = 'https://aaspokane.org/meetings/';
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Wait for the table to appear
    await page.waitForSelector('table');
    // Get the HTML content after JS loads
    const html = await page.content();
    const $ = cheerio.load(html);

    const scrapedEvents = [];
    $('table tbody tr').each((i, el) => {
      // Time and day
      const timeDay = $(el).find('td.tsml-time time span').map((i, el) => $(el).text().trim()).get();
      const time = timeDay[0] || '';
      const day = timeDay[1] || '';
      // Meeting name
      const title = $(el).find('td.tsml-name a').text().trim() || 'AA Meeting';
      // Location/group
      const locationGroup = $(el).find('td.tsml-location_group').text().trim() || '';
      // Address
      const address = $(el).find('td.tsml-address span.notranslate').text().trim() || '';
      // Region
      const region = $(el).find('td.tsml-region').text().trim() || '';
      // Compose description
      const description = `Group: ${locationGroup} | Address: ${address} | Region: ${region}`;
      // Only add if there's a title and time
      if (title && time) {
        scrapedEvents.push({
          title,
          date: `${day} ${time}`.trim(),
          location: locationGroup || address || region || 'Spokane',
          description
        });
      }
    });

    // If no meetings found, return a message
    if (scrapedEvents.length === 0) {
      await browser.close();
      return res.status(200).json({ message: 'No meetings found. Update selectors for the target site.' });
    }

    // Remove old events and insert new ones
    await Event.deleteMany({});
    await Event.insertMany(scrapedEvents);

    await browser.close();
    res.json({ message: 'Meetings scraped and stored successfully', count: scrapedEvents.length });
  } catch (err) {
    if (browser) await browser.close();
    console.error('Scraping error:', err);
    res.status(500).json({ error: 'Failed to scrape meetings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// --- End of Render deployment updates --- 
