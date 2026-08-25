// ─────────────────────────────────────────────────────────────────────────────
//  scheduler.js  —  MatkaKing Auto Result Declarator (FULLY FIXED)
// ─────────────────────────────────────────────────────────────────────────────

process.env.TZ = 'Asia/Kolkata';

const cron = require('node-cron');
const db   = require('./config/db');

// ── GAME PAYOUTS ──────────────────────────────────────────────────────────────
const GAME_PAYOUTS = {
  single_digit:      9,  jodi:            90,  single_pana:   150,
  double_pana:     300,  triple_pana:    600,  half_sangam_a: 1500,
  half_sangam_b:  1500,  full_sangam:  10000,  sp_motor:       150,
  dp_motor:        300,  tp_motor:       600,  odd_even:         2,
  family_jodi:      90,  cycle_pana:     150,  sp_dp_tp:       150,
  red_bracket:       9,  common_digit:     9,  choice_sangam: 10000,
  open_close:        9,  jackpot:       9000,  panel_group:    150,
  gunule:            9,  jodi_digit:      90,  single_digit_bulk: 9,
  jodi_bulk:        90,  red_jodi:        90,  cycle_jodi:      90,
  digit_jodi:       90,  sp_common:      150,  dp_common:      300,
  single_pana_bulk: 150, double_pana_bulk: 300,
};

// ── VALID PANAS ───────────────────────────────────────────────────────────────
function generateAllPanas() {
  const sp = [], dp = [], tp = [];
  for (let i = 0; i <= 9; i++)
    for (let j = i; j <= 9; j++)
      for (let k = j; k <= 9; k++) {
        const num = `${i}${j}${k}`;
        const unique = new Set([i,j,k]).size;
        if (unique === 3) sp.push(num);
        else if (unique === 2) dp.push(num);
        else tp.push(num);
      }
  return { sp, dp, tp };
}

const { sp: SINGLE_PANAS, dp: DOUBLE_PANAS, tp: TRIPLE_PANAS } = generateAllPanas();
const ALL_PANAS = [...SINGLE_PANAS, ...DOUBLE_PANAS, ...TRIPLE_PANAS];

function panaDigit(pana) {
  return String(pana.split('').reduce((a, b) => a + parseInt(b), 0) % 10);
}

// ── MINIMUM PAYOUT ALGORITHM ──────────────────────────────────────────────────
async function findBestResult(gameId, session) {
  const [bids] = await db.query(
    "SELECT game_type, number, amount FROM bids WHERE game_id=? AND session=? AND status='pending'",
    [gameId, session]
  );
  if (!bids.length) return ALL_PANAS[Math.floor(Math.random() * ALL_PANAS.length)];

  let bestResult = null, minPayout = Infinity;

  for (const candidate of ALL_PANAS) {
    const candidateDigit = panaDigit(candidate);
    let totalPayout = 0;

    for (const bid of bids) {
      const payout = GAME_PAYOUTS[bid.game_type] || 9;
      const amount = parseFloat(bid.amount);
      let wins = false;

      switch (bid.game_type) {
        case 'single_digit': case 'single_digit_bulk': case 'gunule':
        case 'red_bracket':  case 'common_digit':      case 'open_close':
          wins = String(bid.number) === candidateDigit; break;
        case 'single_pana': case 'single_pana_bulk': case 'sp_motor':
        case 'cycle_pana':  case 'panel_group':      case 'sp_dp_tp':
          wins = SINGLE_PANAS.includes(bid.number) && bid.number === candidate; break;
        case 'double_pana': case 'double_pana_bulk': case 'dp_motor':
          wins = DOUBLE_PANAS.includes(bid.number) && bid.number === candidate; break;
        case 'triple_pana': case 'tp_motor':
          wins = TRIPLE_PANAS.includes(bid.number) && bid.number === candidate; break;
        default:
          wins = String(bid.number) === candidateDigit;
      }
      if (wins) totalPayout += amount * payout;
    }
    if (totalPayout < minPayout) { minPayout = totalPayout; bestResult = candidate; }
  }
  return bestResult || ALL_PANAS[Math.floor(Math.random() * ALL_PANAS.length)];
}

