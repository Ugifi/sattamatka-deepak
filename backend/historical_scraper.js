process.env.TZ = 'Asia/Kolkata';
require('dotenv').config();
const db = require('./config/db');
const axios = require('axios');
const cheerio = require('cheerio');

// Tumhari Database ke Game IDs
const GAME_MAP = {
  'kalyan-morning': 49,
  'milan-morning': 25,
  'sridevi': 26
};

const URLS = [
  'https://dpbossss.boston/panel-chart-record/kalyan-morning.php',
  'https://dpbossss.boston/panel-chart-record/milan-morning.php',
  'https://dpbossss.boston/panel-chart-record/sridevi.php'
];

async function scrapeHistoricalChart(url) {
  const gameSlug = Object.keys(GAME_MAP).find(slug => url.includes(slug));
  const gameId = GAME_MAP[gameSlug];

  console.log(`\n⏳ Scraping: ${gameSlug} (Game ID: ${gameId})...`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const records = [];

    // Puri page ki text content le lo
    const pageText = $('body').text();
    
    // Global Regex: Poore page mein se XXX-YY-ZZZ format nikal lo
    const regex = /(\d{3})-(\d{2})-(\d{3})/g;
    let match;
    
    while ((match = regex.exec(pageText)) !== null) {
      const open_result = match[1];
      const jodi_result = match[2];
      const close_result = match[3];

      const openDigit = String(open_result).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
      const closeDigit = String(close_result).split('').reduce((s, d) => s + parseInt(d), 0) % 10;

      records.push({
        open_result, close_result, jodi_result, openDigit, closeDigit
      });
    }

    console.log(`✅ Found ${records.length} results for ${gameSlug}`);

    // Agar results mile, toh DB mein save karo
    if (records.length > 0) {
      let saved = 0;
      const today = new Date();
      
      // Results ko aaj se peechle dates mein map karo taaki chart fill ho
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        const dateObj = new Date(today);
        dateObj.setDate(dateObj.getDate() - i);
        const result_date = dateObj.toISOString().split('T')[0];

        try {
          await db.query(
            `INSERT INTO game_results (game_id, result_date, open_result, close_result, jodi_result, open_digit, close_digit, result_source)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'historical_scraper')
             ON DUPLICATE KEY UPDATE 
               open_result = VALUES(open_result), 
               close_result = VALUES(close_result), 
               jodi_result = VALUES(jodi_result)`,
            [gameId, result_date, record.open_result, record.close_result, record.jodi_result, record.openDigit, record.closeDigit]
          );
          saved++;
        } catch (err) {
          // Ignore
        }
      }
      console.log(`💾 Saved ${saved} records to database for ${gameSlug}!`);
    } else {
      console.log(`⚠️ No results found. Site might be blocking or HTML is different.`);
    }

  } catch (err) {
    console.error(`❌ Error scraping ${url}:`, err.message);
  }
}

async function run() {
  console.log('🚀 Starting Historical Chart Scraper...');
  for (const url of URLS) {
    await scrapeHistoricalChart(url);
  }
  console.log('\n✨ All Done! Check your Chart pages now.');
  process.exit(0);
}

run();