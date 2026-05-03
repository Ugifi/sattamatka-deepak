process.env.TZ = "Asia/Kolkata";
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./config/db');
const authRoutes   = require('./routes/auth');
const gamesRoutes  = require('./routes/games');
const walletRoutes = require('./routes/wallet');
const adminRoutes  = require('./routes/admin');

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*',  // Production mein apna domain daalo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 🔥 15 minute se ghata kar sirf 1 minute kar diya
  max: 500,                // 🔥 20 limit se badha kar 500 kar di
  message: { success: false, message: 'Too many login attempts. Try again in 1 minute.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serve for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   authLimiter, authRoutes);
app.use('/api/games',  gamesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin',  adminRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎯 MatkaKing SAKTA MATKA API Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Public payment settings (for deposit page)
app.get('/api/payment-info', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('upi_id','upi_name','min_deposit','whatsapp_support')"
    );
    const data = {};
    rows.forEach(r => { data[r.setting_key] = r.setting_value; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public notices
app.get('/api/notices', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, message, type FROM notices WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5");
    res.json({ success: true, notices: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── CREATE ADMIN (one time use) ──────────────────────────────────────────────
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

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎯 MatkaKing Backend Running on Port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔧 Admin Setup: http://localhost:${PORT}/create-admin\n`);
});

module.exports = app;