// ── DECLARE FULL RESULT (open + close + winners) ──────────────────────────────
async function declareResult(game, openResult, closeResult) {
  const openDigit  = parseInt(openResult.split('').reduce((a,b) => a+parseInt(b), 0)) % 10;
  const closeDigit = parseInt(closeResult.split('').reduce((a,b) => a+parseInt(b), 0)) % 10;
  const jodiResult = `${openDigit}${closeDigit}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE games SET 
        open_result=?, close_result=?, jodi_result=?, 
        status='closed', 
        result_declared_at=NOW() 
       WHERE id=?`,
      [openResult, closeResult, jodiResult, game.id]
    );

    // ── CHART DATA SAVE LOGIC ──────────────────────────────────────────
    // Scheduler bhi result declare kare toh game_results mein save kare
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await conn.query(
        `INSERT INTO game_results (game_id, result_date, open_result, close_result, jodi_result, open_digit, close_digit, result_source)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduler')
         ON DUPLICATE KEY UPDATE 
           open_result = VALUES(open_result), 
           close_result = VALUES(close_result), 
           jodi_result = VALUES(jodi_result),
           open_digit = VALUES(open_digit),
           close_digit = VALUES(close_digit)`,
        [game.id, todayDate, openResult, closeResult, jodiResult, openDigit, closeDigit]
      );
    } catch (chartErr) {
      console.error(`❌ Scheduler Chart save error for ${game.name}:`, chartErr.message);
    }
    // ────────────────────────────────────────────────────────────────────

    const [bids] = await conn.query(
      "SELECT * FROM bids WHERE game_id=? AND status='pending'",
      [game.id]
    );

    let winners = 0, totalPaid = 0;

    for (const bid of bids) {
      let isWinner = false;
      const result = bid.session === 'open' ? openResult : closeResult;

      switch (bid.game_type) {
        case 'single_digit': case 'single_digit_bulk': case 'gunule':
        case 'red_bracket':  case 'common_digit':      case 'open_close': {
          const digit = bid.session === 'open' ? String(openDigit) : String(closeDigit);
          isWinner = String(bid.number) === digit; break;
        }
        case 'jodi': case 'family_jodi': case 'jodi_digit':
        case 'jodi_bulk': case 'red_jodi': case 'cycle_jodi': case 'digit_jodi':
          isWinner = bid.number === jodiResult; break;
        case 'single_pana': case 'single_pana_bulk': case 'double_pana':
        case 'double_pana_bulk': case 'triple_pana': case 'sp_motor':
        case 'dp_motor': case 'tp_motor': case 'cycle_pana':
        case 'sp_dp_tp': case 'panel_group':
          isWinner = bid.number === result; break;
        case 'full_sangam': case 'choice_sangam':
          isWinner = bid.number === `${openResult}-${closeResult}`; break;
        case 'half_sangam_a':
          isWinner = bid.number === `${openResult}-${closeDigit}`; break;
        case 'half_sangam_b':
          isWinner = bid.number === `${openDigit}-${closeResult}`; break;
        case 'odd_even':
          isWinner = (bid.number==='odd' && openDigit%2!==0) ||
                     (bid.number==='even' && openDigit%2===0); break;
        default:
          isWinner = bid.number === result;
      }

      if (isWinner) {
        const winAmount = parseFloat(bid.amount) * (GAME_PAYOUTS[bid.game_type] || 9);
        await conn.query('UPDATE users SET winning_balance=winning_balance+? WHERE id=?', [winAmount, bid.user_id]);
        await conn.query("UPDATE bids SET status='win', win_amount=? WHERE id=?", [winAmount, bid.id]);      
          await conn.query(
          `INSERT INTO transactions (user_id,type,wallet_type,amount,description,reference_id,status)
           VALUES (?,'credit','winning_wallet',?,?,?,'completed')`,
          [bid.user_id, winAmount, `Auto Result: ${game.name} — ${jodiResult}`, bid.id]
        );
        winners++; totalPaid += winAmount;
      } else {
        await conn.query("UPDATE bids SET status='loss' WHERE id=?", [bid.id]);      }
    }

    await conn.commit();
    console.log(`✅ [CLOSE] ${game.name} | ${openResult}-${jodiResult}-${closeResult} | Winners:${winners} Paid:₹${totalPaid}`);
  } catch (err) {
    await conn.rollback();
    console.error(`❌ [CLOSE] ${game.name} failed:`, err.message);
  } finally {
    conn.release();
  }
}

