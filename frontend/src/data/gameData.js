// ── GAME TYPES ──
export const GAME_TYPES = [
  {id:'single_digit',      label:'SINGLE DIGIT',      icon:'single_digit', desc:'Pick 1 digit (0–9)',       win:'9.5',  numType:'ank'},
  {id:'single_digit_bulk', label:'SINGLE DIGIT BULK', icon:'bulk',         desc:'Multiple digits at once',  win:'9.5',  numType:'ank_bulk'},
  {id:'jodi_digit',        label:'JODI DIGIT',         icon:'jodi',         desc:'Pick 2-digit Jodi 00–99',  win:'95', numType:'jodi'},
  {id:'jodi_bulk',         label:'JODI BULK',          icon:'bulk',         desc:'Multiple Jodi bets',       win:'95', numType:'jodi_bulk'},
  {id:'single_pana',       label:'SINGLE PANA',        icon:'single_pana',  desc:'3-digit single pana',      win:'150×',numType:'pana'},
  {id:'single_pana_bulk',  label:'SINGLE PANA BULK',   icon:'bulk',         desc:'Multiple single pana',     win:'150×',numType:'pana_bulk'},
  {id:'double_pana',       label:'DOUBLE PANA',        icon:'double_pana',  desc:'3-digit double pana',      win:'300×',numType:'pana'},
  {id:'double_pana_bulk',  label:'DOUBLE PANA BULK',   icon:'bulk',         desc:'Multiple double pana',     win:'300×',numType:'pana_bulk'},
  {id:'triple_pana',       label:'TRIPLE PANA',        icon:'triple_pana',  desc:'Triple digit pana',        win:'700',numType:'pana'},
    // ✅ ADD THESE 4 MISSING GAMES TO YOUR GAME_TYPES ARRAY
  { id: 'family_jodi', label: 'Family Jodi', win: 95, numType: 'jodi_bulk', icon: 'family', desc: 'Select a Jodi family to play all combinations.' },
  { id: 'family_pana', label: 'Family Pana', win: 150, numType: 'pana_bulk', icon: 'family', desc: 'Enter any Pana to play its whole family.' },
  { id: 'crossing_jodi', label: 'Crossing Jodi', win: 95, numType: 'jodi_bulk', icon: 'cross', desc: 'Cross two sets of digits to generate Jodis.' },
  { id: 'cycle_panna', label: 'Cycle Panna', win: 150, numType: 'pana_bulk', icon: 'cycle', desc: 'Select a Jodi to play its Cycle Panas.' },
  {id:'half_sangam_a',     label:'HALF SANGAM A',      icon:'half_sangam',  desc:'Open digit + close pana',  win:'1000×',numType:'sangam'},
  {id:'half_sangam_b',     label:'HALF SANGAM B',      icon:'half_sangam',  desc:'Open pana + close digit',  win:'1000×',numType:'sangam'},
  {id:'full_sangam',       label:'FULL SANGAM',        icon:'full_sangam',  desc:'Open pana + close pana',   win:'2000×',numType:'sangam'},
  {id:'odd_even',          label:'ODD / EVEN',         icon:'odd_even',     desc:'Bet on Odd or Even',        win:'2×',  numType:'oddeven'},
  {id:'dp_motor',          label:'DP MOTOR',           icon:'dp_motor',     desc:'Double Pana motor bet',     win:'300×',numType:'pana_bulk'},
  {id:'sp_motor',          label:'SP MOTOR',           icon:'sp_motor',     desc:'Single Pana motor bet',     win:'150×',numType:'pana_bulk'},
  {id:'red_jodi',          label:'RED JODI',           icon:'red_jodi',     desc:'Special red jodi bet',      win:'95', numType:'jodi'},
  {id:'cycle_jodi',        label:'CYCLE JODI',         icon:'cycle_jodi',   desc:'All jodis with a digit',    win:'95', numType:'jodi_bulk'},
  {id:'sp_dp_tp',          label:'SP DP TP',           icon:'sp_dp_tp',     desc:'SP/DP/TP combo',            win:'150×',numType:'pana'},
  {id:'two_digit_pana',    label:'TWO DIGIT PANA',     icon:'two_digit_pana',desc:'2-digit + pana combo',    win:'300×',numType:'sangam'},
  {id:'digit_jodi',        label:'DIGIT JODI',         icon:'digit_jodi',   desc:'Jodis on open/close side', win:'95', numType:'jodi_bulk'},
  {id:'sp_common',         label:'SP COMMON',          icon:'sp_common',    desc:'Single pana common',        win:'150×',numType:'pana_bulk'},
  {id:'dp_common',         label:'DP COMMON',          icon:'dp_common',    desc:'Double pana common',        win:'300×',numType:'pana_bulk'},
];

