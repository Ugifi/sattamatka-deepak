process.env.TZ = "Asia/Kolkata";
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
const cron = require('node-cron'); // ✅ Node Cron Added
require('dotenv').config();

const db = require('./config/db');
const authRoutes    = require('./routes/auth');
const gamesRoutes   = require('./routes/games');
const walletRoutes  = require('./routes/wallet');
const adminRoutes  = require('./routes/admin');
const scraperRoutes = require('./routes/scraper');
const { syncResults } = require('./routes/scraper'); // ✅ Scraper Function Import

const app = express();

app.use(helmet());
app.set('trust proxy', 1);

// ✅ FIX: 'OPTIONS' method explicitly add kiya hai localhost preflight ke liye
app.use(cors({
  origin: '*',
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',    authLimiter, authRoutes);
app.use('/api/games',   gamesRoutes);
app.use('/api/wallet',  walletRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/scraper', scraperRoutes);

// ── PROMO CODES ──────────────────────────────────────────────────────────────

// Admin: Create promo code
app.post('/api/admin/promo-codes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (!users.length || users[0].role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });

    const { code, coins, max_uses, expires_at } = req.body;
    if (!code || !coins || !max_uses || !expires_at) return res.status(400).json({ success: false, message: 'Sab fields zaroori hain' });

    await db.query(
      'INSERT INTO promo_codes (code, coins, max_uses, expires_at) VALUES (?, ?, ?, ?)',
      [code.toUpperCase().trim(), coins, max_uses, expires_at]
    );
    res.json({ success: true, message: 'Promo code create ho gaya!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Yeh code already exist karta hai' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all promo codes
app.get('/api/admin/promo-codes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (!users.length || users[0].role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });

    const [rows] = await db.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json({ success: true, codes: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete promo code
app.delete('/api/admin/promo-codes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (!users.length || users[0].role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });

    await db.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Code delete ho gaya' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User: Redeem promo code
app.post('/api/wallet/redeem-promo', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code daalo' });

    const [codes] = await db.query('SELECT * FROM promo_codes WHERE code = ?', [code.toUpperCase().trim()]);
    if (!codes.length) return res.status(404).json({ success: false, message: 'Invalid promo code' });

    const promo = codes[0];

    // Expire check
    if (new Date() > new Date(promo.expires_at)) {
      return res.status(400).json({ success: false, message: 'Promo code expire ho gaya' });
    }

    // Max uses check
    if (promo.used_count >= promo.max_uses) {
      return res.status(400).json({ success: false, message: 'Promo code ki limit khatam ho gayi' });
    }

    // Already used check
    const [already] = await db.query(
      'SELECT id FROM promo_redemptions WHERE user_id = ? AND promo_id = ?',
      [userId, promo.id]
    );
    if (already.length) return res.status(400).json({ success: false, message: 'Aap yeh code pehle use kar chuke hain' });

    // Add coins
    await db.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [promo.coins, userId]);
    await db.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
    await db.query('INSERT INTO promo_redemptions (user_id, promo_id) VALUES (?, ?)', [userId, promo.id]);

    // Transaction log
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, "credit", ?, ?, "completed")',
      [userId, promo.coins, `Promo Code: ${promo.code}`]
    );

    res.json({ success: true, message: `🎉 ${promo.coins} coins add ho gaye!`, coins: promo.coins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/test-disawar-raw', async (req, res) => {
  const axios = require('axios');
  const cheerio = require('cheerio');
  
  const r = await axios.get('https://satta-king-fast.com/delhi-bazar/satta-result-chart/db/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 20000
  });
  
  const $ = cheerio.load(r.data);
  const rows = [];
  
  $('table tr').each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;
    const c0 = $(cells[0]).text().trim().replace(/\s+/g, ' ');
    const c1 = cells.length >= 2 ? $(cells[1]).text().trim() : '';
    const c2 = cells.length >= 3 ? $(cells[2]).text().trim() : '';
    rows.push({ c0, c1, c2 });
  });
  
  res.json({ total: rows.length, rows });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎯 MatkaKing SAKTA MATKA API Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/payment-info', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('upi_id','upi_name','min_deposit','whatsapp_support','site_name','qr_image')"
    );
    const data = {};
    rows.forEach(r => { data[r.setting_key] = r.setting_value; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/notices', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, message, type FROM notices WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5");
    res.json({ success: true, notices: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/create-admin', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE role = "admin"');
    if (existing.length) return res.json({ success: false, message: 'Admin already exists. Login: 9999999999 / admin123' });
    const hashed = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO users (name, mobile, password, role, wallet_balance, winning_balance) VALUES (?, ?, ?, "admin", 0, 0)',
      ['Super Admin', '9999999999', hashed]
    );
    res.json({ success: true, message: '✅ Admin created! Mobile: 9999999999 | Password: admin123' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ─── CRON JOB: Auto Scraper (Har 1 minute mein chalega) ────────────────────
cron.schedule('* * * * *', async () => {
  console.log('⏳ [Cron] Running Auto Scraper...');
  try {
    const res = await syncResults();
    if (res.updated > 0) {
      console.log(`✅ [Cron] Scraper Update: ${res.message}`);
    }
  } catch (err) {
    console.error('❌ [Cron] Scraper Error:', err.message);
  }
});

// ─── CRON JOB: 2 AM Auto Reset (Database Clear) ─────────────────────────────
// Ye raat ke 2 baje sabhi purane results ko NULL kar dega
cron.schedule('0 2 * * *', async () => {
  console.log('⏳ [2 AM Cron] Resetting all game results for the new day...');
  try {
    await db.query("UPDATE games SET open_result = NULL, close_result = NULL, jodi_result = NULL, result_date = NULL, status = 'open'");
    console.log('✅ [2 AM Cron] All games cleared successfully!');
  } catch (err) {
    console.error('❌ [2 AM Cron] Reset Error:', err.message);
  }
});

// ─── STARLINE AUTO SYNC ───────────────────────────────────────────────────────
const { syncStarlineResults } = require('./routes/scraper');

cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await syncStarlineResults();
    if (result.updated > 0) {
      console.log(`✅ [STARLINE SYNC] ${result.updated} games updated`);
      result.log.forEach(l => console.log(`   → ${l.game} | Pana: ${l.pana} | Digit: ${l.digit}`));
    }
  } catch (err) {
    console.error('❌ [STARLINE SYNC] Error:', err.message);
  }
});

cron.schedule('5 2 * * *', async () => {
  try {
    await db.query(
      `UPDATE games SET open_result=NULL, close_result=NULL, jodi_result=NULL, result_date=NULL, status='open' WHERE game_category='starline' AND status != 'deleted'`
    );
    console.log('🔄 [STARLINE RESET] Done');
  } catch (err) {
    console.error('❌ [STARLINE RESET] Error:', err.message);
  }
});
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎯 MatkaKing Backend Running on Port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔧 Admin Setup: http://localhost:${PORT}/create-admin`);
  console.log(`⏳ Auto Scraper Started (Runs every 1 minute)\n`);
});

module.exports = app;
