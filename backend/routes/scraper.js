const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ── IST helpers ───────────────────────────────────────────────────────────────
function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  if (ist.getUTCHours() < 2) {
    ist.setUTCDate(ist.getUTCDate() - 1);
  }
  return ist.toISOString().split('T')[0];
}

function getCurrentISTMinutes() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// ── Main page se sab games scrape karo ───────────────────────────────────────
async function scrapeAllGames() {
  const fetchSite = async () => {
    return await axios.get('https://dpbossss.boston', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 20000
    });
  };

  let html;
  try {
    const response = await fetchSite();
    html = response.data;
  } catch (err1) {
    console.log('⚠️ Scraper Error (Attempt 1):', err1.message, '| Retrying in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const response = await fetchSite();
      html = response.data;
    } catch (err2) {
      console.log('❌ Scraper Error (Attempt 2):', err2.message);
      return [];
    }
  }

  const $ = cheerio.load(html);
  const games = [];

  $('h4').each((i, el) => {
    const $el = $(el);
    const gameName = $el.text().trim().toUpperCase()
      .replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

    if (!gameName || gameName.length < 2) return;

    let resultText = '';
    let nextNode = el.nextSibling;
    while (nextNode) {
      if (nextNode.nodeType === 3) {
        const t = nextNode.data.trim().replace(/\s/g, '');
        if (/\d/.test(t)) { resultText = t; break; }
      }
      nextNode = nextNode.nextSibling;
    }

    if (!resultText) {
      const nextEl = $el.next();
      resultText = nextEl.text().trim().replace(/\s/g, '');
    }

    if (resultText.toLowerCase().includes('loading') || resultText.toLowerCase().includes('wait')) {
      return;
    }

    const fullMatch = resultText.match(/^(\d{3})-(\d{2})-(\d{3})$/);
    const openOnly  = resultText.match(/^(\d{3})-(\d{1,2})$/);

    if (fullMatch) {
      games.push({
        gameName, result: resultText,
        open_result: fullMatch[1], jodi_result: fullMatch[2], close_result: fullMatch[3],
        is_complete: true
      });
    } else if (openOnly) {
      games.push({
        gameName, result: resultText,
        open_result: openOnly[1], jodi_result: null, close_result: null,
        is_complete: false
      });
    }
  });

  return games;
}

// ── Name matching ─────────────────────────────────────────────────────────────
function isExactMatch(dbName, scrapedName) {
  const a = dbName.toLowerCase().trim().replace(/\s+/g, ' ');
  const b = scrapedName.toLowerCase().trim().replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
  return a === b;
}

