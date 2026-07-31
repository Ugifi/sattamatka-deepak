import React, { useState, useRef, useEffect } from 'react';
import { SINGLE_PANAS, DOUBLE_PANAS, TRIPLE_PANAS } from '../data/gameData';

const DIGITS = [0,1,2,3,4,5,6,7,8,9];
const JODIS = Array.from({length:100},(_,i)=>String(i).padStart(2,'0'));
const ODD_NUMBERS  = [1, 3, 5, 7, 9];
const EVEN_NUMBERS = [0, 2, 4, 6, 8];

const PANA_210 = ['128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '579', '678', '100', '119', '155', '227', '335', '344', '399', '588', '669', '129', '138', '147', '156', '237', '246', '345', '390', '480', '570', '589', '679', '110', '200', '228', '255', '336', '499', '660', '688', '778', '120', '139', '148', '157', '238', '247', '256', '346', '490', '580', '670', '689', '166', '229', '300', '337', '355', '445', '599', '779', '887', '130', '149', '158', '167', '239', '248', '257', '347', '356', '590', '680', '789', '112', '220', '266', '338', '400', '446', '455', '699', '770', '140', '159', '168', '230', '249', '258', '267', '348', '357', '456', '690', '780', '113', '122', '177', '339', '366', '447', '500', '799', '889', '123', '150', '169', '178', '240', '259', '268', '349', '358', '367', '457', '790', '114', '277', '330', '448', '466', '556', '600', '880', '899', '124', '160', '179', '250', '269', '278', '340', '359', '368', '458', '467', '890', '115', '133', '188', '223', '377', '449', '557', '566', '700', '125', '134', '170', '189', '260', '279', '350', '369', '378', '459', '468', '567', '116', '224', '233', '288', '440', '477', '558', '800', '990', '126', '135', '180', '234', '270', '289', '360', '379', '450', '469', '478', '568', '117', '144', '199', '225', '388', '559', '577', '667', '900', '127', '136', '145', '190', '235', '280', '370', '389', '460', '479', '569', '578', '118', '226', '244', '299', '334', '488', '550', '668', '776'];

const HALF_RED_JODIS = ['05','16','27','38','49','50','61','72','83','94'];
const FULL_RED_JODIS = ['00','11','22','33','44','55','66','77','88','99'];

const CYCLE_PANNA_DATA = {
  10: [100,110,120,130,140,150,160,170,180,190], 11: [110,111,112,113,114,115,116,117,118,119],
  12: [112,120,122,123,124,125,126,127,128,129], 13: [113,123,130,133,134,135,136,137,138,139],
  14: [114,124,134,140,144,145,146,147,148,149], 15: [115,125,135,145,150,155,156,157,158,159],
  16: [116,126,136,146,156,160,166,167,168,169], 17: [117,127,137,147,157,167,170,177,178,179],
  18: [118,128,138,148,158,168,178,180,188,189], 19: [119,129,139,149,159,169,179,189,190,199],
  20: [120,200,220,230,240,250,260,270,280,290], 22: [122,220,222,223,224,225,226,227,228,229],
  23: [123,223,230,233,234,235,236,237,238,239], 24: [124,224,234,240,244,245,246,247,248,249],
  25: [125,225,235,245,250,255,256,257,258,259], 26: [126,226,236,246,256,260,266,267,268,269],
  27: [127,227,237,247,257,267,270,277,278,279], 28: [128,228,238,248,258,268,278,280,288,289],
  29: [129,229,239,249,259,269,279,289,290,299], 30: [130,230,300,330,340,350,360,370,380,390],
  33: [133,233,333,334,335,336,337,338,339,330], 34: [134,234,334,340,344,345,346,347,348,349],
  35: [135,235,335,345,350,355,356,357,358,359], 36: [136,236,336,346,356,360,366,367,368,369],
  37: [137,237,337,347,357,367,370,377,378,379], 38: [138,238,338,348,358,368,378,380,388,389],
  39: [139,239,339,349,359,369,379,389,390,399], 40: [140,240,340,400,440,450,460,470,480,490],
  44: [144,244,344,440,444,445,446,447,448,449], 45: [145,245,345,445,450,455,456,457,458,459],
  46: [146,246,346,446,456,460,466,467,468,469], 47: [147,247,347,447,457,467,470,477,478,479],
  48: [148,248,348,448,458,468,478,480,488,489], 49: [149,249,349,449,459,469,479,489,490,499],
  50: [150,250,350,450,500,550,560,570,580,590], 55: [155,255,355,455,550,555,556,557,558,559],
  56: [156,256,356,456,556,560,566,567,568,569], 57: [157,257,357,457,557,567,570,577,578,579],
  58: [158,258,358,458,558,568,578,580,588,589], 59: [159,259,359,459,559,569,579,589,590,599],
  60: [160,260,360,460,560,600,660,670,680,690], 66: [166,266,366,466,566,660,666,667,668,669],
  67: [167,267,367,467,567,667,670,677,678,679], 68: [168,268,368,468,568,668,678,680,688,689],
  69: [169,269,369,469,569,669,679,689,690,699], 70: [170,270,370,470,570,670,700,770,780,790],
  77: [177,277,377,477,577,677,770,777,778,779], 78: [178,278,378,478,578,678,778,780,788,789],
  79: [179,279,379,479,579,679,779,789,790,799], 80: [180,280,380,480,580,680,780,800,880,890],
  88: [188,288,388,488,588,688,788,880,888,889], 89: [189,289,389,489,589,689,789,889,890,899],
  90: [190,290,390,490,590,690,790,890,900,990], 99: [199,299,399,499,599,699,799,899,990,999],
};
const CYCLE_PANNA_JODIS = Object.keys(CYCLE_PANNA_DATA).map(Number).sort((a,b)=>a-b);

const SP_PANAS_FINAL = {
  0: ['128','137','146','236','245','290','380','470','489','560','579','678'],
  1: ['129','138','147','156','237','246','345','390','480','570','589','679'],
  2: ['120','139','148','157','238','247','256','346','490','580','670','689'],
  3: ['130','149','158','167','239','248','257','347','356','590','680','789'],
  4: ['140','159','168','230','249','258','267','348','357','456','690','780'],
  5: ['150','169','178','240','259','268','349','358','367','457','560','790'],
  6: ['160','179','250','269','278','340','359','368','458','467','006','890'],
  7: ['170','189','260','279','350','369','378','459','468','567','007','980'],
  8: ['180','234','270','289','360','379','450','469','478','568','008','890'],
  9: ['190','235','280','370','389','460','479','569','578','009','900','990'],
};
const DP_PANAS = {
  0: ['118','226','334','442','550','668','776','884','992','000'],
  1: ['119','227','335','443','551','669','777','885','993','100'],
  2: ['110','228','336','444','552','660','778','886','994','200'],
  3: ['111','229','337','445','553','661','779','887','995','300'],
  4: ['112','220','338','446','554','662','770','888','996','400'],
  5: ['113','221','339','447','555','663','771','889','997','500'],
  6: ['114','222','330','448','556','664','772','880','998','600'],
  7: ['115','223','331','449','557','665','773','881','999','700'],
  8: ['116','224','332','440','558','666','774','882','990','800'],
  9: ['117','225','333','441','559','667','775','883','991','900'],
};

const JODI_FAMILIES = {
  "12": ["12","17","21","26","62","67","71","76"], "13": ["13","18","31","36","63","68","81","86"],
  "14": ["14","19","41","46","64","69","91","96"], "15": ["01","06","10","15","51","56","60","65"],
  "23": ["23","28","32","37","73","78","82","87"], "24": ["24","29","42","47","74","79","92","97"],
  "25": ["02","07","20","25","52","57","70","75"], "34": ["34","39","43","48","84","89","93","98"],
  "35": ["03","08","30","35","53","58","80","85"], "45": ["04","09","40","45","54","59","90","95"],
  "half_red": ["05","16","27","38","49","50","61","72","83","94"], "full_red": ["00","11","22","33","44","55","66","77","88","99"]
};
const JODI_FAMILY_LABELS = { "12": "12 Family", "13": "13 Family", "14": "14 Family", "15": "15 Family", "23": "23 Family", "24": "24 Family", "25": "25 Family", "34": "34 Family", "35": "35 Family", "45": "45 Family", "half_red": "Half Red", "full_red": "Full Red" };

const PANA_FAMILIES = {
  "111":["111","116","166","666"], "112":["112","117","126","167","266","667"], "113":["113","118","136","168","366","668"],
  "114":["114","119","146","169","466","669"], "115":["110","115","156","160","566","660"], "122":["122","127","177","226","267","677"],
  "123":["123","128","137","178","236","268","367","678"], "124":["124","129","147","179","246","269","467","679"],
  "125":["120","125","157","170","256","260","567","670"], "133":["133","138","188","336","368","688"], "134":["134","139","148","189","346","369","468","689"],
  "135":["130","135","158","180","356","360","568","680"], "144":["144","149","199","446","469","699"], "145":["140","145","159","190","456","460","569","690"],
  "155":["100","150","155","556","560","600"], "222":["222","227","277","777"], "223":["223","228","237","278","377","778"],
  "224":["224","229","247","279","477","779"], "225":["220","225","257","270","577","770"], "233":["233","238","288","337","378","788"],
  "234":["234","239","248","289","347","379","478","789"], "235":["230","235","258","280","357","370","578","780"], "244":["244","249","299","447","479","799"],
  "245":["240","245","259","290","457","470","579","790"], "255":["200","250","255","557","570","700"], "333":["333","338","388","888"],
  "334":["334","339","348","389","488","889"], "335":["330","335","358","380","588","880"], "344":["344","349","399","448","489","899"],
  "345":["340","345","359","390","458","480","589","890"], "355":["300","350","355","558","580","800"], "444":["444","449","499","999"],
  "445":["440","445","459","490","599","990"], "455":["400","450","455","559","590","900"], "555":["000","500","550","555"]
};
function getFamilyFromPana(pana) {
  for (let family in PANA_FAMILIES) { if (PANA_FAMILIES[family].includes(pana)) return family; }
  return null;
}

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

// ── UI Helper Components (Scroll Fix) ──
function AmtInput({ amt, setAmt, chips, label = 'Bid Amount (Min ₹10)' }) {
  return (
    <div className="bf-fg">
      <label className="bf-label">{label}</label>
      <input className="bf-input" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)} inputMode="numeric" autoComplete="off" />
      <div className="bf-chips-row">
        {chips.map(c => (<div key={c} className={`bf-chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>))}
      </div>
    </div>
  );
}

function NumGrid({ selected, onSelect }) {
  return (
    <div className="bf-num-grid">
      {DIGITS.map(d => (<div key={d} className={`bf-nchip${selected === String(d) ? ' active' : ''}`} onClick={() => onSelect(String(d))}>{d}</div>))}
    </div>
  );
}

function JodiGrid({ selected, onSelect }) {
  const scrollRef = useRef(null);
  const scrollPos = useRef(0);
  const handleClick = (j) => { if (scrollRef.current) scrollPos.current = scrollRef.current.scrollTop; onSelect(j); };
  useEffect(() => { if (scrollRef.current && scrollPos.current > 0) scrollRef.current.scrollTop = scrollPos.current; });
  return (
    <div className="bf-jodi-scroll" ref={scrollRef}>
      <div className="bf-jodi-grid">
        {JODIS.map(j => (<div key={j} className={`bf-jchip${selected === j ? ' active' : ''}`} onClick={() => handleClick(j)}>{j}</div>))}
      </div>
    </div>
  );
}

function PanaGrid({ panas, selected, onSelect }) {
  const scrollRef = useRef(null);
  const scrollPos = useRef(0);
  const handleClick = (p) => { if (scrollRef.current) scrollPos.current = scrollRef.current.scrollTop; onSelect(p); };
  useEffect(() => { if (scrollRef.current && scrollPos.current > 0) scrollRef.current.scrollTop = scrollPos.current; });
  return (
    <div className="bf-pana-grid" ref={scrollRef}>
      {panas.map(p => (<div key={p} className={`bf-pchip${selected === p ? ' active' : ''}`} onClick={() => handleClick(p)}>{p}</div>))}
    </div>
  );
}

// ─── SP MOTOR COMPONENT ──────────────────────────────────────────────────────
function SPMotorSection({ num, setNum, amt, setAmt, chips, onSubmit, openClose, submitting }) {
  const parsedDigits = num ? [...new Set(num.replace(/\D/g, '').split('').map(Number))].filter(n => n >= 0 && n <= 9) : [];
  const allCombinations = parsedDigits.length >= 3 ? generateSPMotorCombinations(parsedDigits) : [];

  return <>
    <div className="bf-fg">
      <label className="bf-label">🔢 Enter Digits (3 to 10 unique digits)</label>
      <input className="bf-input" type="text" inputMode="numeric" maxLength={10} placeholder="e.g. 12345" value={num} onChange={e => setNum(e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ letterSpacing: 4, fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 10 }} />
      {parsedDigits.length > 0 && (<div className="bf-num-grid">{parsedDigits.map(d => (<div key={`entered-${d}`} className="bf-nchip active" style={{ cursor: 'default' }}>{d}</div>))}</div>)}
      {parsedDigits.length > 0 && parsedDigits.length < 3 && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)', marginTop: 10 }}>⚠️ Kam se kam <strong>3 unique digits</strong> chahiye</div>)}
    </div>
    <AmtInput amt={amt} setAmt={setAmt} chips={chips} label="💰 Amount per Pana (Min ₹10)" />
    {allCombinations.length > 0 && (
      <div className="bf-fg">
        <label className="bf-label">🎯 Generated Single Panas ({allCombinations.length})</label>
        <div className="bf-pana-grid" style={{ maxHeight: '250px', overflowY: 'auto', padding: '5px 0' }}>
          {allCombinations.map(p => (<div key={`generated-${p}`} className="bf-pchip active" style={{ cursor: 'default' }}>{p}</div>))}
        </div>
      </div>
    )}
    {allCombinations.length > 0 && Number(amt) >= 10 && (
      <button className="bf-place-btn" onClick={async () => { if (submitting) return; await onSubmit({ number: parsedDigits.join(''), amount: Number(amt), session: openClose }); }} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
        {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${(Number(amt) * allCombinations.length).toLocaleString()}`}
      </button>
    )}
  </>;
}

// ─── RED JODI COMPONENT ──────────────────────────────────────────────────────
function RedJodiSection({ num, setNum, amt, setAmt, chips, onSubmit, openClose, submitting }) {
  const [redType, setRedType] = useState('');
  const activeJodis = redType === 'half' ? HALF_RED_JODIS : redType === 'full' ? FULL_RED_JODIS : [];

  return <>
    <div className="bf-fg">
      <label className="bf-label">Red Jodi Type Select Karo</label>
      <div className="bf-session-row" style={{ marginBottom: 15 }}>
        {[{ key: 'half', label: '🔴 Half Red Jodi' }, { key: 'full', label: '🔴 Full Red Jodi' }].map(({ key, label }) => (
          <div key={key} className={`bf-session-btn${redType === key ? ' active' : ''}`} style={{ flex: 1, textAlign: 'center', padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 700 }} onClick={() => { setRedType(key); setNum(''); }}>{label}</div>
        ))}
      </div>
    </div>
    {redType === '' && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⬆️ Pehle <strong>Half Red Jodi</strong> ya <strong>Full Red Jodi</strong> select karo</div>)}
    {redType !== '' && (
      <div className="bf-fg">
        <div className="bf-jodi-scroll"><div className="bf-jodi-grid">{activeJodis.map(j => (<div key={j} className={`bf-jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>))}</div></div>
      </div>
    )}
    <AmtInput amt={amt} setAmt={setAmt} chips={chips} />
    {num && Number(amt) >= 10 && (
      <button className="bf-place-btn" onClick={async () => { if (submitting) return; await onSubmit({ number: num, amount: Number(amt), session: openClose }); }} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
        {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${Number(amt).toLocaleString()}`}
      </button>
    )}
  </>;
}

// ─── FAMILY JODI COMPONENT ───────────────────────────────────────────────────
function FamilyJodiSection({ amt, setAmt, chips, onSubmit, submitting, openClose }) {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedJodis, setSelectedJodis] = useState([]);
  const familyKeys  = ["12","13","14","15","23","24","25","34","35","45","half_red","full_red"];
  const familyJodis = selectedFamily ? JODI_FAMILIES[selectedFamily] : [];
  const totalLines = selectedJodis.length;
  const totalAmt   = totalLines * Number(amt || 0);

  const handleFamilySelect = (fk) => { setSelectedFamily(fk); setSelectedJodis([...JODI_FAMILIES[fk]]); setAmt(''); };
  const toggleJodi = (j) => { setSelectedJodis(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]); };
  const toggleAll = () => { if (selectedJodis.length === familyJodis.length) { setSelectedJodis([]); } else { setSelectedJodis([...familyJodis]); } };
  const handleSubmit = async () => { if (!selectedFamily || selectedJodis.length === 0 || !amt || Number(amt) < 10) return; const betsToSubmit = selectedJodis.map(j => ({ num: j, amt: Number(amt) })); await onSubmit({ __bulk: true, numbers: betsToSubmit, totalAmt, session: openClose }); };

  return <>
    <div className="bf-fg">
      <label className="bf-label">🎴 Family Select Karo</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {familyKeys.map(fk => (
          <div key={fk} onClick={() => handleFamilySelect(fk)} className={`bf-chip${selectedFamily === fk ? ' active' : ''}`} style={{ padding: '10px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13, minWidth: 70, textAlign: 'center', background: fk === 'half_red' ? (selectedFamily === fk ? '#e53935' : 'rgba(229,57,53,0.15)') : fk === 'full_red' ? (selectedFamily === fk ? '#b71c1c' : 'rgba(183,28,28,0.15)') : undefined, color: (fk === 'half_red' || fk === 'full_red') ? (selectedFamily === fk ? '#fff' : '#e53935') : undefined, borderColor: (fk === 'half_red' || fk === 'full_red') ? '#e53935' : undefined }}>
            {JODI_FAMILY_LABELS[fk]}
          </div>
        ))}
      </div>
    </div>
    {!selectedFamily && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⬆️ Upar se koi ek <strong>Family</strong> select karo</div>)}
    {selectedFamily && <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <div className="bf-desc-box" style={{ background: 'rgba(0,255,213,0.08)', color: '#00ffd5', border: '1px solid rgba(0,255,213,0.3)', margin: 0, flex: 1 }}>✅ <strong>{JODI_FAMILY_LABELS[selectedFamily]}</strong> — <strong>{selectedJodis.length}/{familyJodis.length}</strong> Jodis selected</div>
        <div onClick={toggleAll} style={{ padding: '8px 12px', background: selectedJodis.length === familyJodis.length ? '#e53935' : '#00ffd5', color: '#000', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{selectedJodis.length === familyJodis.length ? '✕ Clear' : '✓ All'}</div>
      </div>
      <div className="bf-fg">
        <label className="bf-label">🎯 Jodis click karke select/deselect karo</label>
        <div className="bf-jodi-scroll"><div className="bf-jodi-grid">{familyJodis.map(j => (<div key={j} className={`bf-jchip${selectedJodis.includes(j) ? ' active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleJodi(j)}>{j}</div>))}</div></div>
      </div>
      {selectedJodis.length === 0 && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⚠️ Kam se kam <strong>1 jodi</strong> select karo</div>)}
      {selectedJodis.length > 0 && (
        <div className="bf-fg">
          <label className="bf-label">💰 Amount per Jodi (Min ₹10)</label>
          <input className="bf-input" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)} />
          <div className="bf-chips-row">{chips.map(c => (<div key={c} className={`bf-chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>))}</div>
        </div>
      )}
      {selectedJodis.length > 0 && Number(amt) >= 10 && (<div className="bf-infobox">📊 <strong>{totalLines} jodis</strong> × ₹<strong>{amt}</strong> = Total: <strong>₹{totalAmt.toLocaleString()}</strong></div>)}
      {selectedJodis.length > 0 && Number(amt) >= 10 && (<button className="bf-place-btn" onClick={handleSubmit} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? '⏳ Placing...' : `🎯 Place Family Jodi — ₹${totalAmt.toLocaleString()}`}</button>)}
    </>}
  </>;
}

// ─── FAMILY PANA COMPONENT ───────────────────────────────────────────────────
function FamilyPanaSection({ num, setNum, amt, setAmt, chips, openClose, onSubmit, submitting }) {
  const foundFamily = num.length === 3 ? getFamilyFromPana(num) : null;
  const familyPanas = foundFamily ? PANA_FAMILIES[foundFamily] : [];
  const totalLines  = familyPanas.length;
  const totalAmt    = totalLines * Number(amt || 0);

  const handleSubmit = async () => { if (!foundFamily || !amt || Number(amt) < 10) return; const betsToSubmit = familyPanas.map(p => ({ num: p, amt: Number(amt) })); await onSubmit({ __bulk: true, numbers: betsToSubmit, totalAmt, session: openClose }); };

  return <>
    <div className="bf-fg">
      <label className="bf-label">🎴 Koi bhi Pana enter karo (3 digits)</label>
      <input className="bf-input" type="text" inputMode="numeric" maxLength={3} placeholder="e.g. 134" value={num} onChange={e => setNum(e.target.value.replace(/\D/g, '').slice(0, 3))} style={{ letterSpacing: 8, fontSize: 24, fontWeight: 800, textAlign: 'center' }} />
    </div>
    {num.length === 3 && !foundFamily && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⚠️ Yeh pana kisi family mein nahi mila. Sahi pana enter karo.</div>)}
    {foundFamily && <>
      <div className="bf-desc-box" style={{ background: 'rgba(0,255,213,0.08)', color: '#00ffd5', border: '1px solid rgba(0,255,213,0.3)' }}>✅ <strong>{foundFamily} Family</strong> — Total <strong>{totalLines} Panas</strong> cover hongi</div>
      <div className="bf-fg">
        <label className="bf-label">🎯 Family ke Saare Panas ({totalLines})</label>
        <div className="bf-pana-grid">{familyPanas.map(p => (<div key={p} className={`bf-pchip${p === num ? ' active' : ''}`} style={{ cursor: 'default' }}>{p}</div>))}</div>
      </div>
      <div className="bf-fg">
        <label className="bf-label">💰 Amount per Pana (Min ₹10)</label>
        <input className="bf-input" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)} />
        <div className="bf-chips-row">{chips.map(c => (<div key={c} className={`bf-chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>))}</div>
      </div>
      {Number(amt) >= 10 && (<div className="bf-infobox">📊 <strong>{totalLines} panas</strong> × ₹<strong>{amt}</strong> = Total Bid: <strong>₹{totalAmt.toLocaleString()}</strong></div>)}
      {Number(amt) >= 10 && (<button className="bf-place-btn" onClick={handleSubmit} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-ailed' : 'pointer' }}>{submitting ? '⏳ Placing...' : `🎯 Place Family Bid — ₹${totalAmt.toLocaleString()}`}</button>)}
    </>}
  </>;
}

// ── MAIN BETFORM COMPONENT ──────────────────────────────────────────────────
export default function BetForm({ game, gameType, wallet, onSubmit }) {
  const [num, setNum] = useState('');
  const [num2, setNum2] = useState('');
  const [activeN, setActiveN] = useState(null);
  const [amt, setAmt] = useState('');
  const [bets, setBets] = useState([]);
  const [oddEven, setOddEven] = useState('');
  const [oddEvenNum, setOddEvenNum] = useState(null);
  const [cycleDigit, setCycleDigit] = useState(null);
  const [spDpDigit, setSpDpDigit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const chips = [10, 50, 100, 200, 500];
  const id = gameType.id;
  const nt = gameType.numType;

  // ── SESSION LOGIC ────────────────────────────────────────────
  const openDeclared  = !!game.open_result;
  const closeDeclared = !!game.close_result;
  const defaultSession = openDeclared ? 'close' : 'open';
  const [openClose, setOpenClose] = useState(defaultSession);

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

  const isBulkType = nt==='ank_bulk'||nt==='jodi_bulk'||nt==='pana_bulk'||id==='sp_common'||id==='dp_common'||id==='cycle_jodi'||id==='digit_jodi'||id==='cycle_panna'||id==='crossing_jodi'||id==='family_jodi'||id==='family_pana'||id.includes('half_sangam_bulk')||id.includes('full_sangam_bulk');

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
    if (openDeclared && openClose === 'open') {
      alert('Open result declare ho chuka hai. Sirf CLOSE session pe bet laga sakte ho.');
      return;
    }
    if (openDeclared && closeDeclared) {
      alert('Aaj ke liye game band ho chuka hai. Dono results declare ho gaye hain.');
      return;
    }

    setSubmitting(true);
    try {
      const commonData = { session: openClose };

      if (isBulkType) {
        if (!bets.length) { setSubmitting(false); return; }
        await onSubmit({ __bulk: true, numbers: bets, totalAmt, ...commonData });
      } else if (id === 'odd_even') {
        if (!oddEven || oddEvenNum === null || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: String(oddEvenNum), amount: Number(amt), ...commonData });
      } else if (id === 'half_sangam_a' || id === 'half_sangam_b' || id === 'full_sangam') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}-${num2}`, amount: Number(amt), ...commonData });
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

  const WinInfo = () => (
    <div className="bf-infobox">
      Bid: <strong>₹{Number(amt||0).toLocaleString()}</strong> &nbsp;→&nbsp;
      Win: <strong>₹{(Number(amt||0)*parseFloat(gameType.win)).toLocaleString()}</strong>
    </div>
  );

  const PlaceBtn = () => (
    <button className="bf-place-btn" onClick={handleSubmit} disabled={submitting}>
      {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${Number(amt||0).toLocaleString()}`}
    </button>
  );

  const BulkTable = () => (bets.length > 0 ? (
    <>
      <div className="bf-bulk-table-wrap">
        <table className="bf-table">
          <thead><tr><th>#</th><th>Number</th><th>Amount</th><th></th></tr></thead>
          <tbody>{bets.map((b, i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td><strong>{b.num}</strong></td>
              <td>₹{b.amt.toLocaleString()}</td>
              <td><button className="bf-del" onClick={() => removeBet(i)}>✕</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bf-total-row">
        <span>Total Bets: {bets.length}</span>
        <strong>₹{totalAmt.toLocaleString()}</strong>
      </div>
    </>
  ) : null);

  const AddBtn = ({ label = '+ Add to List' }) => (
    <button onClick={addToBulk} className="bf-add-btn">{label}</button>
  );

  const PlaceAllBtn = () => (
    <button className="bf-place-btn" onClick={handleSubmit} disabled={submitting} style={{marginTop:12}}>
      {submitting ? '⏳ Placing...' : `🎯 Place All Bids — ₹${totalAmt.toLocaleString()}`}
    </button>
  );

  const SessionToggle = () => (
    <div className="bf-fg">
      <label className="bf-label">Select Session</label>
      {openDeclared && (
        <div className="bf-session-notice">
          ⚠️ Open result declare ho gaya. Sirf <strong>CLOSE</strong> session available hai.
        </div>
      )}
      <div className="bf-session-row">
        {['open', 'close'].map(s => {
          const isDisabled = openDeclared && s === 'open';
          return (
            <div
              key={s}
              className={`bf-session-btn${openClose === s ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
              onClick={() => !isDisabled && setOpenClose(s)}
              style={isDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {s === 'open' ? '🌅 OPEN' : '🌙 CLOSE'}
              {isDisabled && <div style={{ fontSize: 9, marginTop: 2, letterSpacing: 0 }}>Result Declared</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bf-wrap">
      {/* Banner */}
      <div className="bf-banner">
        <div className="bf-banner-icon">{game.icon}</div>
        <div>
          <div className="bf-banner-name">{game.name}</div>
          <div className="bf-banner-sub">{gameType.label} &nbsp;|&nbsp; Win: {gameType.win}x &nbsp;|&nbsp; 💰 ₹{wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="bf-card">
        <div className="bf-title">🎯 {gameType.label}</div>
        <div className="bf-desc-box">{gameType.desc} &nbsp;— Multiplier: <strong>{gameType.win}x</strong></div>

        {id !== 'jodi' && id !== 'jodi_bulk' && id !== 'jodi_digit' && id !== 'red_jodi' && id !== 'family_pana' && id !== 'family_jodi' && id !== 'crossing_jodi' && <SessionToggle />}

        {id === 'single_digit'      && <><div className="bf-fg"><label className="bf-label">Pick a Digit (0–9)</label><NumGrid selected={num} onSelect={v => { setNum(v); setActiveN(Number(v)); }} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'single_digit_bulk' && <><div className="bf-fg"><label className="bf-label">Pick Digits</label><NumGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Bid Amount (Min ₹10)"/><AddBtn label="+ Add Digit"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'jodi_digit'        && <><div className="bf-fg"><label className="bf-label">Pick Jodi (00–99)</label><JodiGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'jodi_bulk'         && <><div className="bf-fg"><label className="bf-label">Pick Jodi</label><JodiGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn label="+ Add Jodi"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'single_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Single Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'single_pana_bulk'  && <><div className="bf-fg"><label className="bf-label">Pick Single Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'double_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Double Pana</label><PanaGrid panas={DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'double_pana_bulk'  && <><div className="bf-fg"><label className="bf-label">Pick Double Pana</label><PanaGrid panas={DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'triple_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Triple Pana</label><PanaGrid panas={TRIPLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        
        {/* FAMILY PANA & JODI */}
        {id === 'family_pana' && <FamilyPanaSection num={num} setNum={setNum} amt={amt} setAmt={setAmt} chips={chips} openClose={openClose} onSubmit={onSubmit} submitting={submitting} />}
        {id === 'family_jodi' && <FamilyJodiSection amt={amt} setAmt={setAmt} chips={chips} onSubmit={onSubmit} submitting={submitting} openClose={openClose} />}

        {/* HALF SANGAM & FULL SANGAM */}
        {(id === 'half_sangam_a' || id === 'half_sangam_b' || id === 'half_sangam_bulk') && <>
          {openClose === 'open' ? (
            <>
              <div className="bf-fg"><label className="bf-label">Open Digit (0–9)</label><NumGrid selected={num} onSelect={setNum} /></div>
              <div className="bf-fg"><label className="bf-label">Close Pana</label><PanaGrid panas={PANA_210} selected={num2} onSelect={setNum2} /></div>
            </>
          ) : (
            <>
              <div className="bf-fg"><label className="bf-label">Open Pana</label><PanaGrid panas={PANA_210} selected={num} onSelect={setNum} /></div>
              <div className="bf-fg"><label className="bf-label">Close Digit (0–9)</label><NumGrid selected={num2} onSelect={setNum2} /></div>
            </>
          )}
          <AmtInput amt={amt} setAmt={setAmt} chips={chips}/>
          <WinInfo/>
          <PlaceBtn/>
        </>}
        {(id === 'full_sangam' || id === 'full_sangam_bulk') && <>
          <div className="bf-fg">
            <label className="bf-label" style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
              <span>Open Pana</span>
              {num2 && <span style={{fontSize:12, color:'#00ffd5', fontWeight:'bold'}}>Close Selected: {num2} ✓</span>}
            </label>
            <PanaGrid panas={PANA_210} selected={num} onSelect={setNum} />
          </div>
          <div className="bf-fg">
            <label className="bf-label" style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
              <span>Close Pana</span>
              {num && <span style={{fontSize:12, color:'#00ffd5', fontWeight:'bold'}}>Open Selected: {num} ✓</span>}
            </label>
            <PanaGrid panas={PANA_210} selected={num2} onSelect={setNum2} />
          </div>
          {(!num || !num2) && <div className="bf-desc-box" style={{background:'rgba(255,165,0,0.1)', color:'#FFA500', border:'1px solid rgba(255,165,0,0.3)'}}>Please select both <strong>Open Pana</strong> and <strong>Close Pana</strong>.</div>}
          <AmtInput amt={amt} setAmt={setAmt} chips={chips}/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ODD / EVEN */}
        {id === 'odd_even' && <>
          <div className="bf-fg"><label className="bf-label">Bet On</label>
            <div className="bf-session-row">
              {['ODD','EVEN'].map(oe => (
                <div key={oe} className={`bf-session-btn${oddEven === oe ? ' active' : ''}`} style={{flex:1, textAlign:'center', padding:'12px 0', fontSize:14}} onClick={() => { setOddEven(oe); setOddEvenNum(null); }}>{oe}</div>
              ))}
            </div>
          </div>
          {oddEven !== '' && (
            <div className="bf-fg">
              <label className="bf-label">{oddEven === 'ODD' ? 'ODD Numbers (1,3,5,7,9)' : 'EVEN Numbers (0,2,4,6,8)'}</label>
              <div className="bf-num-grid">
                {(oddEven === 'ODD' ? ODD_NUMBERS : EVEN_NUMBERS).map(n => (
                  <div key={n} className={`bf-nchip${oddEvenNum === n ? ' active' : ''}`} onClick={() => setOddEvenNum(n)}>{n}</div>
                ))}
              </div>
            </div>
          )}
          <AmtInput amt={amt} setAmt={setAmt} chips={chips}/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* MOTORS */}
        {id === 'dp_motor' && <><div className="bf-fg"><label className="bf-label">Pick Pana</label><PanaGrid panas={DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'sp_motor' && <SPMotorSection num={num} setNum={setNum} amt={amt} setAmt={setAmt} chips={chips} onSubmit={onSubmit} openClose={openClose} submitting={submitting} />}

        {/* RED JODI */}
        {id === 'red_jodi' && <RedJodiSection num={num} setNum={setNum} amt={amt} setAmt={setAmt} chips={chips} onSubmit={onSubmit} openClose={openClose} submitting={submitting} />}

        {/* CYCLE JODI */}
        {id === 'cycle_jodi' && <><div className="bf-fg"><label className="bf-label">Pick a Digit to Cycle</label><NumGrid selected={cycleDigit !== null ? String(cycleDigit) : ''} onSelect={v => setCycleDigit(Number(v))} /></div>{cycleDigit !== null && <div className="bf-desc-box">Will add <strong>{cycleJodis.length} jodis</strong>: {cycleJodis.slice(0,6).join(', ')}...</div>}<AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Amount per jodi"/><AddBtn label="+ Add All Cycle Jodis"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}

        {/* SP DP TP */}
        {id === 'sp_dp_tp' && <><div className="bf-fg"><label className="bf-label">Select Type</label><div className="bf-session-row" style={{marginBottom:10}}>{['SP','DP','TP'].map(t => (<div key={t} className={`bf-session-btn${num2 === t ? ' active' : ''}`} style={{flex:1, textAlign:'center', padding:'10px 0', fontSize:14, cursor:'pointer'}} onClick={() => { setNum2(t); setNum(''); setSpDpDigit(null); }}>{t}</div>))}</div></div>{(num2 === 'SP' || num2 === 'DP') && (<div className="bf-fg"><label className="bf-label">🔢 Digit Select Karo (0–9)</label><NumGrid selected={spDpDigit !== null ? String(spDpDigit) : ''} onSelect={v => { setSpDpDigit(Number(v)); setNum(''); }} /></div>)}{num2 === 'SP' && spDpDigit !== null && (<div className="bf-fg"><label className="bf-label">Pick Single Pana — Digit {spDpDigit} ({SP_PANAS_FINAL[spDpDigit]?.length} panas)</label><PanaGrid panas={SP_PANAS_FINAL[spDpDigit] || []} selected={num} onSelect={setNum} /></div>)}{num2 === 'DP' && spDpDigit !== null && (<div className="bf-fg"><label className="bf-label">Pick Double Pana — Digit {spDpDigit} ({DP_PANAS[spDpDigit]?.length} panas)</label><PanaGrid panas={DP_PANAS[spDpDigit] || []} selected={num} onSelect={setNum} /></div>)}{num2 === 'TP' && (<div className="bf-fg"><label className="bf-label">Pick Triple Pana</label><PanaGrid panas={TRIPLE_PANAS} selected={num} onSelect={setNum} /></div>)}<AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}

        {/* TWO DIGIT PANA */}
        {id === 'two_digit_pana' && <><div className="bf-fg"><label className="bf-label">Pick Jodi (2-digit)</label><JodiGrid selected={num} onSelect={setNum} /></div><div className="bf-fg"><label className="bf-label">Pick Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num2} onSelect={setNum2} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        
        {/* DIGIT JODI */}
        {id === 'digit_jodi' && <><div className="bf-fg"><label className="bf-label">Open or Close?</label><div className="bf-session-row" style={{marginBottom:10}}>{['open','close'].map(s => (<div key={s} className={`bf-session-btn${openClose === s ? ' active' : ''}`} style={{flex:1,textAlign:'center',padding:'10px 0',fontSize:13}} onClick={() => setOpenClose(s)}>{s.toUpperCase()}</div>))}</div></div><div className="bf-fg"><label className="bf-label">Pick a Digit</label><NumGrid selected={activeN !== null ? String(activeN) : ''} onSelect={v => setActiveN(Number(v))} /></div>{activeN !== null && <div className="bf-desc-box">Will add <strong>{digitJodis.length} jodis</strong>: {digitJodis.join(', ')}</div>}<AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Amount per jodi"/><AddBtn label="+ Add Digit Jodis"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}

        {/* SP/DP COMMON */}
        {(id === 'sp_common' || id === 'dp_common') && <><div className="bf-fg"><label className="bf-label">🔢 Digit Select Karo (0–9)</label><NumGrid selected={spDpDigit !== null ? String(spDpDigit) : ''} onSelect={v => { setSpDpDigit(Number(v)); setNum(''); }} /></div>{spDpDigit !== null && (<div className="bf-fg"><label className="bf-label">Pick {id === 'sp_common' ? 'Single' : 'Double'} Pana — Digit {spDpDigit} ({id === 'sp_common' ? SP_PANAS_FINAL[spDpDigit]?.length : DP_PANAS[spDpDigit]?.length} panas)</label><PanaGrid panas={id === 'sp_common' ? (SP_PANAS_FINAL[spDpDigit] || []) : (DP_PANAS[spDpDigit] || [])} selected={num} onSelect={setNum} /></div>)}{spDpDigit === null && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⬆️ Pehle digit select karo</div>)}<AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}

        {/* CYCLE PANNA */}
        {id === 'cycle_panna' && <>
          <div className="bf-fg">
            <label className="bf-label">🎯 Jodi Select Karo</label>
            <div className="bf-chips-row" style={{flexWrap:'wrap', marginBottom:10}}>
              {CYCLE_PANNA_JODIS.map(j => (
                <div key={j} onClick={() => { setSpDpDigit(j); setNum(''); }} className={`bf-chip${spDpDigit === j ? ' active' : ''}`} style={{minWidth:48, textAlign:'center'}}>{j}</div>
              ))}
            </div>
          </div>
          {spDpDigit !== null && CYCLE_PANNA_DATA[spDpDigit] && <>
            <div className="bf-desc-box" style={{ background: 'rgba(0,255,213,0.08)', color: '#00ffd5', border: '1px solid rgba(0,255,213,0.4)' }}>🎯 <strong>Jodi {spDpDigit}</strong> — <strong>{CYCLE_PANNA_DATA[spDpDigit].length} Panas</strong> available</div>
            <div className="bf-fg">
              <label className="bf-label">📋 Cycle Panas ({CYCLE_PANNA_DATA[spDpDigit].length})</label>
              <div className="bf-pana-grid">
                {CYCLE_PANNA_DATA[spDpDigit].map(p => (
                  <div key={p} className={`bf-pchip${num === String(p) ? ' active' : ''}`} onClick={() => setNum(String(p))}>{String(p).padStart(3,'0')}</div>
                ))}
              </div>
            </div>
            <AmtInput label="💰 Amount per Pana (Min ₹10)" />
            {num && Number(amt) >= 10 && (<div className="bf-infobox">📊 Selected: <strong>{String(num).padStart(3,'0')}</strong> | Bid: <strong>₹{Number(amt).toLocaleString()}</strong></div>)}
            <AddBtn label="+ Add to List" />
            <BulkTable />
            {bets.length > 0 && (<button className="bf-place-btn" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 12, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? '⏳ Placing...' : `🎯 Place All — ₹${totalAmt.toLocaleString()}`}</button>)}
          </>}
          {spDpDigit === null && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⬆️ Pehle <strong>Jodi</strong> select karo</div>)}
        </>}

        {/* CROSSING JODI */}
        {id === 'crossing_jodi' && (() => {
          const f = [...new Set(num.split('').filter(c => /\d/.test(c)))];
          const s = [...new Set(num2.split('').filter(c => /\d/.test(c)))];
          const cutDouble = cycleDigit === 'cut';
          const generated = [];
          f.forEach(a => s.forEach(b => { if (cutDouble && a === b) return; generated.push(a + b); }));
          const totalGenAmt = generated.length * Number(amt || 0);

          return <>
            <div className="bf-fg"><label className="bf-label">🔢 First Digits (max 7)</label><input className="bf-input" type="text" inputMode="numeric" maxLength={7} placeholder="e.g. 1234" value={num} onChange={e => setNum(e.target.value.replace(/\D/g,'').slice(0,7))} style={{ letterSpacing: 6, fontSize: 22, fontWeight: 800, textAlign: 'center' }} /></div>
            <div className="bf-fg"><label className="bf-label">🔢 Second Digits (max 7)</label><input className="bf-input" type="text" inputMode="numeric" maxLength={7} placeholder="e.g. 5678" value={num2} onChange={e => setNum2(e.target.value.replace(/\D/g,'').slice(0,7))} style={{ letterSpacing: 6, fontSize: 22, fontWeight: 800, textAlign: 'center' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(0,255,213,0.05)', border: '1px solid rgba(0,255,213,0.3)', borderRadius: 10, marginBottom: 14, cursor: 'pointer' }} onClick={() => setCycleDigit(cycleDigit === 'cut' ? null : 'cut')}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid #00ffd5', background: cycleDigit === 'cut' ? '#00ffd5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>{cycleDigit === 'cut' && <span style={{ color: '#000', fontWeight: 900, fontSize: 14 }}>✓</span>}</div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Double Jodi Hatao (00, 11, 22...)</span>
            </div>
            {(!num || !num2) && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⬆️ Dono digit fields bharo</div>)}
            {num && num2 && generated.length === 0 && (<div className="bf-desc-box" style={{ background: 'rgba(255,165,0,0.1)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)' }}>⚠️ Koi jodi nahi bani — digits check karo</div>)}
            {generated.length > 0 && <>
              <div className="bf-desc-box" style={{ background: 'rgba(0,255,213,0.08)', color: '#00ffd5', border: '1px solid rgba(0,255,213,0.4)' }}>🎯 <strong>{generated.length} Jodis</strong> generate hongi</div>
              <div className="bf-fg"><label className="bf-label">📋 Generated Jodis</label><div className="bf-jodi-scroll"><div className="bf-jodi-grid">{generated.map(j => (<div key={j} className="bf-jchip active" style={{ cursor: 'default' }}>{j}</div>))}</div></div></div>
              <div className="bf-fg"><label className="bf-label">💰 Amount per Jodi (Min ₹10)</label><input className="bf-input" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)} /><div className="bf-chips-row">{chips.map(c => (<div key={c} className={`bf-chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>))}</div></div>
              {Number(amt) >= 10 && <>
                <div className="bf-infobox">📊 <strong>{generated.length} jodis</strong> × ₹<strong>{amt}</strong> = Total: <strong>₹{totalGenAmt.toLocaleString()}</strong></div>
                <button className="bf-place-btn" disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }} onClick={async () => { if (submitting) return; setSubmitting(true); try { await onSubmit({ __bulk: true, numbers: generated.map(j => ({ num: j, amt: Number(amt) })), totalAmt: totalGenAmt, session: openClose }); } finally { setSubmitting(false); } }}>{submitting ? '⏳ Placing...' : `🎯 Place All — ₹${totalGenAmt.toLocaleString()}`}</button>
              </>}
            </>}
          </>;
        })()}

      </div>

      <style>{`
        .bf-wrap { background: radial-gradient(ellipse at bottom, #0d2e1a 0%, #040a04 100%); min-height: 100vh; padding-bottom: 80px; }
        .bf-banner {
          background: linear-gradient(135deg, #040e04 0%, #0d2210 60%, #1a1200 100%);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          border-bottom: 1.5px solid rgba(255,215,0,0.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
        .bf-banner-icon {
          width: 44px; height: 44px;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .bf-banner-name { font-size: 20px; font-weight: 700; color: #FFD700; text-transform: uppercase; letter-spacing: 2px; font-family: 'Teko', sans-serif; text-shadow: 0 0 10px rgba(255,215,0,0.5); }
        .bf-banner-sub  { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }

        .bf-card {
          background: linear-gradient(145deg, rgba(5,15,5,0.9), rgba(10,22,10,0.9));
          margin: 12px; border-radius: 14px; padding: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,215,0,0.15);
        }

        .bf-title {
          font-size: 18px; font-weight: 700; color: #00ffd5;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
          text-transform: uppercase; letter-spacing: 1px;
          font-family: 'Teko', sans-serif;
          text-shadow: 0 0 8px rgba(0,255,213,0.4);
        }

        .bf-desc-box {
          background: rgba(0,255,213,0.05); border: 1px solid rgba(0,255,213,0.15);
          border-radius: 10px; padding: 9px 12px; margin-bottom: 14px;
          font-size: 13px; color: #00ffd5; line-height: 1.5;
        }
        .bf-desc-box strong { color: #fff; }

        .bf-session-notice {
          background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255,165,0,0.3);
          border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;
          font-size: 12px; color: #FFA500; font-weight: 600; line-height: 1.5;
        }
        .bf-session-notice strong { color: #fff; }

        .bf-fg   { margin-bottom: 14px; }
        .bf-label { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 7px; font-family: 'Teko', sans-serif; }

        .bf-input {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,215,0,0.2); border-radius: 10px;
          padding: 11px 14px; color: #fff; font-size: 16px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .bf-input:focus { border-color: #00ffd5; box-shadow: 0 0 8px rgba(0,255,213,0.2); }
        .bf-input::placeholder { color: rgba(255,255,255,0.2); }

        .bf-chips-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
        .bf-chip {
          background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2);
          border-radius: 8px; padding: 5px 12px;
          font-size: 13px; cursor: pointer; font-weight: 700; color: #FFD700;
          transition: all 0.15s;
        }
        .bf-chip:hover { background: rgba(255,215,0,0.1); border-color: #FFD700; }
        .bf-chip.active { background: linear-gradient(135deg,#FFD700,#FFA500); color: #000; border-color: #FFD700; }

        .bf-infobox {
          background: rgba(0,255,213,0.05); border: 1px solid rgba(0,255,213,0.2);
          border-radius: 10px; padding: 9px 14px; margin-bottom: 12px;
          font-size: 13px; color: #00ffd5;
        }
        .bf-infobox strong { color: #fff; font-size: 14px; }

        .bf-num-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-bottom: 4px; }
        .bf-nchip {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 12px 6px;
          text-align: center; font-size: 16px; font-weight: 800;
          cursor: pointer; color: #fff; transition: all 0.15s;
        }
        .bf-nchip:hover { border-color: #00ffd5; color: #00ffd5; }
        .bf-nchip.active { background: linear-gradient(135deg,#00e5cc,#00cc44); color: #000; border-color: #00ffd5; box-shadow: 0 0 8px rgba(0,255,213,0.3); }

        .bf-jodi-scroll {
          max-height: 200px; overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          background: rgba(0,0,0,0.3); margin-bottom: 4px;
        }
        .bf-jodi-scroll::-webkit-scrollbar { width: 3px; }
        .bf-jodi-scroll::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 3px; }
        .bf-jodi-grid { display: grid; grid-template-columns: repeat(5,1fr); }
        .bf-jchip {
          padding: 10px 4px; text-align: center;
          font-size: 12px; font-weight: 700; cursor: pointer; color: rgba(255,255,255,0.7);
          border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: all 0.12s;
        }
        .bf-jchip:hover { background: rgba(0,255,213,0.05); color: #00ffd5; }
        .bf-jchip.active { background: linear-gradient(135deg,#00e5cc,#00cc44); color: #000; }

        .bf-pana-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 6px;
          max-height: 200px; overflow-y: auto; margin-bottom: 4px;
        }
        .bf-pana-grid::-webkit-scrollbar { width: 3px; }
        .bf-pana-grid::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 3px; }
        .bf-pchip {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 8px 4px;
          text-align: center; font-size: 12px; font-weight: 700;
          cursor: pointer; color: rgba(255,255,255,0.7); transition: all 0.12s;
        }
        .bf-pchip:hover { border-color: #00ffd5; color: #00ffd5; }
        .bf-pchip.active { background: linear-gradient(135deg,#00e5cc,#00cc44); color: #000; border-color: #00ffd5; }

        .bf-session-row { display: flex; gap: 10px; }
        .bf-session-btn {
          flex: 1; text-align: center; padding: 11px 0;
          font-size: 13px; font-weight: 700; cursor: pointer;
          border-radius: 10px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.1); transition: all 0.15s; letter-spacing: 1px;
          font-family: 'Teko', sans-serif;
        }
        .bf-session-btn:hover { border-color: #00ffd5; color: #00ffd5; }
        .bf-session-btn.active { background: linear-gradient(135deg,#00e5cc,#00cc44); color: #000; border-color: #00ffd5; }
        .bf-session-btn.disabled { opacity: 0.4; cursor: not-allowed; }
        .bf-session-btn.disabled:hover { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }

        .bf-add-btn {
          width: 100%; background: rgba(0,255,213,0.05); color: #00ffd5;
          border: 1px dashed rgba(0,255,213,0.3); border-radius: 10px;
          padding: 11px; font-weight: 700; font-size: 14px;
          cursor: pointer; margin-bottom: 14px; transition: all 0.15s;
        }
        .bf-add-btn:hover { background: rgba(0,255,213,0.1); border-color: #00ffd5; }

        .bf-bulk-table-wrap { overflow-x: auto; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
        .bf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .bf-table th { background: rgba(255,215,0,0.05); color: #FFD700; padding: 9px 10px; text-align: left; font-weight: 700; letter-spacing: 1px; font-size: 11px; font-family: 'Teko', sans-serif; }
        .bf-table td { padding: 9px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .bf-table tr:last-child td { border-bottom: none; }
        .bf-del { background: rgba(255,34,68,0.1); color: #ff2244; border: 1px solid rgba(255,34,68,0.3); border-radius: 5px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: 700; transition: all 0.15s; }
        .bf-del:hover { background: #ff2244; color: #fff; }

        .bf-total-row {
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2);
          border-radius: 10px; padding: 10px 14px; margin-bottom: 4px;
        }
        .bf-total-row span   { font-size: 13px; color: #FFD700; font-weight: 600; }
        .bf-total-row strong { font-size: 16px; color: #fff; font-weight: 800; }

        .bf-place-btn {
          width: 100%;
          background: linear-gradient(90deg, #14f4ce, #e0800b); /* ✅ Cyan to Orange */
          color: #001a17; /* ✅ Dark text */
          border: none;
          border-radius: 10px 40px 10px 40px; /* ✅ Same Curved Shape */
          padding: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s;
          margin-top: 4px;
          font-family: 'Teko', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .bf-place-btn:hover {
          transform: scale(1.02);
        }
        /* ✅ Shine Animation (Same as HomeScreen Play Button) */
        .bf-place-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          animation: shineMove 2.5s infinite linear;
        }
        @keyframes shineMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .bf-place-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,165,0,0.5); }
        .bf-place-btn:active:not(:disabled) { transform: scale(0.98); }
        .bf-place-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
