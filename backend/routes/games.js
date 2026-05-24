const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();

// All game types with payout multipliers
const GAME_TYPES = {
  'single_digit':      { name: 'Single Digit',       payout: 9,     min_digits: 1, max_digits: 1 },
  'jodi':              { name: 'Jodi',               payout: 90,    min_digits: 2, max_digits: 2 },
  'single_pana':       { name: 'Single Pana',        payout: 150,   min_digits: 3, max_digits: 3 },
  'double_pana':       { name: 'Double Pana',        payout: 300,   min_digits: 3, max_digits: 3 },
  'triple_pana':       { name: 'Triple Pana',        payout: 600,   min_digits: 3, max_digits: 3 },
  'family_pana':       { name: 'Family Pana',        payout: 150,   min_digits: 3, max_digits: 3 },
  'family_jodi':       { name: 'Family Jodi',        payout: 90,    min_digits: 2, max_digits: 2 },
  'half_sangam_a':     { name: 'Half Sangam A',      payout: 1500,  min_digits: 4, max_digits: 4 },
  'half_sangam_b':     { name: 'Half Sangam B',      payout: 1500,  min_digits: 4, max_digits: 4 },
  'full_sangam':       { name: 'Full Sangam',        payout: 10000, min_digits: 6, max_digits: 6 },
  'sp_motor':          { name: 'SP Motor',           payout: 150,   min_digits: 3, max_digits: 10 },
  'dp_motor':          { name: 'DP Motor',           payout: 300,   min_digits: 3, max_digits: 3 },
  'tp_motor':          { name: 'TP Motor',           payout: 600,   min_digits: 3, max_digits: 3 },
  'odd_even':          { name: 'Odd Even',           payout: 2,     min_digits: 1, max_digits: 1 },
  'family_jodi':       { name: 'Family Jodi',        payout: 90,    min_digits: 2, max_digits: 2 },
  'cycle_pana':        { name: 'Cycle Pana',         payout: 150,   min_digits: 3, max_digits: 3 },
  'sp_dp_tp':          { name: 'SP DP TP',           payout: 150,   min_digits: 3, max_digits: 3 },
  'red_bracket':       { name: 'Red Bracket',        payout: 9,     min_digits: 1, max_digits: 1 },
  'common_digit':      { name: 'Common Digit',       payout: 9,     min_digits: 1, max_digits: 1 },
  'choice_sangam':     { name: 'Choice Sangam',      payout: 10000, min_digits: 6, max_digits: 6 },
  'open_close':        { name: 'Open/Close',         payout: 9,     min_digits: 1, max_digits: 1 },
  'jackpot':           { name: 'Jackpot',            payout: 9000,  min_digits: 3, max_digits: 3 },
  'panel_group':       { name: 'Panel Group',        payout: 150,   min_digits: 3, max_digits: 3 },
  'gunule':            { name: 'Gunule',             payout: 9,     min_digits: 1, max_digits: 1 },
  'jodi_digit':        { name: 'Jodi Digit',         payout: 90,    min_digits: 2, max_digits: 2 },
  'single_digit_bulk': { name: 'Single Digit Bulk',  payout: 9,     min_digits: 1, max_digits: 1 },
  'jodi_bulk':         { name: 'Jodi Bulk',          payout: 90,    min_digits: 2, max_digits: 2 },
  'red_jodi':          { name: 'Red Jodi',           payout: 90,    min_digits: 2, max_digits: 2 },
  'cycle_jodi':        { name: 'Cycle Jodi',         payout: 90,    min_digits: 2, max_digits: 2 },
  'digit_jodi':        { name: 'Digit Jodi',         payout: 90,    min_digits: 2, max_digits: 2 },
  'sp_common':         { name: 'SP Common',          payout: 150,   min_digits: 3, max_digits: 3 },
  'dp_common':         { name: 'DP Common',          payout: 300,   min_digits: 3, max_digits: 3 },
  'single_pana_bulk':  { name: 'Single Pana Bulk',   payout: 150,   min_digits: 3, max_digits: 3 },
  'double_pana_bulk':  { name: 'Double Pana Bulk',   payout: 300,   min_digits: 3, max_digits: 3 },
  'two_digit_pana':    { name: 'Two Digit Pana',     payout: 300,   min_digits: 3, max_digits: 3 }
};