// ── GAMES ──
export const GAMES = [
  {id:1,name:'Kalyan Morning',   icon:'☀️', time:'10:00 AM – 11:00 AM', open:true,  result:'2-56-8'},
  {id:2,name:'Milan Day',        icon:'🏙️', time:'01:00 PM – 02:00 PM', open:true,  result:'4-78-3'},
  {id:3,name:'Rajdhani Day',     icon:'👑', time:'03:15 PM – 05:15 PM', open:false, result:'1-29-6'},
  {id:4,name:'Kalyan',           icon:'🎯', time:'04:10 PM – 06:10 PM', open:true,  result:'7-45-2'},
  {id:5,name:'Main Bazar',       icon:'🏪', time:'09:30 PM – 12:00 AM', open:false, result:'3-67-9'},
  {id:6,name:'Milan Night',      icon:'🌙', time:'09:00 PM – 10:00 PM', open:true,  result:'5-12-8'},
  {id:7,name:'Rajdhani Night',   icon:'🌟', time:'09:30 PM – 11:30 PM', open:false, result:'6-34-1'},
  {id:8,name:'Supreme Day',      icon:'💎', time:'02:00 PM – 04:00 PM', open:true,  result:'8-90-7'},
  {id:9,name:'Time Bazar',       icon:'⏰', time:'01:00 PM – 02:00 PM', open:false, result:'0-33-5'},
  {id:10,name:'Madhur Day',      icon:'🎪', time:'11:30 AM – 12:30 PM', open:true,  result:'9-11-2'},
  {id:11,name:'Sridevi',         icon:'🎭', time:'11:30 AM – 12:30 PM', open:false, result:'5-77-4'},
  {id:12,name:'Madhur Night',    icon:'🌌', time:'08:30 PM – 10:30 PM', open:true,  result:'2-44-6'},
];

export const QUICK_GAMES = [
  {id:1, name:'Starline'},
  {id:2, name:'Disawar'},
];

// ── INITIAL BIDS ──
export const INIT_BIDS = [
  {id:1,game:'Kalyan',number:'42',amount:500,type:'JODI DIGIT',status:'win',date:'Today 4:30 PM',winAmt:45000},
  {id:2,game:'Main Bazar',number:'7',amount:200,type:'SINGLE DIGIT',status:'loss',date:'Today 2:00 PM',winAmt:0},
  {id:3,game:'Milan Day',number:'128',amount:1000,type:'SINGLE PANA',status:'pending',date:'Today 1:45 PM',winAmt:0},
  {id:4,game:'Rajdhani Day',number:'55',amount:300,type:'JODI DIGIT',status:'win',date:'Yesterday',winAmt:27000},
];

// ── INITIAL TRANSACTIONS ──
export const INIT_TXNS = [
  {id:1,type:'credit',name:'Add Funds',date:'Today, 10:30 AM',ref:'#MK8291AB',amt:2000,statusTxt:'SUCCESS'},
  {id:2,type:'debit',name:'Bid — Kalyan',date:'Today, 4:25 PM',ref:'#BID7734',amt:500,statusTxt:'PENDING'},
  {id:3,type:'credit',name:'Win — Kalyan',date:'Today, 4:31 PM',ref:'#WIN4521',amt:45000,statusTxt:'SUCCESS'},
  {id:4,type:'debit',name:'Withdrawal',date:'Yesterday',ref:'#WD9981',amt:5000,statusTxt:'PENDING'},
  {id:5,type:'debit',name:'Bid — Main Bazar',date:'Yesterday',ref:'#BID4422',amt:200,statusTxt:'SUCCESS'},
];

// ── PANA LISTS ──
export const SINGLE_PANAS = ['127','136','145','190','235','280','370','389','460','479','569','578','128','137','146','236','245','290','380','470','489','560','579','678','129','138','147','156','237','246','345','390','480','570','589','679','120','139','148','157','238','247','256','346','490','580','670','689','130','149','158','167','239','248','257','347','356','590','680','789','140','159','168','230','249','258','267','348','357','456','690','780','123','150','169','178','240','259','268','349','358','367','457','790','124','160','278','179','250','269','340','359','368','458','467','890','125','134','170','189','260','279','350','369','468','378','459','567','126','135','180','234','270','289','360','379','450','469','478','568'];
export const DOUBLE_PANAS = ['118','226','244','299','334','488','550','668','677','100','119','155','227','335','344','399','588','669','110','200','228','255','336','499','660','688','778','166','229','300','337','355','445','599','779','788','112','220','266','338','400','446','455','699','770','113','122','177','339','366','447','500','799','889','555','600','114','277','330','448','466','556','880','899','115','133','188','223','377','449','557','566','700','116','224','233','288','440','477','558','800','990','117','144','199','225','388','559','577','667','900'];
export const TRIPLE_PANAS = ['000','111','222','333','444','555','666','777','888','999'];

// ── MARQUEE TEXT ──
export const MARQUEE_TEXT = 'Welcome To World Best Online Matka Play App - Play Win and Enjoy!';