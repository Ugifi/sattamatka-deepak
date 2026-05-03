const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');

// ─── MULTER SETUP FOR IMAGES ───
const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


// ─── 1. REGISTER ─────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid 10-digit mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, mobile, password, referred_by } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Mobile already registered' });

    const hashed = await bcrypt.hash(password, 10);

    let referrerId = null;
    if (referred_by) {
      const [ref] = await db.query('SELECT id FROM users WHERE mobile = ?', [referred_by]);
      if (ref.length) referrerId = ref[0].id;
    }

    const [result] = await db.query(
      'INSERT INTO users (name, mobile, password, referred_by) VALUES (?, ?, ?, ?)',
      [name, mobile, hashed, referrerId]
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: result.insertId, name, mobile, role: 'user' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 2. LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', [
  body('mobile').notEmpty().withMessage('Mobile required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { mobile, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        wallet_balance: user.wallet_balance,
        winning_balance: user.winning_balance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 3. GET PROFILE (YE WALA MISSING THA!) ──────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // profile_pic bhi fetch kar rahe hain
    const [rows] = await db.query('SELECT id, name, mobile, role, profile_pic, wallet_balance, winning_balance FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 4. UPDATE PROFILE NAME & IMAGE ───────────────────────────────────────────
router.post('/update-profile', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        
        if (!name) return res.status(400).json({ success: false, message: 'Name required' });

        let updateQuery = 'UPDATE users SET name = ? WHERE id = ?';
        let params = [name, userId];

        // Agar user ne photo bhi upload ki hai
        if (req.file) {
            const avatarPath = `/uploads/avatars/${req.file.filename}`;
            updateQuery = 'UPDATE users SET name = ?, profile_pic = ? WHERE id = ?';
            params = [name, avatarPath, userId];
        }

        await db.query(updateQuery, params);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── 5. UPDATE PASSWORD ────────────────────────────────────────────────────────
router.post('/update-password', authMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id;

        if (!newPassword || newPassword.length < 6)
            return res.status(400).json({ success: false, message: 'Min 6 characters required' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;