// ─── PANA FAMILIES DATA ────────────────────────────────────────────────────────
const PANA_FAMILIES = {
  "111":["111","116","166","666"],
  "112":["112","117","126","167","266","667"],
  "113":["113","118","136","168","366","668"],
  "114":["114","119","146","169","466","669"],
  "115":["110","115","156","160","566","660"],
  "122":["122","127","177","226","267","677"],
  "123":["123","128","137","178","236","268","367","678"],
  "124":["124","129","147","179","246","269","467","679"],
  "125":["120","125","157","170","256","260","567","670"],
  "133":["133","138","188","336","368","688"],
  "134":["134","139","148","189","346","369","468","689"],
  "135":["130","135","158","180","356","360","568","680"],
  "144":["144","149","199","446","469","699"],
  "145":["140","145","159","190","456","460","569","690"],
  "155":["100","150","155","556","560","600"],
  "222":["222","227","277","777"],
  "223":["223","228","237","278","377","778"],
  "224":["224","229","247","279","477","779"],
  "225":["220","225","257","270","577","770"],
  "233":["233","238","288","337","378","788"],
  "234":["234","239","248","289","347","379","478","789"],
  "235":["230","235","258","280","357","370","578","780"],
  "244":["244","249","299","447","479","799"],
  "245":["240","245","259","290","457","470","579","790"],
  "255":["200","250","255","557","570","700"],
  "333":["333","338","388","888"],
  "334":["334","339","348","389","488","889"],
  "335":["330","335","358","380","588","880"],
  "344":["344","349","399","448","489","899"],
  "345":["340","345","359","390","458","480","589","890"],
  "355":["300","350","355","558","580","800"],
  "444":["444","449","499","999"],
  "445":["440","445","459","490","599","990"],
  "455":["400","450","455","559","590","900"],
  "555":["000","500","550","555"]
};

// ─── JODI FAMILIES DATA ───────────────────────────────────────────────────────
const JODI_FAMILIES = {
  "12": ["12","17","21","26","62","67","71","76"],
  "13": ["13","18","31","36","63","68","81","86"],
  "14": ["14","19","41","46","64","69","91","96"],
  "15": ["01","06","10","15","51","56","60","65"],
  "23": ["23","28","32","37","73","78","82","87"],
  "24": ["24","29","42","47","74","79","92","97"],
  "25": ["02","07","20","25","52","57","70","75"],
  "34": ["34","39","43","48","84","89","93","98"],
  "35": ["03","08","30","35","53","58","80","85"],
  "45": ["04","09","40","45","54","59","90","95"],
  "half_red": ["05","16","27","38","49","50","61","72","83","94"],
  "full_red":  ["00","11","22","33","44","55","66","77","88","99"]
};

// Kisi bhi jodi se uski family dhundho
function getFamilyFromJodi(jodi) {
  for (let family in JODI_FAMILIES) {
    if (JODI_FAMILIES[family].includes(jodi)) return family;
  }
  return null;
}

// Family dhundho kisi bhi pana se
function getFamilyFromPana(pana) {
  for (let family in PANA_FAMILIES) {
    if (PANA_FAMILIES[family].includes(pana)) return family;
  }
  return null;
}

// ─── SP MOTOR LOGIC HELPER ────────────────────────────────────────────────────
function generateSPMotor(numberString) {
  const digits = String(numberString).split('').map(Number);
  const uniqueSortedDigits = [...new Set(digits)].sort((a, b) => a - b);
  const spCombinations = [];
  const n = uniqueSortedDigits.length;

  if (n < 3) return [];

  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        spCombinations.push(`${uniqueSortedDigits[i]}${uniqueSortedDigits[j]}${uniqueSortedDigits[k]}`);
      }
    }
  }
  return spCombinations;
}