// ── GET /api/scraper/preview ──────────────────────────────────────────────────
router.get('/preview', async (req, res) => {
  try {
    const games = await scrapeAllGames();
    res.json({ success: true, total: games.length, date: getISTDate(), data: games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/scraper/sync ─────────────────────────────────────────────────────
router.get('/sync', async (req, res) => {
  try {
    const result = await syncResults();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PAYOUT MAP ────────────────────────────────────────────────────────────────
const PAYOUTS = {
  'single_digit': 9.5, 'single_digit_bulk': 9.5, 'red_bracket': 9.5, 'common_digit': 9.5, 'gunule': 9.5,
  'jodi': 95, 'jodi_bulk': 95, 'red_jodi': 95, 'cycle_jodi': 95, 'digit_jodi': 95, 'family_jodi': 95,
  'single_pana': 150, 'single_pana_bulk': 150, 'sp_motor': 150, 'sp_common': 150, 'panel_group': 150, 'cycle_pana': 150,
  'double_pana': 300, 'double_pana_bulk': 300, 'dp_motor': 300, 'dp_common': 300,
  'triple_pana': 700, 'tp_motor': 700, 'jackpot': 9000,
  'half_sangam_a': 1000, 'half_sangam_b': 1000,
  'full_sangam': 10000, 'choice_sangam': 10000,
  'odd_even': 2, 'two_digit_pana': 300
};

// ── BID SETTLEMENT LOGIC ─────────────────────────────────────────────────────
async function settleGameBids(gameId, openRes, closeRes) {
  try {
    const [bids] = await db.query(
      'SELECT * FROM bids WHERE game_id = ? AND (status IS NULL OR status = "" OR status = "pending")',
      [gameId]
    );
    if (!bids.length) return;

    let openDigit = null, closeDigit = null, jodi = null;
    if (openRes) openDigit = String(openRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (closeRes) closeDigit = String(closeRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (openDigit !== null && closeDigit !== null) jodi = `${openDigit}${closeDigit}`;

    for (const bid of bids) {
      try {
        let isWin = false;
        let canSettle = false;

        const num  = String(bid.number).trim();
        const type = bid.game_type;
        const isJodiOrSangam = type.includes('jodi') || type.includes('sangam') || type === 'two_digit_pana';

        if (isJodiOrSangam) {
          if (openRes && closeRes) canSettle = true;
        } else {
          if (bid.session === 'open'  && openRes)  canSettle = true;
          if (bid.session === 'close' && closeRes) canSettle = true;
        }

        if (!canSettle) continue;

        if (bid.session === 'open' && openRes && !isJodiOrSangam) {
          if (['single_digit','single_digit_bulk','red_bracket','common_digit','gunule'].includes(type)) {
            if (num == openDigit) isWin = true;
          } else if (['single_pana','double_pana','triple_pana','single_pana_bulk','double_pana_bulk','sp_motor','dp_motor','tp_motor','jackpot','sp_common','dp_common','sp_dp_tp','panel_group','cycle_pana'].includes(type)) {
            if (num == openRes) isWin = true;
          } else if (type === 'odd_even') {
            if ((openDigit % 2 === 0 && num === 'EVEN') || (openDigit % 2 !== 0 && num === 'ODD')) isWin = true;
          }
        }
        else if (bid.session === 'close' && closeRes && !isJodiOrSangam) {
          if (['single_digit','single_digit_bulk','red_bracket','common_digit','gunule'].includes(type)) {
            if (num == closeDigit) isWin = true;
          } else if (['single_pana','double_pana','triple_pana','single_pana_bulk','double_pana_bulk','sp_motor','dp_motor','tp_motor','jackpot','sp_common','dp_common','sp_dp_tp','panel_group','cycle_pana'].includes(type)) {
            if (num == closeRes) isWin = true;
          } else if (type === 'odd_even') {
            if ((closeDigit % 2 === 0 && num === 'EVEN') || (closeDigit % 2 !== 0 && num === 'ODD')) isWin = true;
          }
        }
        else if (isJodiOrSangam && openRes && closeRes) {
          if (['jodi','jodi_bulk','red_jodi','cycle_jodi','digit_jodi'].includes(type) && jodi) {
            if (num == jodi) isWin = true;
          }
          if (type === 'half_sangam_a' && num === `${openDigit}-${closeRes}`) isWin = true;
          if (type === 'half_sangam_b' && num === `${openRes}-${closeDigit}`) isWin = true;
          if (type === 'full_sangam'   && num === `${openRes}-${closeRes}`)   isWin = true;
          if (type === 'two_digit_pana' && num === `${jodi}|${closeRes}`)     isWin = true;
        }

        if (isWin) {
          const payout = PAYOUTS[type] || 1;
          const winAmt = parseFloat(bid.amount) * payout;
          await db.query('UPDATE bids SET status = "win", win_amount = ? WHERE id = ?', [winAmt, bid.id]);
          await db.query('UPDATE users SET winning_balance = winning_balance + ? WHERE id = ?', [winAmt, bid.user_id]);
          await db.query(
            `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
             VALUES (?, 'credit', 'winning_wallet', ?, ?, ?, 'completed')`,
            [bid.user_id, winAmt, `Win: Game ID ${gameId} | ${type} | ${num}`, bid.id]
          );
        } else {
          await db.query('UPDATE bids SET status = "loss" WHERE id = ?', [bid.id]);
        }
      } catch (bidErr) {
        console.error(`❌ Error settling bid ID ${bid.id}:`, bidErr.message);
      }
    }
  } catch (err) {
    console.error('Settle Bids Fetch Error:', err.message);
  }
}

// ── FORCE SETTLE ROUTE ────────────────────────────────────────────────────────
router.get('/force-settle', async (req, res) => {
  try {
    const [games] = await db.query(
      'SELECT id, open_result, close_result FROM games WHERE open_result IS NOT NULL OR close_result IS NOT NULL'
    );
    let settledCount = 0;
    for (const g of games) {
      if (g.open_result || g.close_result) {
        await settleGameBids(g.id, g.open_result, g.close_result);
        settledCount++;
      }
    }
    res.json({ success: true, message: `Force Settle complete! ${settledCount} games processed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MAIN SYNC FUNCTION ────────────────────────────────────────────────────────
async function syncResults() {
  const games = await scrapeAllGames();
  if (!games.length) return { success: false, message: 'Kuch scrape nahi hua' };

  const todayDate  = getISTDate();
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, open_time, close_time, open_result, close_result, result_date
     FROM games WHERE status != 'deleted'`
  );

  let updated = 0, skipped = 0;
  const log = [];

  for (const item of games) {
    const dbGame = dbGames.find(g => isExactMatch(g.name, item.gameName));
    if (!dbGame) continue;

    const openMin  = timeToMinutes(dbGame.open_time);
    const closeMin = timeToMinutes(dbGame.close_time);

    const openTimePassed  = !openMin  || nowMinutes >= openMin;
    const closeTimePassed = !closeMin || nowMinutes >= closeMin;

    let updateOpen = false, updateClose = false;

    if (item.is_complete) {
      if (!closeTimePassed) { skipped++; continue; }
      if (dbGame.close_result !== item.close_result) { updateClose = true; updateOpen = true; }
    } else {
      if (openTimePassed && dbGame.open_result !== item.open_result) updateOpen = true;
    }

    if (!updateOpen && !updateClose) {
      const [pendingBids] = await db.query(
        'SELECT COUNT(*) as cnt FROM bids WHERE game_id = ? AND (status IS NULL OR status = "" OR status = "pending")',
        [dbGame.id]
      );
      if (pendingBids[0].cnt > 0) {
        await settleGameBids(dbGame.id, dbGame.open_result, dbGame.close_result);
      }
      skipped++; continue;
    }

    if (updateOpen) {
      await db.query(
        `UPDATE games SET open_result = ?, jodi_result = COALESCE(?, jodi_result),
          result_date = ?, result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') WHERE id = ?`,
        [item.open_result, item.jodi_result, todayDate, dbGame.id]
      );
    }
    if (updateClose) {
      await db.query(
        `UPDATE games SET close_result = ?, jodi_result = COALESCE(?, jodi_result),
          result_date = ?, result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') WHERE id = ?`,
        [item.close_result, item.jodi_result, todayDate, dbGame.id]
      );
    }

    const finalOpenRes  = updateOpen  ? item.open_result  : dbGame.open_result;
    const finalCloseRes = updateClose ? item.close_result : dbGame.close_result;
    await settleGameBids(dbGame.id, finalOpenRes, finalCloseRes);

    if (finalOpenRes && finalCloseRes) {
      try {
        const openDigit  = String(finalOpenRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
        const closeDigit = String(finalCloseRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
        const finalJodi  = `${openDigit}${closeDigit}`;
        await db.query(
          `INSERT INTO game_results (game_id, result_date, open_result, close_result, jodi_result, open_digit, close_digit, result_source)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'scraper')
           ON DUPLICATE KEY UPDATE
             open_result = VALUES(open_result), close_result = VALUES(close_result),
             jodi_result = VALUES(jodi_result), open_digit = VALUES(open_digit), close_digit = VALUES(close_digit)`,
          [dbGame.id, todayDate, finalOpenRes, finalCloseRes, finalJodi, openDigit, closeDigit]
        );
      } catch (chartErr) {
        console.error(`❌ Chart save error for ${dbGame.name}:`, chartErr.message);
      }
    }

    updated++;
    log.push({ game: dbGame.name, result: item.result });
  }

  return {
    success: true, message: `${updated} games updated`,
    ist_date: todayDate,
    ist_time: `${Math.floor(nowMinutes/60)}:${String(nowMinutes%60).padStart(2,'0')}`,
    updated, skipped, log
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DISAWAR SCRAPER
// ═══════════════════════════════════════════════════════════════════════════════

const SITE_TO_DB_MAP = {
  'DESAWAR'      : 'DESAWAR',
  'GALI'         : 'GALI',
  'FARIDABAD'    : 'FARIDABAD',
  'GHAZIABAD'    : 'GAZIYABAD',
  'DELHI BAZAR'  : 'DELHI BAZAR',
  'MOHALI'       : 'MOHALI',
  'SHRI GANESH'  : 'SHRI GANESH',
  'GWALIOR BAZAR': 'GWALIOR',
  'AGRA BAZAR'   : 'AGRA',
};

async function scrapeDisawarResults() {
  const url = 'https://satta-king-fast.com/delhi-bazar/satta-result-chart/db/';

  let html;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 20000
    });
    html = res.data;
  } catch (err1) {
    console.log('⚠️ [DISAWAR] Scrape Error (Attempt 1):', err1.message, '| Retrying...');
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
      html = res.data;
    } catch (err2) {
      console.log('❌ [DISAWAR] Scrape failed (Attempt 2):', err2.message);
      return [];
    }
  }

  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();

  $('table tr').each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const rawText = $(cells[0]).text().trim().replace(/\s+/g, ' ');
    const atIndex = rawText.indexOf(' at ');
    if (atIndex === -1) return;

    const gameName = rawText.substring(0, atIndex).trim().toUpperCase();
    if (!gameName || gameName.length < 2) return;
    if (!SITE_TO_DB_MAP[gameName]) return;
    if (seen.has(gameName)) return;
    seen.add(gameName);

    const lastCellIndex = cells.length - 1;
    const todayRaw = $(cells[lastCellIndex]).text().trim().replace(/\s+/g, '');

    if (!todayRaw || /^x+$/i.test(todayRaw) || todayRaw === '--') return;

    const digits = todayRaw.replace(/[^0-9]/g, '');
    if (!/^\d{2}$/.test(digits)) return;

    results.push({ siteName: gameName, jodi: digits });
  });

  console.log(`📊 [DISAWAR] Scraped ${results.length} results`);
  results.forEach(r => console.log(`   → ${r.siteName} | Jodi: ${r.jodi}`));
  return results;
}

// ── DB update helper ──────────────────────────────────────────────────────────
async function updateDisawarGameInDB(gameId, jodi, todayDate) {
  const openDigit  = jodi[0];
  const closeDigit = jodi[1];

  await db.query(
    `UPDATE games SET
      open_result        = ?,
      close_result       = ?,
      jodi_result        = ?,
      result_date        = ?,
      result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
     WHERE id = ?`,
    [openDigit, closeDigit, jodi, todayDate, gameId]
  );

  await db.query(
    `INSERT INTO game_results
      (game_id, result_date, open_result, close_result, jodi_result, open_digit, close_digit, result_source)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'disawar_scraper')
     ON DUPLICATE KEY UPDATE
       open_result  = VALUES(open_result),
       close_result = VALUES(close_result),
       jodi_result  = VALUES(jodi_result),
       open_digit   = VALUES(open_digit),
       close_digit  = VALUES(close_digit)`,
    [gameId, todayDate, openDigit, closeDigit, jodi, openDigit, closeDigit]
  );

  await settleGameBids(gameId, openDigit, closeDigit);
}

// ── One-shot sync (manual/cron ke liye) ──────────────────────────────────────
async function syncDisawarResults() {
  const scraped = await scrapeDisawarResults();
  if (!scraped.length) {
    return { success: false, message: '[DISAWAR] Kuch scrape nahi hua' };
  }

  const todayDate  = getISTDate();
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, close_time, open_result, close_result, result_date
     FROM games WHERE game_category = 'disawar' AND status != 'deleted'`
  );

  let updated = 0, skipped = 0;
  const log = [];

  for (const item of scraped) {
    const dbName = SITE_TO_DB_MAP[item.siteName];
    if (!dbName) continue;

    const dbGame = dbGames.find(g => g.name.trim().toUpperCase() === dbName);
    if (!dbGame) continue;

    const closeMin = timeToMinutes(dbGame.close_time);
    if (closeMin && nowMinutes < closeMin) { skipped++; continue; }

    // Already same result aaj ka — skip
    if (dbGame.close_result === item.jodi && dbGame.result_date === todayDate) {
      skipped++;
      continue;
    }

    try {
      await updateDisawarGameInDB(dbGame.id, item.jodi, todayDate);
      updated++;
      log.push({ game: dbGame.name, jodi: item.jodi });
      console.log(`✅ [DISAWAR] ${dbGame.name} | Jodi: ${item.jodi}`);
    } catch (err) {
      console.error(`❌ [DISAWAR] ${dbGame.name} update failed:`, err.message);
    }
  }

  return {
    success: true, message: `[DISAWAR] ${updated} games updated`,
    ist_date: todayDate, updated, skipped, log
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTO POLLING SYSTEM
//  ✅ Close time ke baad bhi result aane tak check karta rahe
//  ✅ Result aa gaya toh polling khud band ho jaye
//  ✅ Max 3 ghante tak try kare — uske baad band
// ═══════════════════════════════════════════════════════════════════════════════

const activePollers = new Map(); // key: gameId → { intervalId, startedAt, gameName }

function stopPolling(gameId) {
  const poller = activePollers.get(gameId);
  if (poller) {
    clearInterval(poller.intervalId);
    activePollers.delete(gameId);
    console.log(`🔴 [POLL] Polling STOP: ${poller.gameName}`);
  }
}

function stopAllPolling() {
  for (const [gameId] of activePollers) stopPolling(gameId);
  console.log('🛑 [POLL] Saare pollers band');
}

function startPollingForDisawarGame(dbGame) {
  const gameId   = dbGame.id;
  const gameName = dbGame.name;

  if (activePollers.has(gameId)) {
    console.log(`⏭️  [POLL] ${gameName} already chal raha hai`);
    return;
  }

  console.log(`🟢 [POLL] Polling START: ${gameName}`);

  const MAX_POLL_MINUTES = 180; // 3 ghante max
  const startedAt = Date.now();

  const intervalId = setInterval(async () => {
    try {
      const nowMinutes  = getCurrentISTMinutes();
      const elapsedMins = Math.floor((Date.now() - startedAt) / 60000);

      // ── Max time limit ────────────────────────────────────────────────────
      if (elapsedMins >= MAX_POLL_MINUTES) {
        console.log(`⏰ [POLL] ${gameName} — 3 ghante ho gaye, result nahi aaya. Band.`);
        stopPolling(gameId);
        return;
      }

      const istH = String(Math.floor(nowMinutes / 60)).padStart(2, '0');
      const istM = String(nowMinutes % 60).padStart(2, '0');
      console.log(`🔍 [POLL] ${gameName} | Time: ${istH}:${istM} | Elapsed: ${elapsedMins}min`);

      // ── Fresh scrape ──────────────────────────────────────────────────────
      const scrapedList = await scrapeDisawarResults();
      if (!scrapedList || !scrapedList.length) {
        console.log(`⚠️  [POLL] ${gameName} — scrape empty`);
        return;
      }

      // ── Is game ka result dhundo ──────────────────────────────────────────
      const found = scrapedList.find(r => {
        const mappedDbName = SITE_TO_DB_MAP[r.siteName];
        return mappedDbName && mappedDbName.trim().toUpperCase() === gameName.trim().toUpperCase();
      });

      if (!found) {
        console.log(`⏳ [POLL] ${gameName} — result abhi nahi aaya site pe`);
        return;
      }

      // ── DB se latest state lo ─────────────────────────────────────────────
      const [rows] = await db.query(
        'SELECT close_result, result_date FROM games WHERE id = ?',
        [gameId]
      );
      if (!rows.length) { stopPolling(gameId); return; }

      const todayDate = getISTDate();

      // ── Result pehle se same hai toh band ─────────────────────────────────
      if (rows[0].close_result === found.jodi && rows[0].result_date === todayDate) {
        console.log(`✅ [POLL] ${gameName} — already updated (${found.jodi}). Band.`);
        stopPolling(gameId);
        return;
      }

      // ── Naya result mila — update karo ───────────────────────────────────
      console.log(`🎯 [POLL] ${gameName} — RESULT MILA: ${found.jodi}! Updating DB...`);
      await updateDisawarGameInDB(gameId, found.jodi, todayDate);
      console.log(`🏁 [POLL] ${gameName} — Updated! Polling band.`);
      stopPolling(gameId);

    } catch (err) {
      console.error(`❌ [POLL] ${gameName} error:`, err.message);
    }
  }, 60 * 1000); // Har 60 second

  activePollers.set(gameId, { intervalId, startedAt, gameName });
}

// ── Sabhi pending disawar games ke liye polling shuru karo ───────────────────
async function startDisawarPolling() {
  const todayDate  = getISTDate();
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, close_time, open_result, close_result, result_date
     FROM games WHERE game_category = 'disawar' AND status != 'deleted'`
  );

  let started = 0;

  for (const game of dbGames) {
    // Aaj ka result already hai — skip
    if (game.close_result && game.result_date === todayDate) {
      console.log(`✅ [POLL-INIT] ${game.name} — result pehle se hai, skip`);
      continue;
    }

    const closeMin = timeToMinutes(game.close_time);

    // Close time 3+ ghante pehle thi — skip
    if (closeMin && nowMinutes > closeMin + 180) {
      console.log(`⏭️  [POLL-INIT] ${game.name} — close time bahut purani, skip`);
      continue;
    }

    startPollingForDisawarGame(game);
    started++;
  }

  console.log(`🚀 [POLL-INIT] ${started} disawar games ke liye polling shuru`);
  return started;
}

// ── Polling routes ────────────────────────────────────────────────────────────
router.get('/polling-status', (req, res) => {
  const status = [];
  for (const [gameId, data] of activePollers) {
    status.push({
      gameId,
      gameName:    data.gameName,
      elapsedMins: Math.floor((Date.now() - data.startedAt) / 60000)
    });
  }
  res.json({ success: true, activePollers: status.length, pollers: status });
});

router.get('/start-polling', async (req, res) => {
  try {
    const started = await startDisawarPolling();
    res.json({
      success: true,
      message: `${started} games ke liye polling shuru`,
      active:  activePollers.size
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stop-polling', (req, res) => {
  stopAllPolling();
  res.json({ success: true, message: 'Saari polling band' });
});

// ── Disawar API routes ────────────────────────────────────────────────────────
router.get('/disawar-preview', async (req, res) => {
  try {
    const data = await scrapeDisawarResults();
    res.json({ success: true, total: data.length, date: getISTDate(), data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/sync-disawar', async (req, res) => {
  try {
    const result = await syncDisawarResults();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  STARLINE SCRAPER (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

const STARLINE_URL = 'https://dpbossonline.com/starline-panel/2/milan-starline';

const STARLINE_TIME_MAP = {
  '09:30': '9:30 AM',  '10:30': '10:30 AM', '11:30': '11:30 AM',
  '12:30': '12:30 PM', '13:30': '1:30 PM',  '14:30': '2:30 PM',
  '15:30': '3:30 PM',  '16:30': '4:30 PM',  '17:30': '5:30 PM',
  '18:30': '6:30 PM',  '19:30': '7:30 PM',  '20:30': '8:30 PM',
};

async function scrapeStarlineResults() {
  let html;
  try {
    const res = await axios.get('https://www.dpbossonline.com/starline-panel/2/milan-starline', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
      timeout: 30000
    });
    html = res.data;
  } catch (err1) {
    console.log('⚠️ [STARLINE] Scrape Error (Attempt 1):', err1.message, '| Retrying...');
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await axios.get(STARLINE_URL, { timeout: 30000 });
      html = res.data;
    } catch (err2) {
      console.log('❌ [STARLINE] Scrape failed (Attempt 2):', err2.message);
      return {};
    }
  }

  const $ = cheerio.load(html);
  const results = {};
  const colIndexMap = {};

  $('table thead tr th').each((i, el) => {
    const text = $(el).text().trim();
    for (const [dbTime, siteTime] of Object.entries(STARLINE_TIME_MAP)) {
      if (text === siteTime) { colIndexMap[i] = dbTime; break; }
    }
  });

  const rows = $('table tbody tr').toArray();
  if (!rows.length) return {};

  const lastRow = rows[rows.length - 1];
  const cells   = $(lastRow).find('td');

  cells.each((i, cell) => {
    const dbTime = colIndexMap[i];
    if (!dbTime) return;
    const pana  = $(cell).find('div').text().trim();
    const digit = $(cell).find('b').text().trim();
    if (/^\d{3}$/.test(pana)) {
      results[dbTime] = { pana, digit: /^\d$/.test(digit) ? digit : null };
    }
  });

  console.log(`📊 [STARLINE] Scraped ${Object.keys(results).length} results`);
  return results;
}

async function syncStarlineResults() {
  const scraped = await scrapeStarlineResults();
  if (!Object.keys(scraped).length) return { success: false, message: '[STARLINE] Kuch scrape nahi hua' };

  const todayDate  = getISTDate();
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, close_time, open_result, close_result, result_date
     FROM games WHERE game_category = 'starline' AND status != 'deleted'`
  );

  let updated = 0, skipped = 0;
  const log = [];

  for (const dbGame of dbGames) {
    const gameName      = dbGame.name.trim();
    const scraped_result = scraped[gameName];
    if (!scraped_result) { skipped++; continue; }

    const closeMin = timeToMinutes(dbGame.close_time);
    if (closeMin && nowMinutes < closeMin) { skipped++; continue; }
    if (dbGame.open_result === scraped_result.pana) { skipped++; continue; }

    const { pana, digit } = scraped_result;
    try {
      await db.query(
        `UPDATE games SET open_result = ?, result_date = ?,
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') WHERE id = ?`,
        [pana, todayDate, dbGame.id]
      );
      await db.query(
        `INSERT INTO game_results (game_id, result_date, open_result, jodi_result, open_digit, result_source)
         VALUES (?, ?, ?, ?, ?, 'starline_scraper')
         ON DUPLICATE KEY UPDATE
           open_result = VALUES(open_result), jodi_result = VALUES(jodi_result), open_digit = VALUES(open_digit)`,
        [dbGame.id, todayDate, pana, digit, digit]
      );
      await settleGameBids(dbGame.id, pana, null);
      updated++;
      log.push({ game: gameName, pana, digit });
      console.log(`✅ [STARLINE] ${gameName} | Pana: ${pana} | Digit: ${digit}`);
    } catch (err) {
      console.error(`❌ [STARLINE] ${gameName} update failed:`, err.message);
    }
  }

  return { success: true, message: `[STARLINE] ${updated} games updated`, ist_date: todayDate, updated, skipped, log };
}

router.get('/starline-preview', async (req, res) => {
  try {
    const data = await scrapeStarlineResults();
    res.json({ success: true, date: getISTDate(), data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/sync-starline', async (req, res) => {
  try {
    const result = await syncStarlineResults();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SERVER START PE AUTO POLLING SHURU KARO
//  — Ye line server.js ya app.js mein add karo
// ═══════════════════════════════════════════════════════════════════════════════
// require('./routes/scraper').startDisawarPolling();

module.exports = router;
module.exports.scrapeAllGames        = scrapeAllGames;
module.exports.syncResults           = syncResults;
module.exports.syncDisawarResults    = syncDisawarResults;
module.exports.syncStarlineResults   = syncStarlineResults;
module.exports.scrapeStarlineResults = scrapeStarlineResults;
module.exports.startDisawarPolling   = startDisawarPolling;  // ← NEW
module.exports.stopAllPolling        = stopAllPolling;        // ← NEW