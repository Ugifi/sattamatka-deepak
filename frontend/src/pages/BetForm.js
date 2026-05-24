import React, { useState } from 'react';
import { SINGLE_PANAS, DOUBLE_PANAS, TRIPLE_PANAS } from '../data/gameData';

const DIGITS = [0,1,2,3,4,5,6,7,8,9];
const JODIS = Array.from({length:100},(_,i)=>String(i).padStart(2,'0'));

const ODD_NUMBERS  = [1, 3, 5, 7, 9];
const EVEN_NUMBERS = [0, 2, 4, 6, 8];

const PANA_210 = ['128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '579', '678', '100', '119', '155', '227', '335', '344', '399', '588', '669', '129', '138', '147', '156', '237', '246', '345', '390', '480', '570', '589', '679', '110', '200', '228', '255', '336', '499', '660', '688', '778', '120', '139', '148', '157', '238', '247', '256', '346', '490', '580', '670', '689', '166', '229', '300', '337', '355', '445', '599', '779', '887', '130', '149', '158', '167', '239', '248', '257', '347', '356', '590', '680', '789', '112', '220', '266', '338', '400', '446', '455', '699', '770', '140', '159', '168', '230', '249', '258', '267', '348', '357', '456', '690', '780', '113', '122', '177', '339', '366', '447', '500', '799', '889', '123', '150', '169', '178', '240', '259', '268', '349', '358', '367', '457', '790', '114', '277', '330', '448', '466', '556', '600', '880', '899', '124', '160', '179', '250', '269', '278', '340', '359', '368', '458', '467', '890', '115', '133', '188', '223', '377', '449', '557', '566', '700', '125', '134', '170', '189', '260', '279', '350', '369', '378', '459', '468', '567', '116', '224', '233', '288', '440', '477', '558', '800', '990', '126', '135', '180', '234', '270', '289', '360', '379', '450', '469', '478', '568', '117', '144', '199', '225', '388', '559', '577', '667', '900', '127', '136', '145', '190', '235', '280', '370', '389', '460', '479', '569', '578', '118', '226', '244', '299', '334', '488', '550', '668', '776'];

const HALF_RED_JODIS = ['05','16','27','38','49','50','61','72','83','94'];
const FULL_RED_JODIS = ['00','11','22','33','44','55','66','77','88','99'];

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

const JODI_FAMILY_LABELS = {
  "12": "12 Family", "13": "13 Family", "14": "14 Family",
  "15": "15 Family", "23": "23 Family", "24": "24 Family",
  "25": "25 Family", "34": "34 Family", "35": "35 Family",
  "45": "45 Family", "half_red": "Half Red", "full_red": "Full Red"
};

function getFamilyFromJodi(jodi) {
  for (let family in JODI_FAMILIES) {
    if (JODI_FAMILIES[family].includes(jodi)) return family;
  }
  return null;
}

// ─── PANA FAMILIES DATA ───────────────────────────────────────────────────────
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

function getFamilyFromPana(pana) {
  for (let family in PANA_FAMILIES) {
    if (PANA_FAMILIES[family].includes(pana)) return family;
  }
  return null;
}

// ─── SP MOTOR PREVIEW GENERATOR ──────────────────────────────────────────────
function generateSPMotorCombinations(digits) {
  const result = [];
  const sorted = [...digits].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        result.push([sorted[i], sorted[j], sorted[k]].join(''));
      }
    }
  }
  return result.sort();
}