// ── OPEN RESULT PROCESS ───────────────────────────────────────────────────────
async function processOpenResults() {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;

    // ✅ FIX: open_time column, open_result NULL check
    const [games] = await db.query(
      `SELECT * FROM games
       WHERE status = 'open'
         AND open_result IS NULL
         AND TIME_FORMAT(open_time, '%H:%i:%s') = ?`,
      [currentTime]
    );

    for (const game of games) {
      console.log(`🕐 [OPEN] ${game.name} — open result declare ho raha hai...`);
      const openResult = await findBestResult(game.id, 'open');
      await db.query(`UPDATE games SET open_result=? WHERE id=?`, [openResult, game.id]);
      console.log(`✅ [OPEN] ${game.name} | Result: ${openResult} (digit:${panaDigit(openResult)})`);
    }
  } catch (err) {
    console.error('❌ [OPEN] Error:', err.message);
  }
}

// ── CLOSE RESULT PROCESS ──────────────────────────────────────────────────────
async function processCloseResults() {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;

    // ✅ FIX 1: close_time column use karo (result_time nahi)
    // ✅ FIX 2: status='closed' mat check karo — sirf close_result NULL check karo
    const [games] = await db.query(
      `SELECT * FROM games
       WHERE status = 'open'
         AND close_result IS NULL
         AND TIME_FORMAT(close_time, '%H:%i:%s') = ?`,
      [currentTime]
    );

    for (const game of games) {
      console.log(`🕐 [CLOSE] ${game.name} — close result declare ho raha hai...`);

      // Open result nahi hai toh pehle set karo
      let openResult = game.open_result;
      if (!openResult) {
        openResult = await findBestResult(game.id, 'open');
        console.log(`⚠️  [CLOSE] ${game.name} — open result missing tha, auto set: ${openResult}`);
      }

      const closeResult = await findBestResult(game.id, 'close');
      await declareResult(game, openResult, closeResult);
    }
  } catch (err) {
    console.error('❌ [CLOSE] Error:', err.message);
  }
}

// ── DAILY RESET (midnight) ────────────────────────────────────────────────────
async function dailyReset() {
  try {
    await db.query(
      `UPDATE games
       SET open_result         = NULL,
           close_result        = NULL,
           jodi_result         = NULL,
           result_declared_at  = NULL,
           status              = 'open'
       WHERE status != 'deleted'`
    );
    console.log('🔄 [DAILY RESET] Sab games reset — nayi date ke liye open!');
  } catch (err) {
    console.error('❌ [DAILY RESET] Error:', err.message);
  }
}

// ── CRON JOBS ─────────────────────────────────────────────────────────────────

// Har minute open result check
cron.schedule('* * * * *', () => {
  processOpenResults();
}, { timezone: 'Asia/Kolkata' });

// Har minute close result check
cron.schedule('* * * * *', () => {
  processCloseResults();
}, { timezone: 'Asia/Kolkata' });

// Raat 12 baje daily reset
cron.schedule('0 2 * * *', () => {
  dailyReset();
}, { timezone: 'Asia/Kolkata' });