// ─── GET ALL GAMES ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || null;

    let query = `SELECT id, name, game_category, open_time, close_time, result_time, status,
                        open_result, close_result, jodi_result, min_bid, max_bid, created_at
                 FROM games WHERE status != 'deleted'`;
    const params = [];

    if (category) {
      query += ' AND game_category = ?';
      params.push(category);
    }

    query += ' ORDER BY open_time ASC';

    const [games] = await db.query(query, params);

    const gameTypes = Object.entries(GAME_TYPES).map(([key, val]) => ({
      type: key, ...val
    }));

    res.json({ success: true, games, game_types: gameTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ─── GET SINGLE GAME ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM games WHERE id = ? AND status != "deleted"',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, game: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ─── PLACE BID ────────────────────────────────────────────────────────────────
router.post('/bid', authMiddleware, [
  body('game_id').isInt().withMessage('Valid game ID required'),
  body('game_type').notEmpty().withMessage('Game type required'),
  body('number').notEmpty().withMessage('Number required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('session').isIn(['open', 'close']).withMessage('Session must be open or close')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { game_id, game_type, number, amount, session } = req.body;
  const bidAmountPerCombination = parseFloat(amount);

  if (!GAME_TYPES[game_type]) {
    return res.status(400).json({ success: false, message: 'Invalid game type: ' + game_type });
  }

  // ─── COMBINATIONS & TOTAL AMOUNT DECIDE ───────────────────────────────────
  let combinations = [number];
  let totalBidAmount = bidAmountPerCombination;
  let isMotor = false;
  let isFamilyPana = false;

  if (game_type === 'sp_motor') {
    isMotor = true;
    combinations = generateSPMotor(number);

    if (combinations.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid SP Motor digits. Provide at least 3 unique digits.' });
    }
    totalBidAmount = bidAmountPerCombination * combinations.length;

  } else if (game_type === 'family_pana') {
    isFamilyPana = true;
    const foundFamily = getFamilyFromPana(number);

    if (!foundFamily) {
      return res.status(400).json({ success: false, message: 'Yeh pana kisi family mein nahi mila: ' + number });
    }

    combinations = PANA_FAMILIES[foundFamily];
    totalBidAmount = bidAmountPerCombination * combinations.length;

  } else if (game_type === 'family_jodi') {
    // Family Jodi logic
    const foundFamily = getFamilyFromJodi(number);

    if (!foundFamily) {
      return res.status(400).json({ success: false, message: 'Yeh jodi kisi family mein nahi mili: ' + number });
    }

    combinations = JODI_FAMILIES[foundFamily];
    totalBidAmount = bidAmountPerCombination * combinations.length;
  }
  // ──────────────────────────────────────────────────────────────────────────

  const minBid = parseFloat(process.env.MIN_BID_AMOUNT || 10);
  const maxBid = parseFloat(process.env.MAX_BID_AMOUNT || 10000);

  if (bidAmountPerCombination < minBid) return res.status(400).json({ success: false, message: `Minimum bid ₹${minBid}` });
  if (bidAmountPerCombination > maxBid) return res.status(400).json({ success: false, message: `Maximum bid ₹${maxBid}` });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [games] = await conn.query('SELECT * FROM games WHERE id = ? FOR UPDATE', [game_id]);
    if (!games.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const game = games[0];

    if (game.status !== 'open') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Betting is ${game.status} for this game` });
    }

    const [users] = await conn.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    const user = users[0];
    const walletBal = parseFloat(user.wallet_balance);
    const winBal    = parseFloat(user.winning_balance);
    const totalBalance = walletBal + winBal;

    if (totalBalance < totalBidAmount) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Total required: ₹${totalBidAmount}, Available: ₹${totalBalance.toFixed(2)}`
      });
    }

    // Deduction logic (wallet pehle, winning baad me)
    let remainingDeduction = totalBidAmount;
    let totalWalletDeducted = 0;
    let totalWinDeducted = 0;

    if (walletBal >= remainingDeduction) {
      totalWalletDeducted = remainingDeduction;
      remainingDeduction = 0;
    } else {
      totalWalletDeducted = walletBal;
      remainingDeduction -= walletBal;
      totalWinDeducted = remainingDeduction;
    }

    await conn.query(
      'UPDATE users SET wallet_balance = wallet_balance - ?, winning_balance = winning_balance - ? WHERE id = ?',
      [totalWalletDeducted, totalWinDeducted, req.user.id]
    );

    const payout = GAME_TYPES[game_type].payout;
    const potential_winning_per_bid = bidAmountPerCombination * payout;

    const walletDeductedPerBid = totalWalletDeducted / combinations.length;
    const winDeductedPerBid    = totalWinDeducted / combinations.length;

    const categoryLabel = game.game_category === 'starline' ? '⭐ Starline' :
                          game.game_category === 'disawar'  ? '🎰 Disawar'  : '';

    // Har combination ke liye bid DB mein insert karo
    for (const combo of combinations) {
      await conn.query(
        `INSERT INTO bids (user_id, game_id, game_type, session, number, amount, potential_winning, wallet_deducted, winning_deducted, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CONVERT_TZ(NOW(), '+00:00', '+05:30'))`,
        [req.user.id, game_id, game_type, session, combo, bidAmountPerCombination, potential_winning_per_bid, walletDeductedPerBid, winDeductedPerBid]
      );
    }

    // Transaction description
    const description = isMotor
        ? `Bid: ${categoryLabel} ${game.name} | SP Motor (${number}) | ${combinations.length} Pannas`
        : isFamilyPana
        ? `Bid: ${categoryLabel} ${game.name} | Family Pana (${number}) | ${combinations.length} Pannas`
        : game_type === 'family_jodi'
        ? `Bid: ${categoryLabel} ${game.name} | Family Jodi (${number}) | ${combinations.length} Jodis`
        : `Bid: ${categoryLabel} ${game.name} | ${GAME_TYPES[game_type].name} | ${number}`;

    await conn.query(
      `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
       VALUES (?, 'debit', 'wallet', ?, ?, ?, 'completed')`,
      [req.user.id, totalBidAmount, description, game_id]
    );

    await conn.commit();

    const [updatedUser] = await db.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ?',
      [req.user.id]
    );

    res.status(201).json({
      success: true,
      message: isMotor
        ? `SP Motor Placed! ${combinations.length} Pannas generated.`
        : isFamilyPana
        ? `Family Pana Placed! ${combinations.length} Pannas cover ho gayi.`
        : game_type === 'family_jodi'
        ? `Family Jodi Placed! ${combinations.length} Jodis cover ho gayi.`
        : 'Bid placed successfully!',
      combinations_generated: combinations,
      total_amount_deducted: totalBidAmount,
      new_balance: {
        wallet_balance:  parseFloat(updatedUser[0].wallet_balance),
        winning_balance: parseFloat(updatedUser[0].winning_balance)
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Bid error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});


// ─── MY BIDS ──────────────────────────────────────────────────────────────────
router.get('/bids/my', authMiddleware, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    let query = `
      SELECT b.id, b.game_type, b.session, b.number, b.amount, b.potential_winning,
             b.status, b.win_amount, b.created_at,
             g.name as game_name, g.game_category,
             g.open_result, g.close_result, g.jodi_result
      FROM bids b
      JOIN games g ON b.game_id = g.id
      WHERE b.user_id = ?`;
    const params = [req.user.id];

    if (status) { query += ' AND b.status = ?'; params.push(status); }
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [bids] = await db.query(query, params);
    const [count] = await db.query(
      'SELECT COUNT(*) as total FROM bids WHERE user_id = ?' + (status ? ' AND status = ?' : ''),
      status ? [req.user.id, status] : [req.user.id]
    );

    res.json({
      success: true,
      bids,
      pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ─── GAME RESULTS ─────────────────────────────────────────────────────────────
router.get('/:id/results', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.game_category, g.open_result, g.close_result, g.jodi_result,
              g.result_declared_at, g.open_time, g.close_time
       FROM games g WHERE g.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, result: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ─── PAST RESULTS ─────────────────────────────────────────────────────────────
router.get('/results/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await db.query(
      `SELECT id, name, game_category, open_result, close_result, jodi_result, result_declared_at
       FROM games WHERE jodi_result IS NOT NULL
       ORDER BY result_declared_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, results: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