// ─── SP MOTOR COMPONENT ──────────────────────────────────────────────────────
function SPMotorSection({ num, setNum, amt, AmtInput, PlaceBtn }) {
  const parsedDigits = num ? [...new Set(num.replace(/\D/g, '').split('').map(Number))].filter(n => n >= 0 && n <= 9) : [];
  const allCombinations = parsedDigits.length >= 3 ? generateSPMotorCombinations(parsedDigits) : [];

  const handleDigitChange = (e) => {
    setNum(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  return <>
    <div className="fg">
      <label className="fl">🔢 Enter Digits (3 to 10 unique digits)</label>
      <input
        className="fi"
        type="text"
        inputMode="numeric"
        maxLength={10}
        placeholder="e.g. 12345"
        value={num}
        onChange={handleDigitChange}
        style={{ letterSpacing: 4, fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}
      />
      {parsedDigits.length > 0 && (
        <div className="num-grid">
          {parsedDigits.map(d => (
            <div key={`entered-${d}`} className="nchip active" style={{ cursor: 'default' }}>{d}</div>
          ))}
        </div>
      )}
      {parsedDigits.length > 0 && parsedDigits.length < 3 && (
        <div className="infobox" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', marginTop: 10 }}>
          ⚠️ Kam se kam <strong>3 unique digits</strong> chahiye
        </div>
      )}
    </div>

    <AmtInput label="💰 Amount per Pana (Min ₹10)" />

    {allCombinations.length > 0 && (
      <div className="fg">
        <label className="fl">🎯 Generated Single Panas ({allCombinations.length})</label>
        <div className="pana-grid" style={{ maxHeight: '250px', overflowY: 'auto', padding: '5px 0' }}>
          {allCombinations.map(p => (
            <div key={`generated-${p}`} className="pchip active" style={{ cursor: 'default' }}>{p}</div>
          ))}
        </div>
      </div>
    )}

    {allCombinations.length > 0 && Number(amt) >= 10 && <PlaceBtn />}
  </>;
}

// ─── RED JODI COMPONENT ──────────────────────────────────────────────────────
function RedJodiSection({ num, setNum, AmtInput, WinInfo, PlaceBtn }) {
  const [redType, setRedType] = useState('');
  const activeJodis = redType === 'half' ? HALF_RED_JODIS : redType === 'full' ? FULL_RED_JODIS : [];

  return <>
    <div className="fg">
      <label className="fl">Red Jodi Type Select Karo</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        {[
          { key: 'half', label: '🔴 Half Red Jodi' },
          { key: 'full', label: '🔴 Full Red Jodi' }
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`chip${redType === key ? ' active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            onClick={() => { setRedType(key); setNum(''); }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>

    {redType === '' && (
      <div className="infobox" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
        ⬆️ Pehle <strong>Half Red Jodi</strong> ya <strong>Full Red Jodi</strong> select karo
      </div>
    )}

    {redType !== '' && (
      <div className="fg">
        <div className="jodi-scroll">
          <div className="jodi-grid">
            {activeJodis.map(j => (
              <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>
                {j}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    <AmtInput/>
    <WinInfo/>
    <PlaceBtn/>
  </>;
}

// ─── FAMILY JODI COMPONENT ───────────────────────────────────────────────────
function FamilyJodiSection({ amt, setAmt, chips, onSubmit, submitting }) {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedJodis, setSelectedJodis] = useState([]);

  const familyKeys  = ["12","13","14","15","23","24","25","34","35","45","half_red","full_red"];
  const familyJodis = selectedFamily ? JODI_FAMILIES[selectedFamily] : [];

  const totalLines = selectedJodis.length;
  const totalAmt   = totalLines * Number(amt || 0);

  // Family select hone par saari jodis auto-select
  const handleFamilySelect = (fk) => {
    setSelectedFamily(fk);
    setSelectedJodis([...JODI_FAMILIES[fk]]);
    setAmt('');
  };

  // Individual jodi toggle
  const toggleJodi = (j) => {
    setSelectedJodis(prev =>
      prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]
    );
  };

  // Select All / Deselect All
  const toggleAll = () => {
    if (selectedJodis.length === familyJodis.length) {
      setSelectedJodis([]);
    } else {
      setSelectedJodis([...familyJodis]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFamily || selectedJodis.length === 0 || !amt || Number(amt) < 10) return;
    const betsToSubmit = selectedJodis.map(j => ({ num: j, amt: Number(amt) }));
    await onSubmit({ numbers: betsToSubmit, totalAmt, session: 'open' });
  };

  return <>
    {/* Step 1 — Family Select karo */}
    <div className="fg">
      <label className="fl">🎴 Family Select Karo</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {familyKeys.map(fk => (
          <div
            key={fk}
            onClick={() => handleFamilySelect(fk)}
            className={`chip${selectedFamily === fk ? ' active' : ''}`}
            style={{
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              minWidth: 70,
              textAlign: 'center',
              background: fk === 'half_red'
                ? (selectedFamily === fk ? '#e53935' : 'rgba(229,57,53,0.15)')
                : fk === 'full_red'
                ? (selectedFamily === fk ? '#b71c1c' : 'rgba(183,28,28,0.15)')
                : undefined,
              color: (fk === 'half_red' || fk === 'full_red') ? (selectedFamily === fk ? '#fff' : '#e53935') : undefined,
              borderColor: (fk === 'half_red' || fk === 'full_red') ? '#e53935' : undefined,
            }}
          >
            {JODI_FAMILY_LABELS[fk]}
          </div>
        ))}
      </div>
    </div>

    {/* Koi family select nahi ki */}
    {!selectedFamily && (
      <div className="infobox" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
        ⬆️ Upar se koi ek <strong>Family</strong> select karo
      </div>
    )}

    {/* Step 2 — Jodis select/deselect */}
    {selectedFamily && <>
      {/* Info + Select All/Deselect All button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <div className="infobox" style={{ background: '#e8f5ee', color: '#0d3526', border: '1px solid #4caf50', margin: 0, flex: 1 }}>
          ✅ <strong>{JODI_FAMILY_LABELS[selectedFamily]}</strong> — <strong>{selectedJodis.length}/{familyJodis.length}</strong> Jodis selected
        </div>
        <div
          onClick={toggleAll}
          style={{
            padding: '8px 12px',
            background: selectedJodis.length === familyJodis.length ? '#e53935' : '#4caf50',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {selectedJodis.length === familyJodis.length ? '✕ Deselect All' : '✓ Select All'}
        </div>
      </div>

      {/* Jodi Grid — click se select/deselect */}
      <div className="fg">
        <label className="fl">🎯 Jodis click karke select/deselect karo</label>
        <div className="jodi-scroll">
          <div className="jodi-grid">
           {familyJodis.map(j => (
  <div
    key={j}
   className={`jchip${selectedJodis.includes(j) ? '' : ' active'}`}
style={{ cursor: 'pointer' }}
    onClick={() => toggleJodi(j)}
  >
    {j}
  </div>
))}
          </div>
        </div>
      </div>

      {/* Koi jodi select nahi */}
      {selectedJodis.length === 0 && (
        <div className="infobox" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
          ⚠️ Kam se kam <strong>1 jodi</strong> select karo
        </div>
      )}

      {/* Step 3 — Amount */}
      {selectedJodis.length > 0 && (
        <div className="fg">
          <label className="fl">💰 Amount per Jodi (Min ₹10)</label>
          <input
            className="fi"
            type="number"
            placeholder="₹0"
            value={amt}
            onChange={e => setAmt(e.target.value)}
          />
          <div className="chips-row">
            {chips.map(c => (
              <div
                key={c}
                className={`chip${amt === String(c) ? ' active' : ''}`}
                onClick={() => setAmt(String(c))}
              >
                ₹{c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total info */}
      {selectedJodis.length > 0 && Number(amt) >= 10 && (
        <div className="infobox">
          📊 <strong>{totalLines} jodis</strong> × ₹<strong>{amt}</strong> = Total: <strong>₹{totalAmt.toLocaleString()}</strong>
        </div>
      )}

      {/* Place Bid Button */}
      {selectedJodis.length > 0 && Number(amt) >= 10 && (
        <button
          className="btn-place"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? '⏳ Placing...' : `🎯 Place Family Jodi — ₹${totalAmt.toLocaleString()}`}
        </button>
      )}
    </>}
  </>;
}

// ─── FAMILY PANA COMPONENT ───────────────────────────────────────────────────
function FamilyPanaSection({ num, setNum, amt, setAmt, chips, openClose, gameType, onSubmit, submitting }) {
  const foundFamily = num.length === 3 ? getFamilyFromPana(num) : null;
  const familyPanas = foundFamily ? PANA_FAMILIES[foundFamily] : [];
  const totalLines  = familyPanas.length;
  const totalAmt    = totalLines * Number(amt || 0);

  const handleSubmit = async () => {
    if (!foundFamily || !amt || Number(amt) < 10) return;
    const betsToSubmit = familyPanas.map(p => ({ num: p, amt: Number(amt) }));
    await onSubmit({ numbers: betsToSubmit, totalAmt, session: openClose });
  };

  return <>
    <div className="fg">
      <label className="fl">🎴 Koi bhi Pana enter karo (3 digits)</label>
      <input
        className="fi"
        type="text"
        inputMode="numeric"
        maxLength={3}
        placeholder="e.g. 134"
        value={num}
        onChange={e => setNum(e.target.value.replace(/\D/g, '').slice(0, 3))}
        style={{ letterSpacing: 8, fontSize: 24, fontWeight: 800, textAlign: 'center' }}
      />
    </div>

    {num.length === 3 && !foundFamily && (
      <div className="infobox" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
        ⚠️ Yeh pana kisi family mein nahi mila. Sahi pana enter karo.
      </div>
    )}

    {foundFamily && <>
      <div className="infobox" style={{ background: '#e8f5ee', color: '#0d3526', border: '1px solid #4caf50' }}>
        ✅ <strong>{foundFamily} Family</strong> — Total <strong>{totalLines} Panas</strong> cover hongi
      </div>

      <div className="fg">
        <label className="fl">🎯 Family ke Saare Panas ({totalLines})</label>
        <div className="pana-grid">
          {familyPanas.map(p => (
            <div
              key={p}
              className={`pchip${p === num ? ' active' : ''}`}
              style={{ cursor: 'default' }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>

      <div className="fg">
        <label className="fl">💰 Amount per Pana (Min ₹10)</label>
        <input
          className="fi"
          type="number"
          placeholder="₹0"
          value={amt}
          onChange={e => setAmt(e.target.value)}
        />
        <div className="chips-row">
          {chips.map(c => (
            <div
              key={c}
              className={`chip${amt === String(c) ? ' active' : ''}`}
              onClick={() => setAmt(String(c))}
            >
              ₹{c}
            </div>
          ))}
        </div>
      </div>

      {Number(amt) >= 10 && (
        <div className="infobox">
          📊 <strong>{totalLines} panas</strong> × ₹<strong>{amt}</strong> = Total Bid: <strong>₹{totalAmt.toLocaleString()}</strong>
        </div>
      )}

      {Number(amt) >= 10 && (
        <button
          className="btn-place"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? '⏳ Placing...' : `🎯 Place Family Bid — ₹${totalAmt.toLocaleString()}`}
        </button>
      )}
    </>}
  </>;
}

// ─── MAIN BETFORM COMPONENT ──────────────────────────────────────────────────
export default function BetForm({ game, gameType, wallet, onSubmit }) {
  const [num, setNum] = useState('');
  const [num2, setNum2] = useState('');
  const [activeN, setActiveN] = useState(null);
  const [amt, setAmt] = useState('');
  const [bets, setBets] = useState([]);
  const [oddEven, setOddEven] = useState('');
  const [oddEvenNum, setOddEvenNum] = useState(null);
  const [openClose, setOpenClose] = useState('open');
  const [cycleDigit, setCycleDigit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const chips = [10, 50, 100, 200, 500];
  const id = gameType.id;
  const nt = gameType.numType;

  const getCycleJodis = (d) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) { res.push(String(d)+String(i)); res.push(String(i)+String(d)); }
    return [...new Set(res)].sort();
  };
  const cycleJodis = getCycleJodis(cycleDigit);

  const getDigitJodis = (d, side) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) {
      if (side === 'open') res.push(String(d)+String(i));
      else res.push(String(i)+String(d));
    }
    return res;
  };
  const digitJodis = getDigitJodis(activeN, openClose);

  const isBulkType = nt==='ank_bulk'||nt==='jodi_bulk'||nt==='pana_bulk'||id==='sp_common'||id==='dp_common'||id==='cycle_jodi'||id==='digit_jodi'||id.includes('half_sangam')||id.includes('full_sangam')||id==='family_jodi'||id==='family_pana';

  const addToBulk = () => {
    if (id === 'cycle_jodi') {
      if (!amt || Number(amt) < 10) return;
      setBets(b => [...b, ...cycleJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setCycleDigit(null); setAmt('');
    } else if (id === 'digit_jodi') {
      if (!amt || Number(amt) < 10 || activeN === null) return;
      setBets(b => [...b, ...digitJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setActiveN(null); setAmt('');
    } else if (id.includes('half_sangam') || id.includes('full_sangam')) {
      if (!num || !num2 || !amt || Number(amt) < 10) return;
      setBets(b => [...b, { num: `${num}-${num2}`, amt: Number(amt) }]);
      setNum(''); setNum2(''); setAmt('');
    } else {
      if (!num || !amt || Number(amt) < 10) return;
      setBets(b => [...b, { num, amt: Number(amt) }]);
      setNum(''); setActiveN(null); setAmt('');
    }
  };

  const removeBet = i => setBets(b => b.filter((_, idx) => idx !== i));
  const totalAmt = bets.reduce((a, b) => a + b.amt, 0);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const commonData = { session: openClose };

      if (isBulkType || id === 'dp_motor') {
        if (!bets.length) { setSubmitting(false); return; }
        await onSubmit({ numbers: bets, totalAmt, ...commonData });
      } else if (id === 'sp_motor') {
        const parsed = num ? [...new Set(num.replace(/\D/g, '').split('').map(Number))].filter(n => n >= 0 && n <= 9) : [];
        if (parsed.length < 3 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: parsed.join(''), amount: Number(amt), ...commonData });
      } else if (id === 'odd_even') {
        if (!oddEven || oddEvenNum === null || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: String(oddEvenNum), amount: Number(amt), ...commonData });
      } else if (id === 'two_digit_pana') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}|${num2}`, amount: Number(amt), ...commonData });
      } else {
        if (!num || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: num, amount: Number(amt), ...commonData });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const AmtInput = ({ label = 'Bid Amount (Min ₹10)' }) => (
    <div className="fg">
      <label className="fl">{label}</label>
      <input className="fi" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)}/>
      <div className="chips-row">
        {chips.map(c => (
          <div key={c} className={`chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>
        ))}
      </div>
    </div>
  );

  const WinInfo = () => (
    <div className="infobox">
      You bet: <strong>₹{Number(amt||0).toLocaleString()}</strong> &nbsp;|&nbsp;
      Potential win: <strong>₹{(Number(amt||0)*parseInt(gameType.win)).toLocaleString()}</strong>
    </div>
  );

  const getSPMotorTotalAmount = () => {
    if (id !== 'sp_motor' || !num) return 0;
    const parsed = [...new Set(num.replace(/\D/g, '').split('').map(Number))].filter(n => n >= 0 && n <= 9);
    if (parsed.length < 3) return 0;
    const combCount = generateSPMotorCombinations(parsed).length;
    return combCount * Number(amt || 0);
  };

  const PlaceBtn = () => {
    const displayAmt = id === 'sp_motor' ? getSPMotorTotalAmount() : Number(amt || 0);
    return (
      <button
        className="btn-place"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${displayAmt.toLocaleString()}`}
      </button>
    );
  };

  const BulkTable = () => (bets.length > 0 ? <>
    <table className="bet-table">
      <thead><tr><th>#</th><th>Number</th><th>Amount</th><th></th></tr></thead>
      <tbody>{bets.map((b, i) => (
        <tr key={i}>
          <td>{i+1}</td>
          <td style={{fontWeight:700}}>{b.num}</td>
          <td>₹{b.amt.toLocaleString()}</td>
          <td><button className="del-btn" onClick={() => removeBet(i)}>✕</button></td>
        </tr>
      ))}</tbody>
    </table>
    <div className="total-row">
      <span>Total Bets: {bets.length}</span>
      <strong>₹{totalAmt.toLocaleString()}</strong>
    </div>
  </> : null);

  const AddBtn = ({ label = '+ Add to List' }) => (
    <button onClick={addToBulk} style={{width:'100%',background:'#e8f5ee',color:'#0d3526',border:'2px dashed #0d3526',borderRadius:8,padding:10,fontWeight:700,fontFamily:'Rajdhani,sans-serif',fontSize:14,cursor:'pointer',marginBottom:14}}>
      {label}
    </button>
  );

  const PlaceAllBtn = () => (
    <button
      className="btn-place"
      onClick={handleSubmit}
      disabled={submitting}
      style={{ marginTop:12, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
    >
      {submitting ? '⏳ Placing...' : `🎯 Place All Bids — ₹${totalAmt.toLocaleString()}`}
    </button>
  );

  return (
    <div className="bet-page">
      <div className="bet-game-banner">
        <div className="bgb-icon">{game.icon}</div>
        <div>
          <div className="bgb-name">{game.name}</div>
          <div className="bgb-type">{gameType.label} &nbsp;|&nbsp; Win: {gameType.win} &nbsp;|&nbsp; Wallet: ₹{wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="bet-form-card">
        {/* Session Selector */}
        {id !== 'jodi' && id !== 'jodi_bulk' && id !== 'jodi_digit' && id !== 'red_jodi' && id !== 'family_pana' && id !== 'family_jodi' && (
          <div className="fg">
            <label className="fl">Select Session</label>
            <div style={{display:'flex', gap:10, marginBottom:15}}>
              {['open', 'close'].map(s => (
                <div
                  key={s}
                  className={`chip${openClose === s ? ' active' : ''}`}
                  style={{flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer'}}
                  onClick={() => {
                    setOpenClose(s);
                    if (!id.includes('sangam')) { setNum(''); setNum2(''); }
                  }}
                >
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bf-title">🎯 {gameType.label}</div>
        <div className="infobox">{gameType.desc} — Win multiplier: <strong>{gameType.win}</strong></div>

        {/* ── SINGLE DIGIT ── */}
        {id === 'single_digit' && <>
          <div className="fg"><label className="fl">Pick a Digit (0–9)</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${activeN === d ? ' active' : ''}`}
                  onClick={() => { setActiveN(d); setNum(String(d)); }}>{d}
                </div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── SINGLE DIGIT BULK ── */}
        {id === 'single_digit_bulk' && <>
          <div className="fg"><label className="fl">Pick Digits</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${num === String(d) ? ' active' : ''}`}
                  onClick={() => setNum(String(d))}>{d}
                </div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn label="+ Add Digit"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── JODI DIGIT ── */}
        {id === 'jodi_digit' && <>
          <div className="fg"><label className="fl">Pick Jodi (00–99)</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── JODI BULK ── */}
        {id === 'jodi_bulk' && <>
          <div className="fg"><label className="fl">Pick Jodi</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <AmtInput/>
          <AddBtn label="+ Add Jodi"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── SINGLE PANA ── */}
        {id === 'single_pana' && <>
          <div className="fg"><label className="fl">Pick Single Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── SINGLE PANA BULK ── */}
        {id === 'single_pana_bulk' && <>
          <div className="fg"><label className="fl">Pick Single Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── DOUBLE PANA ── */}
        {id === 'double_pana' && <>
          <div className="fg"><label className="fl">Pick Double Pana</label>
            <div className="pana-grid">
              {DOUBLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── DOUBLE PANA BULK ── */}
        {id === 'double_pana_bulk' && <>
          <div className="fg"><label className="fl">Pick Double Pana</label>
            <div className="pana-grid">
              {DOUBLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── TRIPLE PANA ── */}
        {id === 'triple_pana' && <>
          <div className="fg"><label className="fl">Pick Triple Pana</label>
            <div className="pana-grid">
              {TRIPLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── FAMILY PANA ── */}
        {id === 'family_pana' && (
          <FamilyPanaSection
            num={num}
            setNum={setNum}
            amt={amt}
            setAmt={setAmt}
            chips={chips}
            openClose={openClose}
            gameType={gameType}
            onSubmit={onSubmit}
            submitting={submitting}
          />
        )}

        {/* ── FAMILY JODI ── */}
        {id === 'family_jodi' && (
          <FamilyJodiSection
            amt={amt}
            setAmt={setAmt}
            chips={chips}
            onSubmit={onSubmit}
            submitting={submitting}
          />
        )}

        {/* ── HALF SANGAM ── */}
        {(id === 'half_sangam_a' || id === 'half_sangam_b' || id === 'half_sangam_bulk') && <>
          {openClose === 'open' ? (
            <>
              <div className="fg"><label className="fl">Open Digit (0–9)</label>
                <div className="num-grid">
                  {DIGITS.map(d => (
                    <div key={d} className={`nchip${num === String(d) ? ' active' : ''}`} onClick={() => setNum(String(d))}>{d}</div>
                  ))}
                </div>
              </div>
              <div className="fg"><label className="fl">Close Pana</label>
                <div className="pana-grid">
                  {PANA_210.map(p => (
                    <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="fg"><label className="fl">Open Pana</label>
                <div className="pana-grid">
                  {PANA_210.map(p => (
                    <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
                  ))}
                </div>
              </div>
              <div className="fg"><label className="fl">Close Digit (0–9)</label>
                <div className="num-grid">
                  {DIGITS.map(d => (
                    <div key={d} className={`nchip${num2 === String(d) ? ' active' : ''}`} onClick={() => setNum2(String(d))}>{d}</div>
                  ))}
                </div>
              </div>
            </>
          )}
          <AmtInput/>
          <AddBtn label="+ Add Half Sangam"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── FULL SANGAM ── */}
        {(id === 'full_sangam' || id === 'full_sangam_bulk') && <>
          {openClose === 'open' ? (
            <div className="fg">
              <label className="fl" style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                <span>Open Pana</span>
                {num2 && <span style={{fontSize:12, color:'#4caf50', fontWeight:'bold'}}>Close Selected: {num2} ✓</span>}
              </label>
              <div className="pana-grid">
                {PANA_210.map(p => (
                  <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="fg">
              <label className="fl" style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                <span>Close Pana</span>
                {num && <span style={{fontSize:12, color:'#4caf50', fontWeight:'bold'}}>Open Selected: {num} ✓</span>}
              </label>
              <div className="pana-grid">
                {PANA_210.map(p => (
                  <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
                ))}
              </div>
            </div>
          )}
          {(!num || !num2) && (
            <div className="infobox" style={{background:'#fff3cd', color:'#856404', border:'1px solid #ffeeba'}}>
               Please select both <strong>Open Pana</strong> and <strong>Close Pana</strong>.
            </div>
          )}
          <AmtInput/>
          <AddBtn label="+ Add Full Sangam"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── ODD / EVEN ── */}
        {id === 'odd_even' && <>
          <div className="fg"><label className="fl">Bet On</label>
            <div style={{display:'flex', gap:10}}>
              {['ODD','EVEN'].map(oe => (
                <div key={oe} className={`chip${oddEven === oe ? ' active' : ''}`}
                  style={{flex:1, textAlign:'center', padding:'12px 0', fontSize:14}}
                  onClick={() => { setOddEven(oe); setOddEvenNum(null); }}
                >
                  {oe}
                </div>
              ))}
            </div>
          </div>
          {oddEven !== '' && (
            <div className="fg">
              <label className="fl">
                {oddEven === 'ODD' ? 'ODD Numbers (1,3,5,7,9)' : 'EVEN Numbers (0,2,4,6,8)'}
              </label>
              <div className="num-grid">
                {(oddEven === 'ODD' ? ODD_NUMBERS : EVEN_NUMBERS).map(n => (
                  <div key={n} className={`nchip${oddEvenNum === n ? ' active' : ''}`} onClick={() => setOddEvenNum(n)}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── DP MOTOR ── */}
        {id === 'dp_motor' && <>
          <div className="fg"><label className="fl">Pick Pana</label>
            <div className="pana-grid">
              {DOUBLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── SP MOTOR ── */}
        {id === 'sp_motor' && (
          <SPMotorSection
            num={num}
            setNum={setNum}
            amt={amt}
            AmtInput={AmtInput}
            PlaceBtn={PlaceBtn}
          />
        )}

        {/* ── RED JODI ── */}
        {id === 'red_jodi' && (
          <RedJodiSection
            num={num}
            setNum={setNum}
            AmtInput={AmtInput}
            WinInfo={WinInfo}
            PlaceBtn={PlaceBtn}
          />
        )}

        {/* ── CYCLE JODI ── */}
        {id === 'cycle_jodi' && <>
          <div className="fg"><label className="fl">Pick a Digit to Cycle</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${cycleDigit === d ? ' active' : ''}`} onClick={() => setCycleDigit(d)}>{d}</div>
              ))}
            </div>
          </div>
          {cycleDigit !== null && (
            <div className="infobox">Will add <strong>{cycleJodis.length} jodis</strong>: {cycleJodis.slice(0,6).join(', ')}...</div>
          )}
          <AmtInput label="Amount per jodi"/>
          <AddBtn label="+ Add All Cycle Jodis"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── SP DP TP ── */}
        {id === 'sp_dp_tp' && <>
          <div className="fg"><label className="fl">Select Type</label>
            <div style={{display:'flex', gap:8, marginBottom:10}}>
              {['SP','DP','TP'].map(t => (
                <div key={t} className={`chip${num2 === t ? ' active' : ''}`}
                  style={{flex:1, textAlign:'center', padding:'10px 0', fontSize:14, cursor:'pointer'}}
                  onClick={() => { setNum2(t); setNum(''); }}
                >{t}</div>
              ))}
            </div>
          </div>
          {num2 === 'SP' && (
            <div className="fg"><label className="fl">Pick Single Pana</label>
              <div className="pana-grid">
                {SINGLE_PANAS.map(p => (
                  <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
                ))}
              </div>
            </div>
          )}
          {num2 === 'DP' && (
            <div className="fg"><label className="fl">Pick Double Pana</label>
              <div className="pana-grid">
                {DOUBLE_PANAS.map(p => (
                  <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
                ))}
              </div>
            </div>
          )}
          {num2 === 'TP' && (
            <div className="fg"><label className="fl">Pick Triple Pana</label>
              <div className="pana-grid">
                {TRIPLE_PANAS.map(p => (
                  <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
                ))}
              </div>
            </div>
          )}
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── TWO DIGIT PANA ── */}
        {id === 'two_digit_pana' && <>
          <div className="fg"><label className="fl">Pick Jodi (2-digit)</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="fg"><label className="fl">Pick Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── DIGIT JODI ── */}
        {id === 'digit_jodi' && <>
          <div className="fg"><label className="fl">Open or Close?</label>
            <div style={{display:'flex',gap:10,marginBottom:10}}>
              {['open','close'].map(s => (
                <div key={s} className={`chip${openClose === s ? ' active' : ''}`}
                  style={{flex:1,textAlign:'center',padding:'10px 0',fontSize:13}}
                  onClick={() => setOpenClose(s)}>{s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="fg"><label className="fl">Pick a Digit</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${activeN === d ? ' active' : ''}`} onClick={() => setActiveN(d)}>{d}</div>
              ))}
            </div>
          </div>
          {activeN !== null && (
            <div className="infobox">Will add <strong>{digitJodis.length} jodis</strong>: {digitJodis.join(', ')}</div>
          )}
          <AmtInput label="Amount per jodi"/>
          <AddBtn label="+ Add Digit Jodis"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── SP/DP COMMON ── */}
        {(id === 'sp_common' || id === 'dp_common') && <>
          <div className="fg"><label className="fl">Pick {id === 'sp_common' ? 'Single' : 'Double'} Pana</label>
            <div className="pana-grid">
              {(id === 'sp_common' ? SINGLE_PANAS : DOUBLE_PANAS).map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

      </div>
    </div>
  );
}