console.log('🤖 [SCHEDULER] MatkaKing Auto Result System STARTED');
console.log('   → Har minute: open/close result check');
console.log('   → Raat 12 baje: daily reset');

// ═══════════════════════════════════════════════════════════════════════════════
//  DISAWAR AUTO SYNC — lucky-satta.com (NAYA CODE — PURANA KUCH TOUCH NAHI)
// ═══════════════════════════════════════════════════════════════════════════════

const { syncDisawarResults } = require('./routes/scraper');

// Har 5 minute mein Disawar results sync karo
cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await syncDisawarResults();
    if (result.updated > 0) {
      console.log(`✅ [DISAWAR SYNC] ${result.updated} games updated | Date: ${result.ist_date}`);
      if (result.log && result.log.length) {
        result.log.forEach(l => console.log(`   → ${l.game} | Jodi: ${l.jodi}`));
      }
    }
  } catch (err) {
    console.error('❌ [DISAWAR SYNC] Error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

// Raat 1 baje Disawar games reset (main reset 2 baje hota hai)
cron.schedule('0 1 * * *', async () => {
  try {
    const disawarKeywords = ['desawar', 'gali', 'faridabad', 'gajiyabad', 'gaziyabad',
                             'dwarka', 'alwar', 'sadar', 'gwalior', 'delhi bazar',
                             'delhi matka', 'shri ganesh', 'shree ganesh', 'agra'];

    const [allGames] = await db.query(
      `SELECT id, name FROM games WHERE status != 'deleted'`
    );

    const disawarGames = allGames.filter(g => {
      const n = g.name.toLowerCase();
      return disawarKeywords.some(k => n.includes(k));
    });

    if (!disawarGames.length) return;

    const ids = disawarGames.map(g => g.id);
    const placeholders = ids.map(() => '?').join(',');

    await db.query(
      `UPDATE games
       SET open_result        = NULL,
           close_result       = NULL,
           jodi_result        = NULL,
           result_declared_at = NULL,
           status             = 'open'
       WHERE id IN (${placeholders})`,
      ids
    );

    console.log(`🔄 [DISAWAR RESET] ${disawarGames.length} Disawar games reset (1 AM)`);
  } catch (err) {
    console.error('❌ [DISAWAR RESET] Error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

console.log('   → Har 5 min: Disawar auto sync (lucky-satta.com)');
console.log('   → Raat 1 baje: Disawar games reset');

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
//  STARLINE AUTO SYNC — dpbossonline.com (NAYA CODE — PURANA KUCH TOUCH NAHI)
// ═══════════════════════════════════════════════════════════════════════════════

const { syncStarlineResults } = require('./routes/scraper');

// Har 5 minute mein Starline results sync karo
cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await syncStarlineResults();
    if (result.updated > 0) {
      console.log(`✅ [STARLINE SYNC] ${result.updated} games updated | Date: ${result.ist_date}`);
      if (result.log && result.log.length) {
        result.log.forEach(l => console.log(`   → ${l.game} | Pana: ${l.pana} | Digit: ${l.digit}`));
      }
    }
  } catch (err) {
    console.error('❌ [STARLINE SYNC] Error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

// Raat 2 baje Starline reset (main reset ke saath)
cron.schedule('5 2 * * *', async () => {
  try {
    await db.query(
      `UPDATE games
       SET open_result        = NULL,
           close_result       = NULL,
           jodi_result        = NULL,
           result_declared_at = NULL,
           result_date        = NULL,
           status             = 'open'
       WHERE game_category = 'starline' AND status != 'deleted'`
    );
    console.log('🔄 [STARLINE RESET] Starline games reset (2:05 AM)');
  } catch (err) {
    console.error('❌ [STARLINE RESET] Error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });

console.log('   → Har 5 min: Starline auto sync (dpbossonline.com)');
console.log('   → Raat 2:05 baje: Starline games reset');

// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { declareResult, findBestResult };