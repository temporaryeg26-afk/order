/**
 * TEMPORARY™ — CANONICAL BACKEND (Google Apps Script)  ·  v12.0
 *
 *   GOOGLE SHEET  = database / single source of truth
 *   THIS SCRIPT   = authority: API · auth · validation · business rules · audit · sync
 *   WEBSITE/ADMIN = clients only (no product / price / placement / theme database of their own)
 *
 * INSTALL (one time)
 *   1. Back up the Apps Script project and the Sheet.
 *   2. Delete EVERY existing .gs file in the project. Add ONLY these two files:
 *        TEMPORARY_GS_CANONICAL.gs   (this file — all logic, the only doGet/doPost)
 *        TEMPORARY_SEED_CONTENT.gs   (website text registry, policies, product spec templates)
 *   3. Run TEMPORARY_SETUP()   → non-destructive: adds missing sheets/columns, migrates legacy CONFIG JSON,
 *                                 moves inventory ledger to DESIGN_INVENTORY, installs triggers, rebuilds SYNC_MAP,
 *                                 copies every missing website text into SITE_CONTENT, adds the 4 policies to
 *                                 POLICIES / POLICY_SECTIONS, and fills material / care / size chart for products
 *                                 that match a spec template (prices are never touched).
 *   4. Run TEMPORARY_VERIFY()  → read-only contract check. Must print STATUS: PASS.
 *   5. Deploy ▸ Manage deployments ▸ edit the EXISTING web app ▸ New version (keeps the same /exec URL).
 *
 * RULES ENFORCED HERE
 *   - Exactly one doGet() and one doPost().
 *   - Every column is read by header name (column order in the Sheet never matters).
 *   - Prices, delivery fees, stock, placements and totals are always computed here, never trusted from a client.
 *   - Every admin write: authenticate → validate → write → flush → audit (old/new) → bump SITE_REVISION → return canonical.
 *   - Response envelope: { ok:true, data:{…}, revision } or { ok:false, errorCode, errorMessage }.
 */

/* =====================================================================
 * 00. SCHEMA REGISTRY  (required columns; extra legacy columns are tolerated, never deleted)
 * ===================================================================== */
var SCHEMA = {
  CONFIG: ['KEY','VALUE','DESCRIPTION','UPDATED_AT'],
  PRODUCTS: ['PRODUCT_ID','PRODUCT_CODE','PRODUCT_NAME','PRODUCT_NAME_AR','PRODUCT_TYPE','CATEGORY','DESCRIPTION','DESCRIPTION_AR','MATERIAL','FIT','GSM','CONSTRUCTION','CARE_EN','CARE_AR','PRICE','CURRENCY','SIZES','COLORS','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT',
    'TAGLINE','TAGLINE_AR','MATERIAL_AR','LINING','LINING_AR','FIT_AR','FIT_NOTE','FIT_NOTE_AR','CONSTRUCTION_AR','CARE_ICONS','FABRIC_IMAGE_URL','SIZE_CHART_TYPE','SPEC_TEMPLATE'],
  PRODUCT_ASSETS: ['ASSET_ID','PRODUCT_ID','COLOR','ASSET_TYPE','ASSET_PATH','ASSET_URL','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT'],
  PRODUCT_SIZES: ['SIZE_ID','PRODUCT_ID','SIZE_LABEL','WIDTH_CM','LENGTH_CM','AVG_WEIGHT_MIN_KG','AVG_WEIGHT_MAX_KG','AGE_MIN_YEARS','AGE_MAX_YEARS','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT'],
  DESIGNS: ['DESIGN_ID','DESIGN_CODE','DESIGN_NAME','DESIGN_NAME_AR','DESCRIPTION','DESCRIPTION_AR','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT'],
  DESIGN_ASSETS: ['ASSET_ID','DESIGN_ID','SIDE','ASSET_TYPE','ASSET_PATH','ASSET_URL','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT'],
  DESIGN_INVENTORY: ['DESIGN_ID','DESIGN_NAME','PRODUCTION_LIMIT','SOLD','RESERVED','REMAINING','STATUS','MANUAL_SOLD_OUT','UPDATED_AT'],
  PLACEMENTS: ['PLACEMENT_ID','PRODUCT_ID','DESIGN_ID','COLOR','ARTWORK_TYPE','SIDE','PRINT_SIZE','PRINT_WIDTH_CM','PRINT_HEIGHT_CM','WIDTH','HEIGHT','TOP','LEFT','ROTATION','OPACITY','ACTIVE','UPDATED_AT','NOTES'],
  COLLECTION_MOCKUP_PLACEMENTS: ['PLACEMENT_ID','PRODUCT_ID','PRODUCT_NAME','COLOR','THEME_ID','WIDTH','HEIGHT','TOP','LEFT','ROTATION','OPACITY','ACTIVE','WEBSITE_PREVIEW','UPDATED_AT','NOTES'],
  THEMES: ['ID','NAME','NAME_AR','ENABLED','DISPLAY_ORDER','IS_DEFAULT','LABEL','TITLE','TITLE_AR','SUB','SUB_AR','MODE','HERO_IMAGE_URL','FRAME_IMAGE_URL','UPDATED_AT'],
  SITE_CONTENT: ['KEY','SECTION','EN','AR','TYPE','UPDATED_AT','PAGE','GROUP','LABEL','DISPLAY_ORDER'],
  POLICIES: ['POLICY_ID','SLUG','TITLE_EN','TITLE_AR','SUBTITLE_EN','SUBTITLE_AR','EFFECTIVE_DATE_EN','EFFECTIVE_DATE_AR','INTRO_EN','INTRO_AR','CLOSING_EN','CLOSING_AR','VERSION','ACTIVE','DISPLAY_ORDER','CREATED_AT','UPDATED_AT'],
  POLICY_SECTIONS: ['SECTION_ID','POLICY_ID','NUMBER','TITLE_EN','TITLE_AR','BODY_EN','BODY_AR','ACTIVE','DISPLAY_ORDER','UPDATED_AT'],
  AUTHENTICITY: ['CARD_ID','CREATED_AT','ORDER_NUMBER','OWNER_NAME','TIER','SERIAL_NUMBER','CARD_CODE','QR_LINK','ITEMS','CARD_IMAGE_URL','STATUS','SCANS','LAST_SCAN_AT','ORDER_ID','CUSTOMER_ID','NOTES','UPDATED_AT','ITEM_IDS'],
  INQUIRIES: ['INQUIRY_ID','CREATED_AT','STATUS','NAME','EMAIL','PHONE','TOPIC','ORDER_NUMBER','MESSAGE','LANG','CUSTOMER_ID','ADMIN_NOTE','UPDATED_AT'],
  CONFIRMATION_MESSAGE: ['ID','ACTIVE','TITLE_EN','TITLE_AR','BODY_EN','BODY_AR','ACTION_EN','ACTION_AR','NOTE_EN','NOTE_AR','UPDATED_AT'],
  DELIVERY_ZONES: ['ZONE_ID','GOVERNORATE','AREA','DELIVERY_FEE','ESTIMATED_DAYS','ACTIVE','CREATED_AT','UPDATED_AT'],
  CUSTOMERS: ['CUSTOMER_ID','GOOGLE_SUB','EMAIL','FULL_NAME','PHONE','DATE_OF_BIRTH','DELIVERY_GOVERNORATE','DELIVERY_AREA','DELIVERY_ADDRESS','CREATED_AT','UPDATED_AT','LAST_LOGIN_AT','SERIAL_NUMBER','MARKETING_OPT_IN','OPT_IN_AT'],
  CUSTOMER_SESSIONS: ['SESSION_ID','CUSTOMER_ID','SESSION_TOKEN_HASH','DEVICE_ID','EXPIRES_AT','LAST_SEEN_AT','REVOKED_AT','CREATED_AT','UPDATED_AT'],
  CARTS: ['CART_ID','CUSTOMER_ID','SESSION_ID','EMAIL','STATUS','ITEM_COUNT','SUBTOTAL','CURRENCY','LAST_ACTIVE_AT','CREATED_AT','UPDATED_AT'],
  CART_ITEMS: ['CART_ITEM_ID','CART_ID','PRODUCT_ID','PRODUCT_NAME','DESIGN_ID','DESIGN_NAME','COLOR','SIZE','SIDE','PRINT_SIZE','QUANTITY','UNIT_PRICE','LINE_TOTAL','DESIGN_ASSET_URL','MOCKUP_PREVIEW_URL','CREATED_AT','UPDATED_AT'],
  ORDERS: ['ORDER_ID','ORDER_NUMBER','CUSTOMER_ID','CUSTOMER_NAME','EMAIL','PHONE','ORDER_STATUS','TOTAL','CURRENCY','DELIVERY_ZONE_ID','DELIVERY_FEE','PAYMENT_METHOD','PAYMENT_STATUS','DATE_OF_BIRTH','DELIVERY_GOVERNORATE','DELIVERY_AREA','DELIVERY_ADDRESS','CREATED_AT','UPDATED_AT','CONFIRMED_AT','PROCESSING_AT','SHIPPED_AT','DELIVERED_AT','CANCELED_AT'],
  ORDER_ITEMS: ['ORDER_ITEM_ID','ORDER_ID','PRODUCT_ID','PRODUCT_NAME','DESIGN_ID','DESIGN_NAME','COLOR','SIZE','QUANTITY','UNIT_PRICE','LINE_TOTAL','DESIGN_SIDE','DESIGN_PRINT_SIZE','LOGO_SIDE','LOGO_SIZE_CM','VISUAL_WIDTH','VISUAL_HEIGHT','VISUAL_TOP','VISUAL_LEFT','VISUAL_ROTATION','VISUAL_OPACITY','LOGO_WIDTH','LOGO_TOP','LOGO_LEFT','LOGO_ROTATION','LOGO_OPACITY','MOCKUP_PREVIEW_URL','CREATED_AT','UPDATED_AT'],
  PAYMENTS: ['PAYMENT_ID','ORDER_ID','CUSTOMER_ID','PROVIDER','PAYMENT_METHOD','AMOUNT','CURRENCY','PAYMENT_STATUS','PROVIDER_TRANSACTION_ID','CREATED_AT','UPDATED_AT','PAID_AT'],
  ORDER_CONFIRMATIONS: ['CONFIRMATION_ID','ORDER_ID','CUSTOMER_ID','EXPIRES_AT','STATUS','CONFIRMED_AT','CONFIRMATION_METHOD','CREATED_AT','UPDATED_AT'],
  ADMIN_USERS: ['ADMIN_ID','EMAIL','DISPLAY_NAME','ROLE','ACTIVE','CREATED_AT','UPDATED_AT'],
  ADMIN_SESSIONS: ['SESSION_ID','ADMIN_ID','SESSION_TOKEN_HASH','DEVICE_ID','EXPIRES_AT','LAST_SEEN_AT','REVOKED_AT','CREATED_AT','UPDATED_AT'],
  ANALYTICS_EVENTS: ['EVENT_ID','TYPE','CUSTOMER_ID','SESSION_ID','DEVICE','PRODUCT_ID','DESIGN_ID','COLOR','SIZE','VALUE','CREATED_AT'],
  EMAIL_LOG: ['ORDER_ID','TYPE','RECIPIENT','STATUS','ATTEMPTS','ERROR','SENT_AT'],
  AUDIT_LOG: ['AUDIT_ID','ACTOR_TYPE','ACTOR_ID','ACTION','ENTITY_TYPE','ENTITY_ID','DETAILS','OLD_VALUE','NEW_VALUE','CREATED_AT'],
  SYNC_MAP: ['ENTITY','SOURCE_SHEET','SOURCE_KEY','TARGET','STATUS','NOTES','UPDATED_AT']
};

/* Ownership map — every piece of data has exactly one owner (written to SYNC_MAP by setup). */
var OWNERSHIP = [
  ['Product name / price / active / material / care / fit','PRODUCTS','PRODUCT_ID','Website catalog + product page · Admin Products · Checkout pricing'],
  ['Product images + available colors','PRODUCT_ASSETS','ASSET_ID','Website collection/customizer · Admin'],
  ['Available sizes + size chart','PRODUCT_SIZES','SIZE_ID','Website size chart/customizer · Checkout validation'],
  ['Design identity','DESIGNS','DESIGN_ID','Website · Admin'],
  ['Design artwork files','DESIGN_ASSETS','ASSET_ID','Website customizer · Admin studio'],
  ['Production limit / sold / reserved / remaining','DESIGN_INVENTORY','DESIGN_ID','Website availability · Checkout stock check · Admin'],
  ['Artwork + logo geometry','PLACEMENTS','PLACEMENT_ID','Website customizer · Admin Placement Studio · Order snapshot'],
  ['Collection view geometry','COLLECTION_MOCKUP_PLACEMENTS','PLACEMENT_ID','Website collection · Admin Collection Mockup'],
  ['Themes (enabled / default / copy / images)','THEMES','ID','Website theme runtime · Admin Themes'],
  ['Every website text EN/AR + contact details','SITE_CONTENT','KEY','Website (all pages) · Admin ▸ Website Pages'],
  ['Policies (header + intro + closing)','POLICIES','POLICY_ID','Website policy pages · Admin ▸ Policies'],
  ['Policy sections','POLICY_SECTIONS','SECTION_ID','Website policy pages · Admin ▸ Policies'],
  ['Customer inquiries (contact form)','INQUIRIES','INQUIRY_ID','Admin ▸ Inquiries'],
  ['Customer serial number (permanent, random)','CUSTOMERS','SERIAL_NUMBER','AUTHENTICITY rows · Website Verify page'],
  ['Authenticity cards (one per confirmed order)','AUTHENTICITY','CARD_ID','Website #/card/<code> and #/verify/<serial> · Admin ▸ Authenticity'],
  ['Order-received message','CONFIRMATION_MESSAGE','ID','Website success screen · Admin'],
  ['Global configuration + SITE_REVISION','CONFIG','KEY','All'],
  ['Delivery fees','DELIVERY_ZONES','ZONE_ID','Website checkout · Checkout total'],
  ['Customers','CUSTOMERS','CUSTOMER_ID','Auth · Checkout · Admin'],
  ['Carts','CARTS / CART_ITEMS','CART_ID','Website bag (all devices)'],
  ['Orders / lines','ORDERS / ORDER_ITEMS','ORDER_ID','Website account · Admin Orders · Analytics'],
  ['Payment state','PAYMENTS','PAYMENT_ID','Admin Orders (ORDERS.PAYMENT_STATUS is a mirror)'],
  ['Order confirmation lifecycle','ORDER_CONFIRMATIONS','ORDER_ID','Confirmation page · Inventory reservation'],
  ['Analytics events','ANALYTICS_EVENTS','EVENT_ID','Admin Analytics'],
  ['Admin identities','ADMIN_USERS','ADMIN_ID','Admin auth'],
  ['Audit trail','AUDIT_LOG','AUDIT_ID','Admin Audit']
];

var CONFIG_DEFAULTS = [
  ['BRAND_NAME','TEMPORARY™','Brand name'],
  ['CURRENCY','EGP','Store currency'],
  ['STORE_MODE','OPEN','OPEN | CLOSED'],
  ['COD_ENABLED','FALSE','Cash on delivery available'],
  ['GOOGLE_CLIENT_ID','32171492706-n6rli6equ2e0es8ac15npdcrhctlq2bn.apps.googleusercontent.com','Google Identity client ID'],
  ['SESSION_HOURS','720','Customer session lifetime (rolling, hours)'],
  ['ADMIN_SESSION_HOURS','12','Admin session lifetime (hours)'],
  ['CONFIRMATION_HOURS','1','Order confirmation window (hours)'],
  ['ORDER_CONFIRMATION_EMAIL_ENABLED','TRUE','Send customer confirmation email'],
  ['ADMIN_NOTIFICATION_EMAILS','','Comma-separated admin recipients (max 2)'],
  ['ADMIN_NEW_ORDER_NOTIFICATIONS','TRUE','Email admins on new order'],
  ['ALLOWED_ASSET_ORIGINS','https://raw.githubusercontent.com/temporaryeg26-afk/order/main/','Comma-separated allowed asset URL prefixes'],
  ['ALLOWED_PARENT_ORIGINS','https://temporaryeg26-afk.github.io','Comma-separated origins allowed to use the secure bridge'],
  ['CUSTOMER_SITE_URL','https://temporaryeg26-afk.github.io/order/','Customer website URL (Admin preview + emails)'],
  ['CONFIRMATION_PAGE_URL','https://temporaryeg26-afk.github.io/order/#confirmorder','Customer confirmation page'],
  ['LOGO_ASSET_URL','https://raw.githubusercontent.com/temporaryeg26-afk/order/main/designs/front%20logo.png','TEMPORARY™ logo artwork URL'],
  ['LOGO_PRINT_CM','7','Logo print size (cm)'],
  ['MAX_QTY_PER_LINE','20','Max quantity per cart line'],
  ['MAX_CART_QTY','50','Max pieces per cart'],
  ['SITE_REVISION','1','Live-sync revision. Bumped by every admin write.'],
  ['SITE_LOGIN_REQUIRED','FALSE','TRUE = visitors must sign in with Google before seeing the shop · FALSE = open website (sign-in only to buy)'],
  ['NEW_CUSTOMER_TIER','FOUNDER','Tier given to a customer on their first authenticity card: FOUNDER | MEMBER | CUSTOMER'],
  ['AUTH_SCAN_WARNING','40','A card checked more than this many times shows a "may be copied" warning'],
  ['PAYMOB_ENABLED','FALSE','TRUE = customers pay online through Paymob (card / wallet)'],
  ['PAYMOB_MODE','TEST','TEST | LIVE'],
  ['PAYMOB_PUBLIC_KEY_TEST','','Paymob public key (test)'],['PAYMOB_PUBLIC_KEY_LIVE','','Paymob public key (live)'],
  ['PAYMOB_CARD_INTEGRATION_TEST','','Paymob card integration ID (test)'],['PAYMOB_CARD_INTEGRATION_LIVE','','Paymob card integration ID (live)'],
  ['PAYMOB_WALLET_INTEGRATION_TEST','','Paymob wallet integration ID (test)'],['PAYMOB_WALLET_INTEGRATION_LIVE','','Paymob wallet integration ID (live)'],
  ['PAYMOB_PAYMENT_MINUTES','60','Minutes a customer has to finish paying before the order is cancelled'],
  ['SHOW_PIECES_LEFT','TRUE','Show "pieces left" on the website'],
  ['PIECES_LEFT_MAX','0','Show pieces left only when this many or fewer remain (0 = always)'],
  ['DROP_NAME','DROP 01','Drop name shown on the website (EN)'],['DROP_NAME_AR','دروب 01','Drop name shown on the website (AR)'],
  ['META_PIXEL_ID','','Meta (Facebook / Instagram) Pixel ID — empty = off'],
  ['DELIVERY_WORKING_DAYS','8','Delivery time in working days (Friday & Saturday off)'],
  ['API_EXEC_URL','https://script.google.com/macros/s/AKfycbx5InYO32kfhcCo34Me8AfCK3mZhaSsJABXL0dElh_kZT-dZKICpMxhXSUmWL9jsAiK/exec','Live web app /exec URL (used for Paymob payment notifications)']
];

var STATUS_FLOW = {
  PENDING:['CONFIRMED','CANCELED'], CONFIRMED:['PROCESSING','CANCELED'],
  PROCESSING:['READY_FOR_DELIVERY','SHIPPED','CANCELED'], READY_FOR_DELIVERY:['OUT_FOR_DELIVERY','CANCELED'],
  OUT_FOR_DELIVERY:['DELIVERED','CANCELED'], SHIPPED:['DELIVERED'], DELIVERED:[], CANCELED:[]
};
var REVENUE_STATUSES = ['CONFIRMED','PROCESSING','READY_FOR_DELIVERY','OUT_FOR_DELIVERY','SHIPPED','DELIVERED'];
var PAYMENT_STATUSES = ['PENDING','PAID','FAILED','EXPIRED','REFUNDED'];
var ROLES = ['OWNER','ADMIN','OPERATIONS','PRODUCTION','SUPPORT','VIEWER'];
var PERMS = {
  READ: ROLES,
  ORDER_STATUS: ['OWNER','ADMIN','OPERATIONS','SUPPORT'],
  PAYMENT_WRITE: ['OWNER','ADMIN','OPERATIONS'],
  CATALOG_WRITE: ['OWNER','ADMIN','PRODUCTION'],
  STORE_CONTROL: ['OWNER','ADMIN','OPERATIONS'],
  CONTENT_WRITE: ['OWNER','ADMIN'],
  NOTIFICATION_WRITE: ['OWNER','ADMIN','OPERATIONS'],
  ADMIN_USER_WRITE: ['OWNER']
};
var ANALYTICS_TYPES = ['PAGE_VIEW','PRODUCT_VIEW','CUSTOMIZE_START','DESIGN_SELECTED','ADD_TO_CART','REMOVE_FROM_CART','CHECKOUT_STARTED','CHECKOUT_COMPLETED','PAYMENT_STARTED','PURCHASE'];

/* =====================================================================
 * 01. SMALL HELPERS
 * ===================================================================== */
function s_(v){ return v==null ? '' : String(v).trim(); }
function up_(v){ return s_(v).toUpperCase(); }
function lo_(v){ return s_(v).toLowerCase(); }
function num_(v,fb){ if(v===''||v==null) return fb; var n=Number(v); return isFinite(n)?n:fb; }
function money_(v){ var n=Number(v); if(!isFinite(n)) throw err_('MONEY_VALUE_INVALID','Invalid amount.'); return Math.round(n*100)/100; }
function bool_(v,fb){
  if(v===true||v===false) return v;
  var x=up_(v);
  if(['TRUE','1','YES','ON','ACTIVE','ENABLED'].indexOf(x)>-1) return true;
  if(['FALSE','0','NO','OFF','INACTIVE','DISABLED'].indexOf(x)>-1) return false;
  return fb;
}
function on_(r,col){ return bool_(r[col||'ACTIVE'],true); }
function now_(){ return new Date(); }
function ms_(v){ if(!v) return 0; var d=v instanceof Date?v:new Date(v); var t=d.getTime(); return isNaN(t)?0:t; }
function iso_(v){ var t=ms_(v); return t?new Date(t).toISOString():''; }
function uuid_(p){ return p+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,14).toUpperCase(); }
function byOrder_(a,b){ return num_(a.DISPLAY_ORDER,999)-num_(b.DISPLAY_ORDER,999); }
function uniqueCI_(arr){ var seen={},out=[]; arr.forEach(function(x){ var k=lo_(x); if(k&&!seen[k]){seen[k]=1;out.push(s_(x));} }); return out; }
function list_(v){
  if(Array.isArray(v)) return v.map(s_).filter(String);
  var t=s_(v); if(!t) return [];
  if(t.indexOf(',')>-1) return t.split(',').map(s_).filter(String);
  t=t.replace(/\bHunter\s+Green\b/ig,'Hunter_Green').replace(/(\d+)\s+YRS/ig,'$1_YRS');
  return t.split(/\s+/).map(function(x){return x.replace(/_/g,' ');}).filter(String);
}
function str_(v){ if(v==null) return ''; if(v instanceof Date) return v.toISOString(); return String(v); }
/* Free text written to the Sheet is prefixed with ' so Sheets never turns it into a number, date or formula
   (keeps leading zeros in phone numbers, "October 2026", lines starting with "-", etc.). */
function T_(v){ var t=v==null?'':String(v); return t===''?'':"'"+t; }
function normName_(v){ return lo_(v).replace(/[^a-z0-9]/g,''); }
function plain_(row){ var o={}; Object.keys(row||{}).forEach(function(k){ if(k==='_row')return; var v=row[k]; o[k]=v instanceof Date?v.toISOString():v; }); return o; }
function hash_(v){ return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(v),Utilities.Charset.UTF_8).map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join(''); }
function safeEq_(a,b){ a=String(a); b=String(b); if(a.length!==b.length) return false; var m=0; for(var i=0;i<a.length;i++) m|=a.charCodeAt(i)^b.charCodeAt(i); return m===0; }
function token_(){ return hash_(Utilities.getUuid()+Utilities.getUuid()+Date.now())+hash_(Utilities.getUuid()).slice(0,32); }
function email_(v){ var e=lo_(v); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)||e.length>254) throw err_('EMAIL_INVALID','Enter a valid email address.'); return e; }
function phone_(v){ var p=s_(v).replace(/[^\d+]/g,''); if(!/^\+?\d{8,15}$/.test(p)) throw err_('PHONE_INVALID','Enter a valid phone number.'); return p; }
function req_(v,code,max){ var t=s_(v); if(!t) throw err_(code||'FIELD_REQUIRED','A required field is missing.'); if(max&&t.length>max) throw err_('TEXT_TOO_LONG','Text is too long.'); return t; }
function clamp_(v,min,max,code){ var n=Number(v); if(!isFinite(n)||n<min||n>max) throw err_(code||'NUMBER_OUT_OF_RANGE','Value out of range ('+min+'–'+max+').'); return n; }

/* Errors carry a stable code + human message. */
function err_(code,message){ var e=new Error(code); e.code=code; e.human=message||''; return e; }
function errCode_(e){
  if(e&&e.code) return e.code;
  var raw=s_(e&&e.message?e.message:e).split(':')[0];
  return /^[A-Z][A-Z0-9_]{2,80}$/.test(raw)?raw:'INTERNAL_ERROR';
}
function errMessage_(e){
  if(e&&e.human) return e.human;
  var code=errCode_(e);
  var map={INTERNAL_ERROR:'Something went wrong. Please try again.',AUTH_REQUIRED:'Please sign in.',SESSION_INVALID:'Your session has ended. Please sign in again.',SESSION_EXPIRED:'Your session has expired. Please sign in again.',ADMIN_AUTH_REQUIRED:'Admin sign-in required.',ADMIN_SESSION_INVALID:'Admin session ended. Please sign in again.'};
  return map[code]||code.replace(/_/g,' ').toLowerCase().replace(/^\w/,function(c){return c.toUpperCase();})+'.';
}

/* =====================================================================
 * 02. DATABASE LAYER (header-addressed, per-execution memo)
 * ===================================================================== */
var MEMO = {};
function db_(){ var ss=SpreadsheetApp.getActiveSpreadsheet(); if(!ss) throw err_('DATABASE_NOT_AVAILABLE','Script must be bound to the TEMPORARY™ Sheet.'); return ss; }
function sh_(name){ var s=db_().getSheetByName(name); if(!s) throw err_('SHEET_NOT_FOUND','Missing sheet: '+name+'. Run TEMPORARY_SETUP().'); return s; }
function table_(name){
  if(MEMO[name]) return MEMO[name];
  var s=sh_(name), lr=s.getLastRow(), lc=s.getLastColumn();
  var vals=(lr&&lc)?s.getRange(1,1,lr,lc).getValues():[[]];
  var headers=vals[0].map(function(h){return s_(h);}), idx={};
  headers.forEach(function(h,i){ if(h&&idx[h]===undefined) idx[h]=i; });
  var rows=[];
  for(var r=1;r<vals.length;r++){
    var row=vals[r]; if(row.every(function(v){return v===''||v===null;})) continue;
    var o={_row:r+1}; Object.keys(idx).forEach(function(h){ o[h]=row[idx[h]]; }); rows.push(o);
  }
  return (MEMO[name]={sheet:s,headers:headers,idx:idx,rows:rows});
}
function rows_(name){ return table_(name).rows; }
function forget_(name){ delete MEMO[name]; }
function find_(name,col,val){ var v=lo_(val); if(!v) return null; var r=rows_(name); for(var i=0;i<r.length;i++){ if(lo_(r[i][col])===v) return r[i]; } return null; }
function where_(name,col,val){ var v=lo_(val); return rows_(name).filter(function(r){return lo_(r[col])===v;}); }
function insertMany_(name,list){
  if(!list.length) return list;
  var t=table_(name), h=t.headers;
  var vals=list.map(function(o){ return h.map(function(k){ return k&&Object.prototype.hasOwnProperty.call(o,k)&&o[k]!==undefined?o[k]:''; }); });
  t.sheet.getRange(t.sheet.getLastRow()+1,1,vals.length,h.length).setValues(vals);
  forget_(name); return list;
}
function insert_(name,obj){ insertMany_(name,[obj]); return obj; }
function patch_(name,rowNum,patch){
  var t=table_(name), range=t.sheet.getRange(rowNum,1,1,t.headers.length), cur=range.getValues()[0];
  t.headers.forEach(function(h,i){ if(h&&Object.prototype.hasOwnProperty.call(patch,h)&&patch[h]!==undefined) cur[i]=patch[h]; });
  range.setValues([cur]); forget_(name);
}
function deleteRows_(name,rowNums){ var s=sh_(name); rowNums.slice().sort(function(a,b){return b-a;}).forEach(function(r){ if(r>1&&r<=s.getLastRow()) s.deleteRow(r); }); forget_(name); }

/* =====================================================================
 * 03. CONFIG, LOCK, REVISION, CACHE
 * ===================================================================== */
function cfg_(k,fb){ var r=find_('CONFIG','KEY',k); if(!r||s_(r.VALUE)==='') return fb===undefined?'':fb; return r.VALUE; }
function cfgBool_(k,fb){ return bool_(cfg_(k,''),fb); }
function cfgNum_(k,fb){ return num_(cfg_(k,''),fb); }
function setCfg_(k,v,desc){
  var r=find_('CONFIG','KEY',k), t=now_();
  if(r) patch_('CONFIG',r._row,{VALUE:v,UPDATED_AT:t,DESCRIPTION:desc||r.DESCRIPTION});
  else insert_('CONFIG',{KEY:k,VALUE:v,DESCRIPTION:desc||'',UPDATED_AT:t});
}
var IN_LOCK=false;
function withLock_(fn){
  if(IN_LOCK) return fn();
  var l=LockService.getScriptLock();
  if(!l.tryLock(28000)) throw err_('SYSTEM_BUSY_RETRY','The system is busy. Please try again in a moment.');
  IN_LOCK=true;
  try{ return fn(); } finally{ IN_LOCK=false; l.releaseLock(); }
}
function revision_(){
  var c=CacheService.getScriptCache(), hit=c.get('TEMP_SITE_REVISION');
  if(hit) return Number(hit);
  var n=Math.max(1,Math.floor(cfgNum_('SITE_REVISION',1)));
  c.put('TEMP_SITE_REVISION',String(n),300); return n;
}
function bumpRevision_(){
  var n=Math.max(1,Math.floor(cfgNum_('SITE_REVISION',1)))+1;
  setCfg_('SITE_REVISION',String(n),'Live-sync revision. Bumped by every admin write.');
  CacheService.getScriptCache().put('TEMP_SITE_REVISION',String(n),300);
  return n;
}
function cachePutBig_(key,str){
  var c=CacheService.getScriptCache(), size=25000, n=Math.ceil(str.length/size), map={};
  for(var i=0;i<n;i++) map[key+'_'+i]=str.substr(i*size,size);
  map[key+'_n']=String(n);
  try{ c.putAll(map,600); }catch(_){}
}
function cacheGetBig_(key){
  var c=CacheService.getScriptCache(), n=Number(c.get(key+'_n')||0); if(!n) return null;
  var keys=[]; for(var i=0;i<n;i++) keys.push(key+'_'+i);
  var got=c.getAll(keys), out='';
  for(var j=0;j<n;j++){ if(got[keys[j]]==null) return null; out+=got[keys[j]]; }
  return out;
}
function audit_(actorType,actorId,action,entityType,entityId,oldV,newV,details){
  function j(v){ if(v==null||v==='') return ''; var t=typeof v==='string'?v:JSON.stringify(v); return t.length>4500?t.slice(0,4500)+'…':t; }
  try{ insert_('AUDIT_LOG',{AUDIT_ID:uuid_('AUD'),ACTOR_TYPE:up_(actorType),ACTOR_ID:s_(actorId),ACTION:up_(action),ENTITY_TYPE:up_(entityType),ENTITY_ID:s_(entityId),DETAILS:j(details),OLD_VALUE:j(oldV),NEW_VALUE:j(newV),CREATED_AT:now_()}); }catch(e){ console.error('AUDIT_WRITE_FAILED '+e); }
}

/* =====================================================================
 * 04. READ MODELS — CATALOG / PLACEMENTS / CMS / DELIVERY
 * ===================================================================== */
function assetUrl_(r){ var u=s_(r.ASSET_URL); return /^https?:\/\//i.test(u)?u:''; }
function isMockup_(r){ var t=up_(r.ASSET_TYPE); return !t||t==='MOCKUP'||t==='PRODUCT_MOCKUP'; }
function productView_(p,assets,sizes,includeInactive){
  var pid=s_(p.PRODUCT_ID);
  var a=assets.filter(function(x){return s_(x.PRODUCT_ID)===pid&&(includeInactive||on_(x));}).sort(byOrder_).map(function(x){
    return {assetId:s_(x.ASSET_ID),productId:pid,color:s_(x.COLOR),assetType:up_(x.ASSET_TYPE)||'MOCKUP',assetPath:s_(x.ASSET_PATH),assetUrl:assetUrl_(x),active:on_(x),displayOrder:num_(x.DISPLAY_ORDER,0)};
  });
  var colors=uniqueCI_(a.filter(function(x){return x.active&&x.assetUrl&&(x.assetType==='MOCKUP'||x.assetType==='PRODUCT_MOCKUP')&&x.color;}).map(function(x){return x.color;}));
  if(!colors.length) colors=list_(p.COLORS);
  var sg=sizes.filter(function(x){return s_(x.PRODUCT_ID)===pid&&(includeInactive||on_(x));}).sort(byOrder_).map(function(x){
    return {sizeId:s_(x.SIZE_ID),productId:pid,sizeLabel:s_(x.SIZE_LABEL),widthCm:num_(x.WIDTH_CM,''),lengthCm:num_(x.LENGTH_CM,''),avgWeightMinKg:num_(x.AVG_WEIGHT_MIN_KG,''),avgWeightMaxKg:num_(x.AVG_WEIGHT_MAX_KG,''),ageMinYears:num_(x.AGE_MIN_YEARS,''),ageMaxYears:num_(x.AGE_MAX_YEARS,''),active:on_(x),displayOrder:num_(x.DISPLAY_ORDER,0)};
  });
  var sizeList=sg.filter(function(x){return x.active;}).map(function(x){return x.sizeLabel;});
  if(!sizeList.length) sizeList=list_(p.SIZES);
  return {productId:pid,productCode:s_(p.PRODUCT_CODE),productName:s_(p.PRODUCT_NAME),productNameAr:s_(p.PRODUCT_NAME_AR),productType:up_(p.PRODUCT_TYPE),category:up_(p.CATEGORY),
    description:s_(p.DESCRIPTION),descriptionAr:s_(p.DESCRIPTION_AR),material:s_(p.MATERIAL),fit:s_(p.FIT),gsm:s_(p.GSM),construction:s_(p.CONSTRUCTION),careEn:s_(p.CARE_EN),careAr:s_(p.CARE_AR),
    tagline:s_(p.TAGLINE),taglineAr:s_(p.TAGLINE_AR),materialAr:s_(p.MATERIAL_AR),lining:s_(p.LINING),liningAr:s_(p.LINING_AR),fitAr:s_(p.FIT_AR),fitNote:s_(p.FIT_NOTE),fitNoteAr:s_(p.FIT_NOTE_AR),
    constructionAr:s_(p.CONSTRUCTION_AR),careIcons:s_(p.CARE_ICONS).split(/[\s,]+/).map(up_).filter(String),fabricImageUrl:/^https:\/\//i.test(s_(p.FABRIC_IMAGE_URL))?s_(p.FABRIC_IMAGE_URL):'',
    sizeChartType:up_(p.SIZE_CHART_TYPE),specTemplate:s_(p.SPEC_TEMPLATE),
    price:num_(p.PRICE,0),currency:s_(p.CURRENCY)||s_(cfg_('CURRENCY','EGP')),colors:colors,sizes:sizeList,sizeGuide:sg,assets:a,active:on_(p),displayOrder:num_(p.DISPLAY_ORDER,0),
    createdAt:iso_(p.CREATED_AT),updatedAt:iso_(p.UPDATED_AT)};
}
function inventoryMap_(){
  var m={}; rows_('DESIGN_INVENTORY').forEach(function(r){
    var lim=Math.max(0,num_(r.PRODUCTION_LIMIT,100)), sold=Math.max(0,num_(r.SOLD,0)), res=Math.max(0,num_(r.RESERVED,0)), manual=bool_(r.MANUAL_SOLD_OUT,false);
    var rem=Math.max(0,lim-sold-res);
    m[s_(r.DESIGN_ID)]={productionLimit:lim,sold:sold,reserved:res,remaining:rem,manualSoldOut:manual,status:up_(r.STATUS)||(manual||rem===0?'SOLD_OUT':'ACTIVE'),soldOut:manual||rem===0,updatedAt:iso_(r.UPDATED_AT)};
  }); return m;
}
function designView_(d,dAssets,inv,includeInactive){
  var did=s_(d.DESIGN_ID), i=inv[did]||{productionLimit:100,sold:0,reserved:0,remaining:100,manualSoldOut:false,status:'ACTIVE',soldOut:false};
  var a=dAssets.filter(function(x){return s_(x.DESIGN_ID)===did&&(includeInactive||on_(x));}).sort(byOrder_).map(function(x){
    return {assetId:s_(x.ASSET_ID),designId:did,side:up_(x.SIDE),assetType:up_(x.ASSET_TYPE)||'DESIGN',assetPath:s_(x.ASSET_PATH),assetUrl:assetUrl_(x),active:on_(x),displayOrder:num_(x.DISPLAY_ORDER,0)};
  });
  return {designId:did,designCode:s_(d.DESIGN_CODE),designName:s_(d.DESIGN_NAME),designNameAr:s_(d.DESIGN_NAME_AR),description:s_(d.DESCRIPTION),descriptionAr:s_(d.DESCRIPTION_AR),
    active:on_(d),displayOrder:num_(d.DISPLAY_ORDER,0),assets:a,productionLimit:i.productionLimit,sold:i.sold,reserved:i.reserved,remaining:i.remaining,manualSoldOut:i.manualSoldOut,inventoryStatus:i.status,soldOut:i.soldOut};
}
function catalog_(includeInactive){
  var assets=rows_('PRODUCT_ASSETS'), sizes=rows_('PRODUCT_SIZES'), dAssets=rows_('DESIGN_ASSETS'), inv=inventoryMap_();
  return {
    currency:s_(cfg_('CURRENCY','EGP')),
    products:rows_('PRODUCTS').filter(function(p){return s_(p.PRODUCT_ID)&&(includeInactive||on_(p));}).sort(byOrder_).map(function(p){return productView_(p,assets,sizes,includeInactive);}),
    designs:rows_('DESIGNS').filter(function(d){return s_(d.DESIGN_ID)&&(includeInactive||on_(d));}).sort(byOrder_).map(function(d){return designView_(d,dAssets,inv,includeInactive);}),
    logo:{assetUrl:s_(cfg_('LOGO_ASSET_URL','')),printSizeCm:cfgNum_('LOGO_PRINT_CM',7)}
  };
}
function productById_(pid,includeInactive){ var p=find_('PRODUCTS','PRODUCT_ID',pid); if(!p||(!includeInactive&&!on_(p))) return null; return productView_(p,rows_('PRODUCT_ASSETS'),rows_('PRODUCT_SIZES'),includeInactive); }
function designById_(did,includeInactive){ var d=find_('DESIGNS','DESIGN_ID',did); if(!d||(!includeInactive&&!on_(d))) return null; return designView_(d,rows_('DESIGN_ASSETS'),inventoryMap_(),includeInactive); }
function mockupUrlFor_(product,color){
  var c=lo_(color), m=product.assets.filter(function(a){return a.active&&a.assetUrl&&(a.assetType==='MOCKUP'||a.assetType==='PRODUCT_MOCKUP');});
  var hit=m.filter(function(a){return lo_(a.color)===c;})[0]||m.filter(function(a){return !a.color;})[0]||m[0];
  return hit?hit.assetUrl:'';
}
function designUrlFor_(design,side){
  var a=design.assets.filter(function(x){return x.active&&x.assetUrl;});
  var hit=a.filter(function(x){return x.side===up_(side);})[0]||a.filter(function(x){return !x.side;})[0]||a[0];
  return hit?hit.assetUrl:'';
}
function matchChoice_(value,options,code){ var v=lo_(value); var hit=options.filter(function(o){return lo_(o)===v;})[0]; if(!hit) throw err_(code,'That option is not available.'); return hit; }

function placementKey_(pid,color,type,did,side,size){ return [s_(pid),lo_(color),up_(type),up_(type)==='LOGO'?'':s_(did),up_(side),String(Number(size))].join('|'); }
function placementView_(r){
  var type=up_(r.ARTWORK_TYPE)||(s_(r.DESIGN_ID)?'DESIGN':'LOGO');
  return {placementId:s_(r.PLACEMENT_ID),productId:s_(r.PRODUCT_ID),designId:type==='LOGO'?'':s_(r.DESIGN_ID),color:s_(r.COLOR),artworkType:type,side:up_(r.SIDE),printSize:num_(r.PRINT_SIZE,0),
    width:num_(r.WIDTH,0),height:num_(r.HEIGHT,num_(r.WIDTH,0)),top:num_(r.TOP,50),left:num_(r.LEFT,50),rotation:num_(r.ROTATION,0),opacity:num_(r.OPACITY,1),active:on_(r),updatedAt:iso_(r.UPDATED_AT),notes:s_(r.NOTES)};
}
function placements_(includeInactive){ return rows_('PLACEMENTS').filter(function(r){return s_(r.PRODUCT_ID)&&(includeInactive||on_(r));}).map(placementView_); }
function placementMap_(){ var m={}; placements_(false).forEach(function(p){ var k=placementKey_(p.productId,p.color,p.artworkType,p.designId,p.side,p.printSize); if(!m[k]) m[k]=p; else m[k]._duplicate=true; }); return m; }
function collectionView_(r){
  return {placementId:s_(r.PLACEMENT_ID),productId:s_(r.PRODUCT_ID),productName:s_(r.PRODUCT_NAME),color:s_(r.COLOR),themeId:lo_(r.THEME_ID),width:num_(r.WIDTH,64),height:num_(r.HEIGHT,79),top:num_(r.TOP,50),left:num_(r.LEFT,50),rotation:num_(r.ROTATION,0),opacity:num_(r.OPACITY,1),active:on_(r),websitePreview:bool_(r.WEBSITE_PREVIEW,false),updatedAt:iso_(r.UPDATED_AT),notes:s_(r.NOTES)};
}
function collection_(includeInactive){ return rows_('COLLECTION_MOCKUP_PLACEMENTS').filter(function(r){return s_(r.PRODUCT_ID)&&(includeInactive||on_(r));}).map(collectionView_); }

function themes_(){
  var list=rows_('THEMES').filter(function(r){return s_(r.ID);}).map(function(r){
    return {id:lo_(r.ID),name:s_(r.NAME)||lo_(r.ID),nameAr:s_(r.NAME_AR),enabled:bool_(r.ENABLED,true),order:num_(r.DISPLAY_ORDER,999),isDefault:bool_(r.IS_DEFAULT,false),
      label:s_(r.LABEL),title:s_(r.TITLE),titleAr:s_(r.TITLE_AR),sub:s_(r.SUB),subAr:s_(r.SUB_AR),mode:s_(r.MODE)||'artifact',heroImageUrl:s_(r.HERO_IMAGE_URL),frameImageUrl:s_(r.FRAME_IMAGE_URL)};
  }).sort(function(a,b){return a.order-b.order;});
  var enabled=list.filter(function(t){return t.enabled;});
  var def=enabled.filter(function(t){return t.isDefault;})[0]||enabled[0]||null;
  return {activeTheme:def?def.id:'',themes:list};
}
var CMS_EXCLUDED_SECTIONS=['PRODUCT_NAMES_AR','DESIGN_NAMES_AR'];
function registry_(){ return typeof CONTENT_REGISTRY!=='undefined'?CONTENT_REGISTRY:[]; }
function registryMap_(){ var m={}; registry_().forEach(function(r,i){ m[r[0]]={key:r[0],page:r[1],group:r[2],label:r[3],type:r[4],en:r[5],ar:r[6],order:i+1}; }); return m; }
/* Website text = registry defaults, overridden by every SITE_CONTENT row (the Sheet always wins). */
function content_(){
  var en={},ar={},sections={},reg=registryMap_();
  Object.keys(reg).forEach(function(k){ var r=reg[k]; if(r.en!=='') en[k]=r.en; if(r.ar!=='') ar[k]=r.ar; sections[k]=r.page; });
  rows_('SITE_CONTENT').forEach(function(r){
    var k=s_(r.KEY), sec=up_(r.SECTION)||'CONTENT'; if(!k||CMS_EXCLUDED_SECTIONS.indexOf(sec)>-1) return;
    var e=str_(r.EN), a=str_(r.AR); if(e!=='') en[k]=e; else delete en[k]; if(a!=='') ar[k]=a; else delete ar[k];
    sections[k]=up_(r.PAGE)||(reg[k]?reg[k].page:sec);
  });
  return {en:en,ar:ar,sections:sections};
}
/* Admin ▸ Website Pages model: every registry field with its live value, plus any extra keys found in the Sheet. */
function pagesModel_(){
  var sheet={}, reg=registryMap_(), fields=[];
  rows_('SITE_CONTENT').forEach(function(r){ var k=s_(r.KEY); if(k&&CMS_EXCLUDED_SECTIONS.indexOf(up_(r.SECTION))<0) sheet[k]=r; });
  registry_().forEach(function(r,i){ var row=sheet[r[0]];
    fields.push({key:r[0],page:r[1],group:r[2],label:r[3],type:r[4],en:row?str_(row.EN):r[5],ar:row?str_(row.AR):r[6],defaultEn:r[5],defaultAr:r[6],inSheet:!!row,order:i+1}); });
  var legacy=/^(aboutBody|contactBody|privacyPolicyBody|refundPolicyBody|shippingPolicyBody|termsBody|aboutTitle_old)$/;
  Object.keys(sheet).forEach(function(k){ if(reg[k]) return; var row=sheet[k];
    fields.push({key:k,page:'OTHER',group:legacy.test(k)?'Old pages (no longer shown)':(up_(row.SECTION)||'Other'),label:k,type:'LONG',en:str_(row.EN),ar:str_(row.AR),defaultEn:'',defaultAr:'',inSheet:true,custom:true,order:9999}); });
  var pages=(typeof CONTENT_PAGES!=='undefined'?CONTENT_PAGES:[]).map(function(p){return {id:p[0],name:p[1]};}); pages.push({id:'OTHER',name:'Other / old keys'});
  return {pages:pages,fields:fields};
}
/* Policies (POLICIES + POLICY_SECTIONS). */
function policies_(includeInactive){
  var secs=rows_('POLICY_SECTIONS');
  return rows_('POLICIES').filter(function(r){return s_(r.POLICY_ID)&&(includeInactive||on_(r));}).sort(byOrder_).map(function(r){
    var pid=s_(r.POLICY_ID);
    return {policyId:pid,slug:lo_(r.SLUG)||lo_(pid),titleEn:s_(r.TITLE_EN),titleAr:s_(r.TITLE_AR),subtitleEn:s_(r.SUBTITLE_EN),subtitleAr:s_(r.SUBTITLE_AR),
      effectiveEn:s_(str_(r.EFFECTIVE_DATE_EN)),effectiveAr:s_(str_(r.EFFECTIVE_DATE_AR)),introEn:s_(r.INTRO_EN),introAr:s_(r.INTRO_AR),closingEn:s_(r.CLOSING_EN),closingAr:s_(r.CLOSING_AR),
      version:num_(r.VERSION,1),active:on_(r),displayOrder:num_(r.DISPLAY_ORDER,0),updatedAt:iso_(r.UPDATED_AT),
      sections:secs.filter(function(x){return s_(x.POLICY_ID)===pid&&(includeInactive||on_(x));}).sort(byOrder_).map(function(x){
        return {sectionId:s_(x.SECTION_ID),number:s_(str_(x.NUMBER)),titleEn:s_(x.TITLE_EN),titleAr:s_(x.TITLE_AR),bodyEn:s_(x.BODY_EN),bodyAr:s_(x.BODY_AR),active:on_(x),displayOrder:num_(x.DISPLAY_ORDER,0)};
      })};
  });
}
function confirmationMessage_(){
  var r=rows_('CONFIRMATION_MESSAGE')[0]; if(!r) return {active:false};
  return {active:bool_(r.ACTIVE,true),titleEn:s_(r.TITLE_EN),titleAr:s_(r.TITLE_AR),bodyEn:s_(r.BODY_EN),bodyAr:s_(r.BODY_AR),actionEn:s_(r.ACTION_EN),actionAr:s_(r.ACTION_AR),noteEn:s_(r.NOTE_EN),noteAr:s_(r.NOTE_AR),updatedAt:iso_(r.UPDATED_AT)};
}
function zoneView_(z){ return {zoneId:s_(z.ZONE_ID),governorate:s_(z.GOVERNORATE),area:s_(z.AREA),deliveryFee:num_(z.DELIVERY_FEE,0),estimatedDays:s_(z.ESTIMATED_DAYS),active:bool_(z.ACTIVE,false)}; }
function deliveryZones_(includeInactive){ return rows_('DELIVERY_ZONES').filter(function(z){return s_(z.ZONE_ID)&&(includeInactive||bool_(z.ACTIVE,false));}).map(zoneView_).sort(function(a,b){return a.governorate.localeCompare(b.governorate)||a.area.localeCompare(b.area);}); }
function deliveryQuote_(gov,area){
  var zones=deliveryZones_(false), g=lo_(gov), a=lo_(area);
  var exact=zones.filter(function(z){return lo_(z.governorate)===g&&lo_(z.area)===a;});
  var wild=zones.filter(function(z){return lo_(z.governorate)===g&&s_(z.area)==='*';});
  var m=exact.length?exact:wild;
  if(m.length>1) throw err_('MULTIPLE_ACTIVE_DELIVERY_ZONES','Delivery zones are misconfigured. Contact support.');
  return m[0]||null;
}
function publicConfig_(){
  return {brandName:s_(cfg_('BRAND_NAME','TEMPORARY™')),currency:s_(cfg_('CURRENCY','EGP')),storeMode:up_(cfg_('STORE_MODE','OPEN')),codEnabled:cfgBool_('COD_ENABLED',true),
    googleClientId:s_(cfg_('GOOGLE_CLIENT_ID','')),confirmationHours:cfgNum_('CONFIRMATION_HOURS',1),logoUrl:s_(cfg_('LOGO_ASSET_URL','')),logoPrintCm:cfgNum_('LOGO_PRINT_CM',7),
    maxQtyPerLine:cfgNum_('MAX_QTY_PER_LINE',20),designPrintSizes:[20,30],loginRequired:cfgBool_('SITE_LOGIN_REQUIRED',false),
    paymentProvider:paymentProvider_(),paymobMode:pmMode_(),walletEnabled:pmIntegrations_().length>1,showPiecesLeft:cfgBool_('SHOW_PIECES_LEFT',true),piecesLeftMax:cfgNum_('PIECES_LEFT_MAX',0),
    dropName:s_(cfg_('DROP_NAME','')),dropNameAr:s_(cfg_('DROP_NAME_AR','')),metaPixelId:s_(cfg_('META_PIXEL_ID','')).replace(/[^0-9]/g,''),deliveryDays:cfgNum_('DELIVERY_WORKING_DAYS',8),paymentMinutes:cfgNum_('PAYMOB_PAYMENT_MINUTES',60)};
}
function siteBundle_(){
  var rev=revision_(), key='TEMP_BUNDLE_'+rev, hit=cacheGetBig_(key);
  if(hit){ try{ return JSON.parse(hit); }catch(_){} }
  var b={revision:rev,config:publicConfig_(),catalog:catalog_(false),placements:placements_(false),collectionMockups:collection_(false),themes:themes_(),content:content_(),policies:policies_(false),confirmationMessage:confirmationMessage_(),deliveryZones:deliveryZones_(false)};
  cachePutBig_(key,JSON.stringify(b)); return b;
}

/* =====================================================================
 * 05. INVENTORY LEDGER (DESIGN_INVENTORY)
 * ===================================================================== */
function reservedByDesign_(){
  var nowT=Date.now(), pendingConf={};
  rows_('ORDER_CONFIRMATIONS').forEach(function(c){ if(up_(c.STATUS)==='PENDING'&&ms_(c.EXPIRES_AT)>nowT) pendingConf[s_(c.ORDER_ID)]=1; });
  var pendingOrders={}; rows_('ORDERS').forEach(function(o){ if(up_(o.ORDER_STATUS)==='PENDING'&&pendingConf[s_(o.ORDER_ID)]) pendingOrders[s_(o.ORDER_ID)]=1; });
  var m={}; rows_('ORDER_ITEMS').forEach(function(i){ if(pendingOrders[s_(i.ORDER_ID)]){ var d=s_(i.DESIGN_ID); m[d]=(m[d]||0)+Math.max(0,num_(i.QUANTITY,0)); } });
  return m;
}
function ensureInventoryRows_(){
  var have={}; rows_('DESIGN_INVENTORY').forEach(function(r){have[s_(r.DESIGN_ID)]=1;});
  var add=rows_('DESIGNS').filter(function(d){return s_(d.DESIGN_ID)&&!have[s_(d.DESIGN_ID)];}).map(function(d){
    return {DESIGN_ID:s_(d.DESIGN_ID),DESIGN_NAME:s_(d.DESIGN_NAME),PRODUCTION_LIMIT:num_(d.PRODUCTION_LIMIT,100),SOLD:num_(d.SOLD,0),RESERVED:0,REMAINING:num_(d.PRODUCTION_LIMIT,100),STATUS:'ACTIVE',MANUAL_SOLD_OUT:bool_(d.MANUAL_SOLD_OUT,false)?'TRUE':'FALSE',UPDATED_AT:now_()};
  });
  insertMany_('DESIGN_INVENTORY',add);
}
function refreshInventory_(){
  ensureInventoryRows_();
  var res=reservedByDesign_(), names={}; rows_('DESIGNS').forEach(function(d){names[s_(d.DESIGN_ID)]={name:s_(d.DESIGN_NAME),active:on_(d)};});
  var t=table_('DESIGN_INVENTORY'), n=now_();
  t.rows.forEach(function(r){
    var id=s_(r.DESIGN_ID), lim=Math.max(0,num_(r.PRODUCTION_LIMIT,100)), sold=Math.max(0,num_(r.SOLD,0)), rv=res[id]||0, rem=Math.max(0,lim-sold-rv), manual=bool_(r.MANUAL_SOLD_OUT,false);
    var info=names[id]||{name:s_(r.DESIGN_NAME),active:false};
    var status=!info.active?'ARCHIVED':(manual||rem===0?'SOLD_OUT':'ACTIVE');
    if(num_(r.RESERVED,-1)!==rv||num_(r.REMAINING,-1)!==rem||up_(r.STATUS)!==status||s_(r.DESIGN_NAME)!==info.name)
      patch_('DESIGN_INVENTORY',r._row,{RESERVED:rv,REMAINING:rem,STATUS:status,DESIGN_NAME:info.name,UPDATED_AT:n});
  });
}
function assertStock_(qtyByDesign){
  ensureInventoryRows_();
  var res=reservedByDesign_();
  Object.keys(qtyByDesign).forEach(function(did){
    var r=find_('DESIGN_INVENTORY','DESIGN_ID',did); if(!r) throw err_('DESIGN_NOT_FOUND','Design not found.');
    if(bool_(r.MANUAL_SOLD_OUT,false)) throw err_('DESIGN_OUT_OF_STOCK','This design is sold out.');
    var rem=Math.max(0,num_(r.PRODUCTION_LIMIT,100)-num_(r.SOLD,0)-(res[did]||0));
    if(qtyByDesign[did]>rem) throw err_('DESIGN_OUT_OF_STOCK','Only '+rem+' piece(s) left of '+s_(r.DESIGN_NAME)+'.');
  });
}
function adjustSold_(items,dir){
  var q={}; items.forEach(function(i){ var d=s_(i.DESIGN_ID); q[d]=(q[d]||0)+Math.max(0,num_(i.QUANTITY,0)); });
  ensureInventoryRows_();
  Object.keys(q).forEach(function(did){
    var r=find_('DESIGN_INVENTORY','DESIGN_ID',did); if(!r) return;
    var next=num_(r.SOLD,0)+dir*q[did];
    if(next<0) throw err_('DESIGN_INVENTORY_RELEASE_UNDERFLOW','Inventory underflow.');
    patch_('DESIGN_INVENTORY',r._row,{SOLD:next,UPDATED_AT:now_()});
  });
}

/* =====================================================================
 * 06. CUSTOMER AUTH (Google ID token → opaque 30-day rolling session)
 * ===================================================================== */
function verifyGoogle_(credential){
  var tok=s_(credential); if(!tok||tok.length>8192) throw err_('GOOGLE_CREDENTIAL_INVALID','Google sign-in failed. Try again.');
  var res;
  try{ res=UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo',{method:'post',payload:{id_token:tok},muteHttpExceptions:true}); }
  catch(e){ throw err_('GOOGLE_VERIFICATION_UNAVAILABLE','Google verification is unavailable. Try again.'); }
  if(res.getResponseCode()!==200) throw err_('GOOGLE_CREDENTIAL_INVALID','Google sign-in failed. Try again.');
  var c=JSON.parse(res.getContentText());
  if(['https://accounts.google.com','accounts.google.com'].indexOf(s_(c.iss))===-1) throw err_('GOOGLE_ISSUER_INVALID','Google sign-in failed.');
  if(!safeEq_(s_(c.aud),s_(cfg_('GOOGLE_CLIENT_ID','')))) throw err_('GOOGLE_AUDIENCE_INVALID','Google sign-in is misconfigured.');
  if(Number(c.exp)*1000<=Date.now()) throw err_('GOOGLE_TOKEN_EXPIRED','Google sign-in expired. Try again.');
  if(['true','1'].indexOf(lo_(c.email_verified))===-1) throw err_('GOOGLE_EMAIL_NOT_VERIFIED','Your Google email is not verified.');
  if(!s_(c.sub)) throw err_('GOOGLE_SUB_INVALID','Google sign-in failed.');
  return {sub:s_(c.sub),email:email_(c.email),name:s_(c.name)};
}
function customerPublic_(c){ return {customerId:s_(c.CUSTOMER_ID),email:s_(c.EMAIL),fullName:s_(c.FULL_NAME),phone:s_(c.PHONE),dateOfBirth:c.DATE_OF_BIRTH instanceof Date?Utilities.formatDate(c.DATE_OF_BIRTH,'Africa/Cairo','yyyy-MM-dd'):s_(c.DATE_OF_BIRTH),governorate:s_(c.DELIVERY_GOVERNORATE),area:s_(c.DELIVERY_AREA),address:s_(c.DELIVERY_ADDRESS),guest:!s_(c.GOOGLE_SUB),marketingOptIn:bool_(c.MARKETING_OPT_IN,false)}; }
function customerLogin_(p){
  var g=verifyGoogle_(p.credential), device=s_(p.deviceId).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,120);
  return withLock_(function(){
    var t=now_(), c=find_('CUSTOMERS','GOOGLE_SUB',g.sub);
    if(!c){ c=find_('CUSTOMERS','EMAIL',g.email); if(c&&s_(c.GOOGLE_SUB)&&s_(c.GOOGLE_SUB)!==g.sub) throw err_('GOOGLE_IDENTITY_CONFLICT','This email is linked to another Google account.'); }
    if(c){ patch_('CUSTOMERS',c._row,{GOOGLE_SUB:g.sub,EMAIL:g.email,FULL_NAME:s_(c.FULL_NAME)||g.name,LAST_LOGIN_AT:t,UPDATED_AT:t}); c=find_('CUSTOMERS','CUSTOMER_ID',c.CUSTOMER_ID); }
    else c=insert_('CUSTOMERS',{CUSTOMER_ID:uuid_('CUS'),GOOGLE_SUB:g.sub,EMAIL:g.email,FULL_NAME:g.name,CREATED_AT:t,UPDATED_AT:t,LAST_LOGIN_AT:t});
    var raw=token_(), exp=new Date(t.getTime()+cfgNum_('SESSION_HOURS',720)*3600000);
    insert_('CUSTOMER_SESSIONS',{SESSION_ID:uuid_('SES'),CUSTOMER_ID:c.CUSTOMER_ID,SESSION_TOKEN_HASH:hash_(raw),DEVICE_ID:device,EXPIRES_AT:exp,LAST_SEEN_AT:t,CREATED_AT:t,UPDATED_AT:t});
    mergeGuest_(s_(p.guestToken),s_(c.CUSTOMER_ID)); c=find_('CUSTOMERS','CUSTOMER_ID',c.CUSTOMER_ID);
    audit_('CUSTOMER',c.CUSTOMER_ID,'CUSTOMER_LOGIN','CUSTOMER',c.CUSTOMER_ID,null,null,{device:device});
    return {sessionToken:raw,expiresAt:exp.toISOString(),customer:customerPublic_(c)};
  });
}
function customerSession_(payload){
  var raw=s_(payload&&payload.sessionToken); if(!raw||raw.length>256) throw err_('AUTH_REQUIRED','Please sign in.');
  var h=hash_(raw), sess=rows_('CUSTOMER_SESSIONS').filter(function(r){return safeEq_(s_(r.SESSION_TOKEN_HASH),h);})[0];
  if(!sess) throw err_('SESSION_INVALID','Your session has ended. Please sign in again.');
  if(s_(sess.REVOKED_AT)) throw err_('SESSION_REVOKED','You were signed out. Please sign in again.');
  if(ms_(sess.EXPIRES_AT)<=Date.now()) throw err_('SESSION_EXPIRED','Your session has expired. Please sign in again.');
  var c=find_('CUSTOMERS','CUSTOMER_ID',sess.CUSTOMER_ID); if(!c) throw err_('CUSTOMER_NOT_FOUND','Account not found.');
  var stale=Date.now()-ms_(sess.LAST_SEEN_AT)>300000, roll=ms_(sess.EXPIRES_AT)-Date.now()<14*86400000;
  if(stale||roll){ var l=LockService.getScriptLock(); if(IN_LOCK||l.tryLock(300)){ try{ var p={LAST_SEEN_AT:now_(),UPDATED_AT:now_()}; if(roll) p.EXPIRES_AT=new Date(Date.now()+cfgNum_('SESSION_HOURS',720)*3600000); patch_('CUSTOMER_SESSIONS',sess._row,p); }catch(_){} finally{ if(!IN_LOCK) l.releaseLock(); } } }
  return {session:sess,customer:c,customerId:s_(c.CUSTOMER_ID)};
}
function customerLogout_(p){ var s=customerSession_(p); withLock_(function(){ patch_('CUSTOMER_SESSIONS',find_('CUSTOMER_SESSIONS','SESSION_ID',s.session.SESSION_ID)._row,{REVOKED_AT:now_(),UPDATED_AT:now_()}); }); return {status:'LOGGED_OUT'}; }

/* =====================================================================
 * 07. CART (one ACTIVE cart per customer → same cart on every device)
 * ===================================================================== */
function activeCart_(sess,create){
  var cid=sess.customerId;
  var carts=rows_('CARTS').filter(function(c){return s_(c.CUSTOMER_ID)===cid&&up_(c.STATUS)==='ACTIVE';}).sort(function(a,b){return ms_(b.UPDATED_AT)-ms_(a.UPDATED_AT);});
  if(carts.length>1){
    var keep=s_(carts[0].CART_ID);
    carts.slice(1).forEach(function(old){
      rows_('CART_ITEMS').filter(function(i){return s_(i.CART_ID)===s_(old.CART_ID);}).forEach(function(i){ patch_('CART_ITEMS',i._row,{CART_ID:keep,UPDATED_AT:now_()}); });
      patch_('CARTS',find_('CARTS','CART_ID',old.CART_ID)._row,{STATUS:'CLEARED',ITEM_COUNT:0,SUBTOTAL:0,UPDATED_AT:now_()});
    });
    return find_('CARTS','CART_ID',keep);
  }
  if(carts.length) return carts[0];
  if(!create) return null;
  var t=now_();
  return insert_('CARTS',{CART_ID:uuid_('CRT'),CUSTOMER_ID:cid,SESSION_ID:s_(sess.session.SESSION_ID),EMAIL:s_(sess.customer.EMAIL),STATUS:'ACTIVE',ITEM_COUNT:0,SUBTOTAL:0,CURRENCY:s_(cfg_('CURRENCY','EGP')),LAST_ACTIVE_AT:t,CREATED_AT:t,UPDATED_AT:t});
}
function cartPayload_(cart){
  var currency=s_(cfg_('CURRENCY','EGP'));
  if(!cart) return {cartId:'',items:[],itemCount:0,subtotal:0,currency:currency};
  var prices={}; rows_('PRODUCTS').forEach(function(p){prices[s_(p.PRODUCT_ID)]={price:num_(p.PRICE,0),active:on_(p)};});
  var items=rows_('CART_ITEMS').filter(function(i){return s_(i.CART_ID)===s_(cart.CART_ID);}).sort(function(a,b){return a._row-b._row;}).map(function(i){
    var pr=prices[s_(i.PRODUCT_ID)]||{price:0,active:false}, q=num_(i.QUANTITY,0);
    return {cartItemId:s_(i.CART_ITEM_ID),productId:s_(i.PRODUCT_ID),productName:s_(i.PRODUCT_NAME),designId:s_(i.DESIGN_ID),designName:s_(i.DESIGN_NAME),color:s_(i.COLOR),size:s_(i.SIZE),side:up_(i.SIDE),printSize:num_(i.PRINT_SIZE,20),quantity:q,unitPrice:pr.price,lineTotal:money_(pr.price*q),available:pr.active,designAssetUrl:s_(i.DESIGN_ASSET_URL),mockupPreviewUrl:s_(i.MOCKUP_PREVIEW_URL)};
  });
  var sub=money_(items.reduce(function(n,x){return n+x.lineTotal;},0)), cnt=items.reduce(function(n,x){return n+x.quantity;},0);
  return {cartId:s_(cart.CART_ID),items:items,itemCount:cnt,subtotal:sub,currency:currency};
}
function syncCartTotals_(cart){ var p=cartPayload_(cart); patch_('CARTS',find_('CARTS','CART_ID',cart.CART_ID)._row,{ITEM_COUNT:p.itemCount,SUBTOTAL:p.subtotal,LAST_ACTIVE_AT:now_(),UPDATED_AT:now_()}); return p; }
function validateLine_(item){
  var product=productById_(req_(item.productId,'PRODUCT_ID_REQUIRED'),false); if(!product) throw err_('PRODUCT_NOT_FOUND','This product is no longer available.');
  var design=designById_(req_(item.designId,'DESIGN_ID_REQUIRED'),false); if(!design) throw err_('DESIGN_NOT_FOUND','This design is no longer available.');
  if(design.soldOut) throw err_('DESIGN_OUT_OF_STOCK','This design is sold out.');
  var color=matchChoice_(item.color,product.colors,'INVALID_COLOR'), size=matchChoice_(item.size,product.sizes,'INVALID_SIZE');
  var side=up_(item.side); if(['FRONT','BACK'].indexOf(side)===-1) throw err_('INVALID_SIDE','Choose front or back.');
  var ps=Number(item.printSize); if([20,30].indexOf(ps)===-1) throw err_('INVALID_PRINT_SIZE','Choose 20 or 30 cm.');
  var logoSide=side==='FRONT'?'BACK':'FRONT', logoCm=cfgNum_('LOGO_PRINT_CM',7), pm=placementMap_();
  var dp=pm[placementKey_(product.productId,color,'DESIGN',design.designId,side,ps)], lp=pm[placementKey_(product.productId,color,'LOGO','',logoSide,logoCm)];
  if(!dp||dp._duplicate) throw err_('CHECKOUT_PLACEMENT_NOT_FOUND','This combination is not available yet.');
  if(!lp||lp._duplicate) throw err_('LOGO_PLACEMENT_NOT_FOUND','This combination is not available yet.');
  return {product:product,design:design,color:color,size:size,side:side,printSize:ps,logoSide:logoSide,logoCm:logoCm,dp:dp,lp:lp};
}
function cartRoute_(p){
  var sess=customerSession_(p), op=up_(p.operation||'GET');
  if(op==='GET') return cartPayload_(activeCart_(sess,false));
  return withLock_(function(){
    var cart=activeCart_(sess,true), items=rows_('CART_ITEMS').filter(function(i){return s_(i.CART_ID)===s_(cart.CART_ID);});
    var maxLine=cfgNum_('MAX_QTY_PER_LINE',20), maxCart=cfgNum_('MAX_CART_QTY',50);
    if(op==='ADD'){
      if(up_(cfg_('STORE_MODE','OPEN'))!=='OPEN') throw err_('STORE_CLOSED','The store is closed right now.');
      var it=p.item||p, v=validateLine_(it), qty=Math.floor(clamp_(it.quantity==null?1:it.quantity,1,maxLine,'QUANTITY_LIMIT_EXCEEDED'));
      var same=items.filter(function(i){return s_(i.PRODUCT_ID)===v.product.productId&&s_(i.DESIGN_ID)===v.design.designId&&lo_(i.COLOR)===lo_(v.color)&&s_(i.SIZE)===v.size&&up_(i.SIDE)===v.side&&num_(i.PRINT_SIZE,0)===v.printSize;})[0];
      var total=items.reduce(function(n,i){return n+num_(i.QUANTITY,0);},0)+qty;
      if(total>maxCart) throw err_('CART_TOTAL_QUANTITY_LIMIT_EXCEEDED','Your bag can hold up to '+maxCart+' pieces.');
      var designQty={}; items.forEach(function(i){designQty[s_(i.DESIGN_ID)]=(designQty[s_(i.DESIGN_ID)]||0)+num_(i.QUANTITY,0);});
      designQty[v.design.designId]=(designQty[v.design.designId]||0)+qty; assertStock_(designQty);
      var t=now_(), unit=v.product.price;
      if(same){ var nq=num_(same.QUANTITY,0)+qty; if(nq>maxLine) throw err_('QUANTITY_LIMIT_EXCEEDED','Max '+maxLine+' per item.'); patch_('CART_ITEMS',same._row,{QUANTITY:nq,UNIT_PRICE:unit,LINE_TOTAL:money_(unit*nq),UPDATED_AT:t}); }
      else insert_('CART_ITEMS',{CART_ITEM_ID:uuid_('CLI'),CART_ID:cart.CART_ID,PRODUCT_ID:v.product.productId,PRODUCT_NAME:v.product.productName,DESIGN_ID:v.design.designId,DESIGN_NAME:v.design.designName,COLOR:v.color,SIZE:v.size,SIDE:v.side,PRINT_SIZE:v.printSize,QUANTITY:qty,UNIT_PRICE:unit,LINE_TOTAL:money_(unit*qty),DESIGN_ASSET_URL:designUrlFor_(v.design,v.side),MOCKUP_PREVIEW_URL:mockupUrlFor_(v.product,v.color),CREATED_AT:t,UPDATED_AT:t});
      return syncCartTotals_(cart);
    }
    var line=items.filter(function(i){return s_(i.CART_ITEM_ID)===s_(p.cartItemId);})[0];
    if(op==='UPDATE_QUANTITY'||op==='UPDATE'){
      if(!line) throw err_('CART_ITEM_NOT_FOUND','Item not found in your bag.');
      var q=Math.floor(clamp_(p.quantity,1,maxLine,'QUANTITY_LIMIT_EXCEEDED'));
      var dq={}; items.forEach(function(i){ if(i!==line) dq[s_(i.DESIGN_ID)]=(dq[s_(i.DESIGN_ID)]||0)+num_(i.QUANTITY,0); }); dq[s_(line.DESIGN_ID)]=(dq[s_(line.DESIGN_ID)]||0)+q; assertStock_(dq);
      patch_('CART_ITEMS',line._row,{QUANTITY:q,UPDATED_AT:now_()}); return syncCartTotals_(cart);
    }
    if(op==='REMOVE'){ if(!line) throw err_('CART_ITEM_NOT_FOUND','Item not found in your bag.'); deleteRows_('CART_ITEMS',[line._row]); return syncCartTotals_(cart); }
    if(op==='CLEAR'){ deleteRows_('CART_ITEMS',items.map(function(i){return i._row;})); return syncCartTotals_(cart); }
    throw err_('CART_OPERATION_INVALID','Invalid bag operation.');
  });
}

/* =====================================================================
 * 08. CHECKOUT (server-priced, placement-snapshotted, idempotent, rolled back on failure)
 * ===================================================================== */
function createOrder_(p){
  var sess=customerSession_(p), idem=req_(p.idempotencyKey,'IDEMPOTENCY_KEY_REQUIRED',128);
  return withLock_(function(){
    if(up_(cfg_('STORE_MODE','OPEN'))!=='OPEN') throw err_('STORE_CLOSED','The store is closed right now.');
    var provider=paymentProvider_(); if(provider==='NONE') throw err_('PAYMENT_NOT_AVAILABLE','Online payment is not available right now. Please try again later.');
    var props=PropertiesService.getScriptProperties(), ikey='TEMP_ORDER_IDEMP_'+hash_(sess.customerId+'|'+idem), prev=props.getProperty(ikey);
    if(prev){ var po=find_('ORDERS','ORDER_ID',prev); if(po){ var again={status:'ALREADY_CREATED',order:orderPublic_(po,[]),confirmation:confPublic_(find_('ORDER_CONFIRMATIONS','ORDER_ID',prev)),payment:{provider:s_(po.PAYMENT_METHOD)==='ONLINE'?'PAYMOB':'COD'}};
      if(again.payment.provider==='PAYMOB'&&up_(po.ORDER_STATUS)==='PENDING'&&paymentStatusFor_(po)!=='PAID') again.payment.checkoutUrl=pmIntention_(po,where_('ORDER_ITEMS','ORDER_ID',prev)).checkoutUrl; return again; } }
    var guest=isGuest_(sess.customer), email=guest?email_(p.email):s_(sess.customer.EMAIL);
    var name=req_(p.name,'CUSTOMER_NAME_REQUIRED',200), phone=phone_(p.phone), gov=req_(p.governorate,'GOVERNORATE_REQUIRED',150), area=req_(p.area,'AREA_REQUIRED',200), address=req_(p.address,'DELIVERY_ADDRESS_REQUIRED',500);
    if(address.length<5) throw err_('DELIVERY_ADDRESS_TOO_SHORT','Please enter your full address.');
    var dob=s_(p.dateOfBirth).slice(0,10);
    var cart=activeCart_(sess,false); if(!cart) throw err_('CART_EMPTY','Your bag is empty.');
    var lines=rows_('CART_ITEMS').filter(function(i){return s_(i.CART_ID)===s_(cart.CART_ID);}).sort(function(a,b){return a._row-b._row;});
    if(!lines.length) throw err_('CART_EMPTY','Your bag is empty.');
    var zone=deliveryQuote_(gov,area); if(!zone) throw err_('DELIVERY_ZONE_NOT_FOUND','We do not deliver to this area yet.');
    var fee=money_(zone.deliveryFee), t=now_(), orderId=uuid_('ORD'), currency=s_(cfg_('CURRENCY','EGP')), subtotal=0, qtyByDesign={};
    var oi=lines.map(function(l){
      var v=validateLine_({productId:l.PRODUCT_ID,designId:l.DESIGN_ID,color:l.COLOR,size:l.SIZE,side:l.SIDE,printSize:l.PRINT_SIZE});
      var q=Math.floor(clamp_(l.QUANTITY,1,cfgNum_('MAX_QTY_PER_LINE',20),'CHECKOUT_QUANTITY_INVALID')), unit=money_(v.product.price), lt=money_(unit*q);
      subtotal+=lt; qtyByDesign[v.design.designId]=(qtyByDesign[v.design.designId]||0)+q;
      return {ORDER_ITEM_ID:uuid_('ORI'),ORDER_ID:orderId,PRODUCT_ID:v.product.productId,PRODUCT_NAME:v.product.productName,DESIGN_ID:v.design.designId,DESIGN_NAME:v.design.designName,COLOR:v.color,SIZE:v.size,QUANTITY:q,UNIT_PRICE:unit,LINE_TOTAL:lt,
        DESIGN_SIDE:v.side,DESIGN_PRINT_SIZE:v.printSize,LOGO_SIDE:v.logoSide,LOGO_SIZE_CM:v.logoCm,VISUAL_WIDTH:v.dp.width,VISUAL_HEIGHT:v.dp.height,VISUAL_TOP:v.dp.top,VISUAL_LEFT:v.dp.left,VISUAL_ROTATION:v.dp.rotation,VISUAL_OPACITY:v.dp.opacity,
        LOGO_WIDTH:v.lp.width,LOGO_TOP:v.lp.top,LOGO_LEFT:v.lp.left,LOGO_ROTATION:v.lp.rotation,LOGO_OPACITY:v.lp.opacity,MOCKUP_PREVIEW_URL:mockupUrlFor_(v.product,v.color),CREATED_AT:t,UPDATED_AT:t};
    });
    assertStock_(qtyByDesign);
    var total=money_(subtotal+fee);
    var online=provider==='PAYMOB';
    var order={ORDER_ID:orderId,ORDER_NUMBER:'TMP-'+Utilities.formatDate(t,'Africa/Cairo','yyyyMMdd')+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,6).toUpperCase(),CUSTOMER_ID:sess.customerId,CUSTOMER_NAME:name,EMAIL:email,PHONE:T_(phone),ORDER_STATUS:'PENDING',TOTAL:total,CURRENCY:currency,
      DELIVERY_ZONE_ID:zone.zoneId,DELIVERY_FEE:fee,PAYMENT_METHOD:online?'ONLINE':'COD',PAYMENT_STATUS:'PENDING',DATE_OF_BIRTH:dob,DELIVERY_GOVERNORATE:gov,DELIVERY_AREA:area,DELIVERY_ADDRESS:address,CREATED_AT:t,UPDATED_AT:t};
    var exp=new Date(t.getTime()+(online?Math.max(15,cfgNum_('PAYMOB_PAYMENT_MINUTES',60))*60000:Math.max(1,cfgNum_('CONFIRMATION_HOURS',1))*3600000));
    var conf={CONFIRMATION_ID:uuid_('CNF'),ORDER_ID:orderId,CUSTOMER_ID:sess.customerId,EXPIRES_AT:exp,STATUS:'PENDING',CREATED_AT:t,UPDATED_AT:t};
    var cartBefore=plain_(find_('CARTS','CART_ID',cart.CART_ID)), done=[];
    try{
      insert_('ORDERS',order); done.push('ORDERS');
      insertMany_('ORDER_ITEMS',oi); done.push('ORDER_ITEMS');
      insert_('PAYMENTS',{PAYMENT_ID:uuid_('PAY'),ORDER_ID:orderId,CUSTOMER_ID:sess.customerId,PROVIDER:online?'PAYMOB':'INTERNAL',PAYMENT_METHOD:online?'ONLINE':'COD',AMOUNT:total,CURRENCY:currency,PAYMENT_STATUS:'PENDING',CREATED_AT:t,UPDATED_AT:t}); done.push('PAYMENTS');
      insert_('ORDER_CONFIRMATIONS',conf); done.push('ORDER_CONFIRMATIONS');
      patch_('CARTS',find_('CARTS','CART_ID',cart.CART_ID)._row,{STATUS:'CONVERTED',UPDATED_AT:t});
      var cpatch={FULL_NAME:name,PHONE:T_(phone),DELIVERY_GOVERNORATE:gov,DELIVERY_AREA:area,DELIVERY_ADDRESS:address,UPDATED_AT:t}; if(dob) cpatch.DATE_OF_BIRTH=T_(dob); if(guest) cpatch.EMAIL=email;
      patch_('CUSTOMERS',find_('CUSTOMERS','CUSTOMER_ID',sess.customerId)._row,cpatch);
      SpreadsheetApp.flush();
      props.setProperty(ikey,orderId);
    }catch(e){
      done.reverse().forEach(function(sheet){ try{ deleteRows_(sheet,where_(sheet,'ORDER_ID',orderId).map(function(r){return r._row;})); }catch(_){} });
      try{ var cr=find_('CARTS','CART_ID',cart.CART_ID); if(cr) patch_('CARTS',cr._row,{STATUS:cartBefore.STATUS||'ACTIVE'}); }catch(_){}
      throw e;
    }
    var payment={provider:online?'PAYMOB':'COD'};
    if(online){
      try{ order.PHONE=phone; var pm=pmIntention_(order,oi); payment.checkoutUrl=pm.checkoutUrl; var pr=where_('PAYMENTS','ORDER_ID',orderId)[0]; if(pr) patch_('PAYMENTS',pr._row,{PROVIDER_TRANSACTION_ID:T_(pm.intentionId),UPDATED_AT:now_()}); }
      catch(e){ try{ transitionOrder_(orderId,'CANCELED','SYSTEM','SYSTEM','PAYMENT_START_FAILED'); var cr2=find_('CARTS','CART_ID',cart.CART_ID); if(cr2) patch_('CARTS',cr2._row,{STATUS:'ACTIVE',UPDATED_AT:now_()}); props.deleteProperty(ikey); }catch(_){} throw e; }
    }
    audit_('CUSTOMER',sess.customerId,'ORDER_CREATED','ORDER',orderId,null,{total:total,deliveryFee:fee,items:oi.length,payment:payment.provider},{orderNumber:order.ORDER_NUMBER});
    try{ refreshInventory_(); bumpRevision_(); }catch(_){}
    if(!online){ queueEmail_('CUSTOMER_CONFIRMATION',orderId); queueEmail_('ADMIN_NEW_ORDER',orderId); }
    return {status:'CREATED',order:orderPublic_(order,oi),confirmation:confPublic_(conf),payment:payment};
  });
}
function orderPublic_(o,items){
  return {orderId:s_(o.ORDER_ID),orderNumber:s_(o.ORDER_NUMBER),orderStatus:up_(o.ORDER_STATUS),paymentMethod:s_(o.PAYMENT_METHOD),paymentStatus:paymentStatusFor_(o),total:num_(o.TOTAL,0),currency:s_(o.CURRENCY),deliveryFee:num_(o.DELIVERY_FEE,0),
    customerName:s_(o.CUSTOMER_NAME),email:s_(o.EMAIL),phone:s_(o.PHONE),delivery:{governorate:s_(o.DELIVERY_GOVERNORATE),area:s_(o.DELIVERY_AREA),address:s_(o.DELIVERY_ADDRESS),zoneId:s_(o.DELIVERY_ZONE_ID)},
    createdAt:iso_(o.CREATED_AT),updatedAt:iso_(o.UPDATED_AT),confirmedAt:iso_(o.CONFIRMED_AT),deliveredAt:iso_(o.DELIVERED_AT),canceledAt:iso_(o.CANCELED_AT),
    items:(items||[]).map(function(i){return {orderItemId:s_(i.ORDER_ITEM_ID),productId:s_(i.PRODUCT_ID),productName:s_(i.PRODUCT_NAME),designId:s_(i.DESIGN_ID),designName:s_(i.DESIGN_NAME),color:s_(i.COLOR),size:s_(i.SIZE),quantity:num_(i.QUANTITY,0),unitPrice:num_(i.UNIT_PRICE,0),lineTotal:num_(i.LINE_TOTAL,0),designSide:up_(i.DESIGN_SIDE),designPrintSize:num_(i.DESIGN_PRINT_SIZE,0),logoSide:up_(i.LOGO_SIDE),mockupPreviewUrl:s_(i.MOCKUP_PREVIEW_URL)};})};
}
function paymentStatusFor_(o){ var p=where_('PAYMENTS','ORDER_ID',o.ORDER_ID).sort(function(a,b){return ms_(b.UPDATED_AT)-ms_(a.UPDATED_AT);})[0]; return p?up_(p.PAYMENT_STATUS):up_(o.PAYMENT_STATUS); }
function confPublic_(c){ return c?{status:up_(c.STATUS),expiresAt:iso_(c.EXPIRES_AT),confirmedAt:iso_(c.CONFIRMED_AT)}:null; }
function customerOrders_(p){
  var sess=customerSession_(p), dAssets=rows_('DESIGN_ASSETS'), inv=inventoryMap_(), designs={};
  rows_('DESIGNS').forEach(function(d){designs[s_(d.DESIGN_ID)]=designView_(d,dAssets,inv,true);});
  var orders=where_('ORDERS','CUSTOMER_ID',sess.customerId).sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);});
  return {orders:orders.map(function(o){
    var op=orderPublic_(o,where_('ORDER_ITEMS','ORDER_ID',o.ORDER_ID));
    op.items.forEach(function(i){ var d=designs[i.designId]; i.designAssetUrl=d?designUrlFor_(d,i.designSide):''; i.designCode=d?d.designCode:''; i.productionLimit=d?d.productionLimit:0; i.designNameAr=d?d.designNameAr:''; });
    op.confirmation=confPublic_(find_('ORDER_CONFIRMATIONS','ORDER_ID',o.ORDER_ID)); return op;
  })};
}

/* =====================================================================
 * 09. ORDER LIFECYCLE + CONFIRMATION TOKENS (signature compatible with previous emails)
 * ===================================================================== */
function confSecret_(){ var pr=PropertiesService.getScriptProperties(), k='TEMPORARY_ORDER_CONFIRMATION_SIGNING_SECRET', v=pr.getProperty(k); if(!v){ v=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''); pr.setProperty(k,v); } return v; }
function confSig_(orderId,expMs){ return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,confSecret_()+'|'+orderId+'|'+expMs,Utilities.Charset.UTF_8)).replace(/=+$/,''); }
function confToken_(orderId,expires){ var e=ms_(expires); return Utilities.base64EncodeWebSafe(JSON.stringify({orderId:orderId,expiresAt:e}),Utilities.Charset.UTF_8).replace(/=+$/,'')+'.'+confSig_(orderId,e); }
function confVerify_(token){
  var parts=s_(token).split('.'); if(parts.length!==2) throw err_('CONFIRMATION_TOKEN_INVALID','This confirmation link is invalid.');
  var b=parts[0]; while(b.length%4) b+='=';
  var data; try{ data=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString()); }catch(_){ throw err_('CONFIRMATION_TOKEN_INVALID','This confirmation link is invalid.'); }
  var oid=s_(data.orderId), exp=Number(data.expiresAt);
  if(!oid||!isFinite(exp)||!safeEq_(parts[1],confSig_(oid,exp))) throw err_('CONFIRMATION_TOKEN_INVALID','This confirmation link is invalid.');
  return {orderId:oid,expired:Date.now()>=exp};
}
function transitionOrder_(orderId,next,actorType,actorId,method){
  next=up_(next); if(!STATUS_FLOW[next]) throw err_('INVALID_ORDER_STATUS','Unknown status.');
  return withLock_(function(){
    var o=find_('ORDERS','ORDER_ID',orderId); if(!o) throw err_('ORDER_NOT_FOUND','Order not found.');
    var cur=up_(o.ORDER_STATUS); if(cur===next) return orderPublic_(o,[]);
    if((STATUS_FLOW[cur]||[]).indexOf(next)===-1) throw err_('INVALID_ORDER_STATUS_TRANSITION','Cannot move an order from '+cur+' to '+next+'.');
    var items=where_('ORDER_ITEMS','ORDER_ID',orderId), conf=find_('ORDER_CONFIRMATIONS','ORDER_ID',orderId), t=now_(), patch={ORDER_STATUS:next,UPDATED_AT:t};
    if(next==='CONFIRMED'){ adjustSold_(items,+1); patch.CONFIRMED_AT=t; if(conf) patch_('ORDER_CONFIRMATIONS',conf._row,{STATUS:'CONFIRMED',CONFIRMED_AT:t,CONFIRMATION_METHOD:method||actorType,UPDATED_AT:t}); }
    if(next==='CANCELED'){ if(cur!=='PENDING') adjustSold_(items,-1); patch.CANCELED_AT=t; if(conf&&up_(conf.STATUS)==='PENDING') patch_('ORDER_CONFIRMATIONS',conf._row,{STATUS:method==='TIMEOUT'?'EXPIRED':'CANCELED',CONFIRMATION_METHOD:method||actorType,UPDATED_AT:t}); }
    if(next==='PROCESSING') patch.PROCESSING_AT=t;
    if(next==='SHIPPED'||next==='OUT_FOR_DELIVERY') patch.SHIPPED_AT=o.SHIPPED_AT||t;
    if(next==='DELIVERED') patch.DELIVERED_AT=t;
    patch_('ORDERS',o._row,patch);
    audit_(actorType,actorId,'ORDER_STATUS_CHANGED','ORDER',orderId,{status:cur},{status:next},{method:method||''});
    if(next==='CONFIRMED'){ try{ ensureAuthCard_(orderId); }catch(e){ console.error('AUTH_CARD_FAILED '+orderId+' '+e); } }
    if(next==='CANCELED'){ try{ where_('AUTHENTICITY','ORDER_ID',orderId).forEach(function(c){ patch_('AUTHENTICITY',c._row,{STATUS:'CANCELLED',UPDATED_AT:t,NOTES:T_(('Order canceled. '+s_(c.NOTES)).trim())}); }); }catch(e){ console.error('AUTH_CANCEL_FAILED '+e); } }
    if(next==='CONFIRMED'||next==='CANCELED'){ refreshInventory_(); bumpRevision_(); }
    return orderPublic_(find_('ORDERS','ORDER_ID',orderId),[]);
  });
}
function confirmationData_(p){
  var v=confVerify_(p.token), o=find_('ORDERS','ORDER_ID',v.orderId); if(!o) throw err_('ORDER_NOT_FOUND','Order not found.');
  var c=find_('ORDER_CONFIRMATIONS','ORDER_ID',v.orderId), st=c?up_(c.STATUS):'NOT_AVAILABLE';
  if(st==='PENDING'&&v.expired) st='EXPIRED';
  return {status:st,orderNumber:s_(o.ORDER_NUMBER),orderStatus:up_(o.ORDER_STATUS),total:num_(o.TOTAL,0),currency:s_(o.CURRENCY),expiresAt:c?iso_(c.EXPIRES_AT):''};
}
function confirmOrderFromToken_(p){
  var v=confVerify_(p.token);
  return withLock_(function(){
    var c=find_('ORDER_CONFIRMATIONS','ORDER_ID',v.orderId), o=find_('ORDERS','ORDER_ID',v.orderId);
    if(!c||!o) throw err_('CONFIRMATION_RECORD_NOT_FOUND','This order could not be found.');
    if(up_(c.STATUS)==='CONFIRMED') return {status:'ALREADY_CONFIRMED',orderNumber:s_(o.ORDER_NUMBER)};
    if(up_(c.STATUS)!=='PENDING'||up_(o.ORDER_STATUS)!=='PENDING') throw err_('CONFIRMATION_NOT_AVAILABLE','This order can no longer be confirmed.');
    if(v.expired||ms_(c.EXPIRES_AT)<=Date.now()){ transitionOrder_(v.orderId,'CANCELED','SYSTEM','SYSTEM','TIMEOUT'); throw err_('CONFIRMATION_ORDER_EXPIRED','This confirmation link has expired.'); }
    transitionOrder_(v.orderId,'CONFIRMED','CUSTOMER',s_(o.CUSTOMER_ID),'EMAIL_BUTTON');
    return {status:'CONFIRMED',orderNumber:s_(o.ORDER_NUMBER)};
  });
}
function expirePendingOrders_(){
  return withLock_(function(){
    var n=0, nowT=Date.now(), confs={}; rows_('ORDER_CONFIRMATIONS').forEach(function(c){confs[s_(c.ORDER_ID)]=c;});
    rows_('ORDERS').filter(function(o){ var c=confs[s_(o.ORDER_ID)]; return up_(o.ORDER_STATUS)==='PENDING'&&c&&up_(c.STATUS)==='PENDING'&&ms_(c.EXPIRES_AT)<=nowT; })
      .map(function(o){return s_(o.ORDER_ID);}).forEach(function(id){ try{ transitionOrder_(id,'CANCELED','SYSTEM','SYSTEM','TIMEOUT'); n++; }catch(e){ console.error('EXPIRE '+id+' '+e); } });
    return n;
  });
}

/* =====================================================================
 * 10. EMAIL QUEUE (customer confirmation + admin new-order), EMAIL_LOG
 * ===================================================================== */
var EMAIL_QUEUE_KEY='TEMP_EMAIL_QUEUE_V10';
function queueEmail_(type,orderId){
  var pr=PropertiesService.getScriptProperties(), q=[]; try{ q=JSON.parse(pr.getProperty(EMAIL_QUEUE_KEY)||'[]'); }catch(_){}
  if(!q.some(function(x){return x.type===type&&x.orderId===orderId;})) q.push({type:type,orderId:orderId,attempts:0});
  pr.setProperty(EMAIL_QUEUE_KEY,JSON.stringify(q.slice(-200)));
}
function processEmailQueue_(){
  var pr=PropertiesService.getScriptProperties(), q=[]; try{ q=JSON.parse(pr.getProperty(EMAIL_QUEUE_KEY)||'[]'); }catch(_){}
  if(!q.length) return {sent:0,remaining:0};
  pr.setProperty(EMAIL_QUEUE_KEY,'[]');
  var keep=[], sent=0;
  q.forEach(function(job){
    try{ if(sendEmailJob_(job)) sent++; }
    catch(e){ job.attempts=(job.attempts||0)+1; logEmail_(job.orderId,job.type,'','FAILED',job.attempts,String(e.message||e)); if(job.attempts<20) keep.push(job); }
  });
  if(keep.length){ var cur=[]; try{ cur=JSON.parse(pr.getProperty(EMAIL_QUEUE_KEY)||'[]'); }catch(_){} pr.setProperty(EMAIL_QUEUE_KEY,JSON.stringify(cur.concat(keep).slice(-200))); }
  return {sent:sent,remaining:keep.length};
}
function logEmail_(orderId,type,to,status,attempts,error){ try{ insert_('EMAIL_LOG',{ORDER_ID:orderId,TYPE:type,RECIPIENT:to,STATUS:status,ATTEMPTS:attempts||1,ERROR:error||'',SENT_AT:status==='SENT'?now_():''}); }catch(_){} }
function escHtml_(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function sendEmailJob_(job){
  var o=find_('ORDERS','ORDER_ID',job.orderId); if(!o) return false;
  var brand=s_(cfg_('BRAND_NAME','TEMPORARY™')), cur=s_(o.CURRENCY);
  if(job.type==='CUSTOMER_CONFIRMATION'){
    if(!cfgBool_('ORDER_CONFIRMATION_EMAIL_ENABLED',true)) return false;
    var c=find_('ORDER_CONFIRMATIONS','ORDER_ID',job.orderId); if(!c||up_(c.STATUS)!=='PENDING') return false;
    var url=s_(cfg_('CONFIRMATION_PAGE_URL','')).replace(/\/$/,'')+'?token='+encodeURIComponent(confToken_(s_(o.ORDER_ID),c.EXPIRES_AT));
    var until=Utilities.formatDate(new Date(ms_(c.EXPIRES_AT)),'Africa/Cairo','dd MMM yyyy, HH:mm');
    var html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#111"><div style="font-weight:700;letter-spacing:2px;font-size:20px">'+escHtml_(brand)+'</div><h1 style="font-size:24px;margin:28px 0 10px">CONFIRM YOUR ORDER</h1><p>Hi '+escHtml_(o.CUSTOMER_NAME)+', your order is waiting for your confirmation.</p><div style="border:1px solid #ddd;padding:16px;margin:20px 0"><b>Order:</b> '+escHtml_(o.ORDER_NUMBER)+'<br><b>Delivery:</b> '+num_(o.DELIVERY_FEE,0).toFixed(2)+' '+escHtml_(cur)+'<br><b>Total:</b> '+num_(o.TOTAL,0).toFixed(2)+' '+escHtml_(cur)+'</div><p style="text-align:center"><a href="'+escHtml_(url)+'" style="display:inline-block;padding:16px 28px;background:#111;color:#fff;text-decoration:none;font-weight:700">CONFIRM ORDER</a></p><p style="color:#555;font-size:13px">Confirm before <b>'+until+'</b> (Cairo). Unconfirmed orders expire automatically.</p><p style="font-size:12px">EVERYTHING IS TEMPORARY</p></div>';
    MailApp.sendEmail({to:s_(o.EMAIL),subject:'CONFIRM YOUR '+brand+' ORDER · '+s_(o.ORDER_NUMBER),htmlBody:html,body:'Confirm your order '+s_(o.ORDER_NUMBER)+': '+url});
    logEmail_(job.orderId,job.type,s_(o.EMAIL),'SENT',(job.attempts||0)+1,''); return true;
  }
  if(job.type==='CUSTOMER_ORDER_RECEIVED'){ sendOrderReceived_(o); logEmail_(job.orderId,job.type,s_(o.EMAIL),'SENT',(job.attempts||0)+1,''); return true; }
  if(job.type==='ADMIN_NEW_ORDER'){
    var to=list_(cfg_('ADMIN_NOTIFICATION_EMAILS','')).slice(0,2); if(!to.length||!cfgBool_('ADMIN_NEW_ORDER_NOTIFICATIONS',true)) return false;
    MailApp.sendEmail({to:to.join(','),subject:brand+' — NEW ORDER '+s_(o.ORDER_NUMBER),body:['New order.','Order: '+s_(o.ORDER_NUMBER),'Customer: '+s_(o.CUSTOMER_NAME),'Phone: '+s_(o.PHONE),'Email: '+s_(o.EMAIL),'Area: '+s_(o.DELIVERY_GOVERNORATE)+' / '+s_(o.DELIVERY_AREA),'Total: '+cur+' '+num_(o.TOTAL,0),'Payment: '+(s_(o.PAYMENT_METHOD)==='ONLINE'?'PAID ONLINE (Paymob)':'Cash on delivery'),'Status: '+up_(o.ORDER_STATUS)].join('\n')});
    logEmail_(job.orderId,job.type,to.join(','),'SENT',(job.attempts||0)+1,''); return true;
  }
  return false;
}

/* =====================================================================
 * 11. CUSTOMER MISC — context, delivery quote, analytics, contact
 * ===================================================================== */
function customerContext_(p){ var s=customerSession_(p); return {customer:customerPublic_(s.customer),cart:cartPayload_(activeCart_(s,false))}; }
function deliveryQuoteRoute_(p){
  customerSession_(p); var z=deliveryQuote_(s_(p.governorate),s_(p.area));
  return z?{available:true,zoneId:z.zoneId,deliveryFee:z.deliveryFee,estimatedDays:z.estimatedDays,currency:s_(cfg_('CURRENCY','EGP'))}:{available:false,deliveryFee:0,currency:s_(cfg_('CURRENCY','EGP'))};
}
function trackEvent_(p){
  var type=up_(p.type); if(ANALYTICS_TYPES.indexOf(type)===-1) throw err_('ANALYTICS_EVENT_INVALID','Unknown event.');
  var cid='',sid=''; if(p.sessionToken){ try{ var s=customerSession_(p); cid=s.customerId; sid=s_(s.session.SESSION_ID); }catch(_){} }
  insert_('ANALYTICS_EVENTS',{EVENT_ID:uuid_('EVT'),TYPE:type,CUSTOMER_ID:cid,SESSION_ID:sid,DEVICE:s_(p.device).slice(0,40),PRODUCT_ID:s_(p.productId).slice(0,60),DESIGN_ID:s_(p.designId).slice(0,60),COLOR:s_(p.color).slice(0,40),SIZE:s_(p.size).slice(0,20),VALUE:num_(p.value,0),CREATED_AT:now_()});
  return {status:'RECORDED'};
}
var INQUIRY_TOPICS=['GENERAL','ORDER','DELIVERY','RETURN','DEFECT','SIZING','OTHER'];
var INQUIRY_STATUSES=['NEW','IN_PROGRESS','REPLIED','CLOSED'];
/* Contact form: text only. Saved to INQUIRIES (Admin ▸ Inquiries) and emailed to the support address. */
function contactInquiry_(p){
  var name=req_(p.name,'CONTACT_NAME_REQUIRED',120), em=email_(p.email), msg=req_(p.message,'CONTACT_MESSAGE_REQUIRED',4000);
  var phone=s_(p.phone)?phone_(p.phone):'', topic=up_(p.topic); if(INQUIRY_TOPICS.indexOf(topic)<0) topic='GENERAL';
  var orderNo=s_(p.orderNumber).replace(/[^\w#-]/g,'').slice(0,40), lang=lo_(p.lang)==='ar'?'ar':'en';
  var c=CacheService.getScriptCache(), k='CONTACT_'+hash_(em).slice(0,20), n=Number(c.get(k)||0);
  if(n>=5) throw err_('CONTACT_RATE_LIMITED','You have sent several messages. Please try again later.'); c.put(k,String(n+1),3600);
  var cid=''; if(p.sessionToken){ try{ cid=customerSession_(p).customerId; }catch(_){} }
  var id=uuid_('INQ'), t=now_();
  withLock_(function(){ insert_('INQUIRIES',{INQUIRY_ID:id,CREATED_AT:t,STATUS:'NEW',NAME:T_(name),EMAIL:em,PHONE:T_(phone),TOPIC:topic,ORDER_NUMBER:T_(orderNo),MESSAGE:T_(msg),LANG:lang,CUSTOMER_ID:cid,ADMIN_NOTE:'',UPDATED_AT:t}); });
  var to=uniqueCI_([s_(content_().en.contactEmail)].concat(list_(cfg_('ADMIN_NOTIFICATION_EMAILS','')))).filter(function(x){return /@/.test(x);}).slice(0,3);
  if(to.length){ try{ MailApp.sendEmail({to:to.join(','),replyTo:em,subject:s_(cfg_('BRAND_NAME','TEMPORARY™'))+' Inquiry · '+topic+(orderNo?' · '+orderNo:'')+' — '+name,
    body:['Topic: '+topic,'Name: '+name,'Email: '+em,'Phone: '+(phone||'—'),'Order: '+(orderNo||'—'),'Language: '+lang.toUpperCase(),'Inquiry ID: '+id,'','Message:',msg,'','Reply to this email to answer the customer. Track it in Admin ▸ Inquiries.'].join('\n')}); }catch(e){ console.error('INQUIRY_EMAIL_FAILED '+e); } }
  return {sent:true,inquiryId:id};
}
function inquiryView_(r){ return {inquiryId:s_(r.INQUIRY_ID),createdAt:iso_(r.CREATED_AT),status:up_(r.STATUS)||'NEW',name:s_(r.NAME),email:s_(r.EMAIL),phone:s_(str_(r.PHONE)),topic:up_(r.TOPIC),orderNumber:s_(str_(r.ORDER_NUMBER)),message:s_(r.MESSAGE),lang:s_(r.LANG),customerId:s_(r.CUSTOMER_ID),adminNote:s_(r.ADMIN_NOTE),updatedAt:iso_(r.UPDATED_AT)}; }
function adminInquiries_(q){
  var st=up_(q.status), term=lo_(q.search), all=rows_('INQUIRIES'), counts={}; INQUIRY_STATUSES.forEach(function(x){counts[x]=0;});
  all.forEach(function(r){ var x=up_(r.STATUS)||'NEW'; counts[x]=(counts[x]||0)+1; });
  var list=all.filter(function(r){ if(st&&st!=='ALL'&&(up_(r.STATUS)||'NEW')!==st) return false; return !term||[r.NAME,r.EMAIL,r.PHONE,r.ORDER_NUMBER,r.MESSAGE,r.TOPIC].some(function(v){return lo_(v).indexOf(term)>-1;}); })
    .sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);});
  return {total:list.length,counts:counts,statuses:INQUIRY_STATUSES,topics:INQUIRY_TOPICS,items:list.slice(0,500).map(inquiryView_)};
}

/* =====================================================================
 * 11b. AUTHENTICITY — random permanent customer serial + one card per confirmed order
 *   SERIAL_NUMBER (per customer, never changes)  → website #/verify/<serial>  = the owner's whole collection
 *   CARD_CODE     (per order, put in the QR)     → website #/card/<code>     = that order's card + designs
 * ===================================================================== */
var AUTH_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I → easy to type, 32 symbols
var AUTH_TIERS=['FOUNDER','MEMBER','CUSTOMER'];
/* Cryptographic randomness (SHA-256 of fresh UUIDs) → n characters, no pattern, no counter, no date. */
function randomCode_(n){ var out='', pool=[]; while(out.length<n){ if(!pool.length) pool=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Utilities.getUuid()+Math.random(),Utilities.Charset.UTF_8); out+=AUTH_ALPHABET.charAt((pool.shift()&255)%32); } return out; }
function normCode_(v){ return up_(v).replace(/[^A-Z0-9]/g,''); }
function newSerial_(){ for(var i=0;i<20;i++){ var c=randomCode_(12), sn='TMP-'+c.slice(0,4)+'-'+c.slice(4,8)+'-'+c.slice(8,12); if(!findSerial_(sn)) return sn; } throw err_('SERIAL_GENERATION_FAILED','Could not create a serial. Try again.'); }
function newCardCode_(){ for(var i=0;i<20;i++){ var c=randomCode_(12); if(!find_('AUTHENTICITY','CARD_CODE',c)) return c; } throw err_('CARD_CODE_GENERATION_FAILED','Could not create a card code. Try again.'); }
function findSerial_(sn){ var k=normCode_(sn); if(!k) return null; return rows_('CUSTOMERS').filter(function(c){return normCode_(c.SERIAL_NUMBER)===k;})[0]||rows_('AUTHENTICITY').filter(function(c){return normCode_(c.SERIAL_NUMBER)===k;})[0]||null; }
function ownerName_(full){ var parts=s_(full).split(/\s+/).filter(String); if(!parts.length) return 'Owner'; return parts[0].charAt(0).toUpperCase()+parts[0].slice(1)+(parts.length>1?'.'+parts[1].charAt(0).toUpperCase():''); }
function authLink_(code){ return s_(cfg_('CUSTOMER_SITE_URL','https://temporaryeg26-afk.github.io/order/')).replace(/#.*$/,'').replace(/\/?$/,'/')+'#/card/'+code; }
/* Creates the card for a confirmed order (idempotent). Serial = the customer's permanent one (created on first card). */
function ensureAuthCard_(orderId){
  var ex=find_('AUTHENTICITY','ORDER_ID',orderId); if(ex) return ex;
  var o=find_('ORDERS','ORDER_ID',orderId); if(!o) throw err_('ORDER_NOT_FOUND','Order not found.');
  var cust=find_('CUSTOMERS','CUSTOMER_ID',o.CUSTOMER_ID), serial=cust?s_(cust.SERIAL_NUMBER):'';
  var prev=rows_('AUTHENTICITY').filter(function(c){return s_(c.CUSTOMER_ID)===s_(o.CUSTOMER_ID)&&s_(o.CUSTOMER_ID);}).sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);})[0];
  if(!serial&&prev) serial=s_(prev.SERIAL_NUMBER);
  if(!serial){ serial=newSerial_(); }
  if(cust&&s_(cust.SERIAL_NUMBER)!==serial) patch_('CUSTOMERS',cust._row,{SERIAL_NUMBER:serial,UPDATED_AT:now_()});
  var tier=prev?up_(prev.TIER):up_(cfg_('NEW_CUSTOMER_TIER','FOUNDER')); if(AUTH_TIERS.indexOf(tier)<0) tier='CUSTOMER';
  var owner=prev&&s_(prev.OWNER_NAME)?s_(prev.OWNER_NAME):ownerName_(o.CUSTOMER_NAME||(cust&&cust.FULL_NAME));
  var items=where_('ORDER_ITEMS','ORDER_ID',orderId).map(function(i){ return s_(i.PRODUCT_NAME)+' · '+s_(i.DESIGN_NAME)+' · '+s_(i.COLOR)+' · '+s_(i.SIZE)+(num_(i.QUANTITY,1)>1?' ×'+num_(i.QUANTITY,1):''); }).join('\n');
  var code=newCardCode_(), t=now_(), row={CARD_ID:uuid_('CARD'),CREATED_AT:t,ORDER_NUMBER:T_(s_(o.ORDER_NUMBER)),OWNER_NAME:T_(owner),TIER:tier,SERIAL_NUMBER:serial,CARD_CODE:code,QR_LINK:authLink_(code),ITEMS:T_(items),CARD_IMAGE_URL:'',STATUS:'ACTIVE',SCANS:0,LAST_SCAN_AT:'',ORDER_ID:s_(orderId),CUSTOMER_ID:s_(o.CUSTOMER_ID),NOTES:'',UPDATED_AT:t};
  insert_('AUTHENTICITY',row); audit_('SYSTEM','AUTH','AUTH_CARD_CREATED','AUTHENTICITY',row.CARD_ID,null,{order:s_(o.ORDER_NUMBER),serial:serial},null);
  return find_('AUTHENTICITY','CARD_CODE',code);
}
var AUTH_LIVE=['CONFIRMED','PROCESSING','READY_FOR_DELIVERY','OUT_FOR_DELIVERY','SHIPPED','DELIVERED'];
function cardItemIds_(c){ return s_(c.ITEM_IDS).split(/[\s,]+/).filter(String); }
function cardLines_(c){ var ids=cardItemIds_(c), all=where_('ORDER_ITEMS','ORDER_ID',c.ORDER_ID); return ids.length?all.filter(function(i){return ids.indexOf(s_(i.ORDER_ITEM_ID))>-1;}):all; }
function itemsText_(lines){ return lines.map(function(i){ return s_(i.PRODUCT_NAME)+' · '+s_(i.DESIGN_NAME)+' · '+s_(i.COLOR)+' · '+s_(i.SIZE)+(num_(i.QUANTITY,1)>1?' ×'+num_(i.QUANTITY,1):''); }).join('\n'); }
function authItems_(orderId,onlyIds){
  var dAssets=rows_('DESIGN_ASSETS'), inv=inventoryMap_(), dmap={}, pmap={}, assets=rows_('PRODUCT_ASSETS'), sizes=rows_('PRODUCT_SIZES');
  return where_('ORDER_ITEMS','ORDER_ID',orderId).filter(function(i){ return !onlyIds||!onlyIds.length||onlyIds.indexOf(s_(i.ORDER_ITEM_ID))>-1; }).map(function(i){
    var did=s_(i.DESIGN_ID), pid=s_(i.PRODUCT_ID);
    if(did&&!dmap[did]){ var d=find_('DESIGNS','DESIGN_ID',did); dmap[did]=d?designView_(d,dAssets,inv,true):null; }
    if(pid&&!pmap[pid]){ var pr=find_('PRODUCTS','PRODUCT_ID',pid); pmap[pid]=pr?productView_(pr,assets,sizes,true):null; }
    var dv=dmap[did], pv=pmap[pid];
    return {productName:s_(i.PRODUCT_NAME),productNameAr:pv?pv.productNameAr:'',designName:s_(i.DESIGN_NAME),designNameAr:dv?dv.designNameAr:'',designCode:dv?dv.designCode:'',
      designUrl:dv?designUrlFor_(dv,i.DESIGN_SIDE):'',mockupUrl:pv?mockupUrlFor_(pv,i.COLOR):s_(i.MOCKUP_PREVIEW_URL),color:s_(i.COLOR),size:s_(i.SIZE),quantity:num_(i.QUANTITY,1),productionLimit:dv?dv.productionLimit:''};
  });
}
function cardPublic_(c,withItems){
  var o=find_('ORDERS','ORDER_ID',c.ORDER_ID), st=up_(c.STATUS)||'ACTIVE', live=st==='ACTIVE'&&(!o||AUTH_LIVE.indexOf(up_(o.ORDER_STATUS))>-1);
  var img=s_(c.CARD_IMAGE_URL), items=withItems&&live?authItems_(c.ORDER_ID,cardItemIds_(c)):[];
  return {standalone:!s_(c.ORDER_ID),cardCode:s_(c.CARD_CODE),orderNumber:s_(str_(c.ORDER_NUMBER)),ownerName:s_(c.OWNER_NAME),tier:up_(c.TIER)||'CUSTOMER',serial:s_(c.SERIAL_NUMBER),issuedAt:iso_(c.CREATED_AT),
    status:live?'ACTIVE':(st==='ACTIVE'?'INACTIVE':st),cardImageUrl:/^https:\/\//i.test(img)?img:'',scans:num_(c.SCANS,0),pieces:items.reduce(function(n,x){return n+x.quantity;},0),items:items};
}
/* Public: GET ?action=verify&code=<card code or serial>. Never returns email, phone or address. */
function verifyRoute_(prm){
  var code=normCode_(prm.code||prm.serial||''); if(code.length<8) return {found:false};
  var warnAt=cfgNum_('AUTH_SCAN_WARNING',40);
  var card=rows_('AUTHENTICITY').filter(function(c){return normCode_(c.CARD_CODE)===code;})[0];
  if(card){
    var cache=CacheService.getScriptCache(), ck='AUTH_SCAN_'+code;
    if(!cache.get(ck)){ cache.put(ck,'1',20); try{ withLock_(function(){ var f=find_('AUTHENTICITY','CARD_ID',card.CARD_ID); patch_('AUTHENTICITY',f._row,{SCANS:num_(f.SCANS,0)+1,LAST_SCAN_AT:now_()}); }); card=find_('AUTHENTICITY','CARD_ID',card.CARD_ID); }catch(_){} }
    var v=cardPublic_(card,true); v.found=true; v.kind='CARD'; v.warning=v.scans>warnAt; return v;
  }
  var cards=rows_('AUTHENTICITY').filter(function(c){return normCode_(c.SERIAL_NUMBER)===code;}).sort(function(a,b){return ms_(a.CREATED_AT)-ms_(b.CREATED_AT);});
  if(!cards.length) return {found:false};
  var list=cards.map(function(c){return cardPublic_(c,true);}), active=list.filter(function(x){return x.status==='ACTIVE';}), last=cards[cards.length-1];
  return {found:true,kind:'COLLECTION',serial:s_(last.SERIAL_NUMBER),ownerName:s_(last.OWNER_NAME),tier:up_(last.TIER)||'CUSTOMER',since:iso_(cards[0].CREATED_AT),status:active.length?'ACTIVE':'INACTIVE',
    pieces:active.reduce(function(n,x){return n+x.pieces;},0),cards:active.map(function(x){ delete x.scans; return x; })};
}
function adminAuthenticity_(q){
  var term=lo_(q.search), st=up_(q.status), ty=up_(q.type);
  var list=rows_('AUTHENTICITY').filter(function(c){ if(st&&st!=='ALL'&&(up_(c.STATUS)||'ACTIVE')!==st) return false; var sa=!s_(c.ORDER_ID); if(ty==='STANDALONE'&&!sa) return false; if(ty==='ORDER'&&sa) return false; return !term||[c.ORDER_NUMBER,c.OWNER_NAME,c.SERIAL_NUMBER,c.CARD_CODE,c.ITEMS].some(function(v){return lo_(v).indexOf(term)>-1;}); })
    .sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);});
  return {total:list.length,tiers:AUTH_TIERS,warnAt:cfgNum_('AUTH_SCAN_WARNING',40),siteUrl:s_(cfg_('CUSTOMER_SITE_URL','')),items:list.slice(0,500).map(function(c){ return {standalone:!s_(c.ORDER_ID),cardId:s_(c.CARD_ID),createdAt:iso_(c.CREATED_AT),orderNumber:s_(str_(c.ORDER_NUMBER)),orderId:s_(c.ORDER_ID),ownerName:s_(c.OWNER_NAME),tier:up_(c.TIER),serial:s_(c.SERIAL_NUMBER),cardCode:s_(c.CARD_CODE),qrLink:s_(c.QR_LINK)||authLink_(s_(c.CARD_CODE)),items:s_(c.ITEMS),lines:cardLines_(c).map(function(i){return {id:s_(i.ORDER_ITEM_ID),label:itemsText_([i])};}),cardImageUrl:s_(c.CARD_IMAGE_URL),status:up_(c.STATUS)||'ACTIVE',scans:num_(c.SCANS,0),lastScanAt:iso_(c.LAST_SCAN_AT),notes:s_(c.NOTES)}; })};
}
function w_saveAuthCard_(p,sess){
  var c=find_('AUTHENTICITY','CARD_ID',p.cardId); if(!c) throw err_('CARD_NOT_FOUND','Card not found.');
  var d={UPDATED_AT:now_()}, old=plain_(c);
  if('tier' in p){ var tr=up_(p.tier); if(AUTH_TIERS.indexOf(tr)<0) throw err_('TIER_INVALID','Tier must be FOUNDER, MEMBER or CUSTOMER.'); d.TIER=tr; }
  if('ownerName' in p) d.OWNER_NAME=T_(req_(p.ownerName,'OWNER_NAME_REQUIRED',60));
  if('cardImageUrl' in p){ var u=s_(p.cardImageUrl); if(u&&!/^https:\/\//i.test(u)) throw err_('CARD_IMAGE_URL_INVALID','The card image link must start with https://'); d.CARD_IMAGE_URL=u; }
  if('status' in p){ var s2=up_(p.status); if(['ACTIVE','CANCELLED'].indexOf(s2)<0) throw err_('CARD_STATUS_INVALID','Status must be ACTIVE or CANCELLED.'); d.STATUS=s2; }
  if('notes' in p) d.NOTES=T_(String(p.notes||'').slice(0,1000));
  patch_('AUTHENTICITY',c._row,d);
  if(p.applyToAll&&(d.TIER||d.OWNER_NAME)){ rows_('AUTHENTICITY').filter(function(x){return s_(x.SERIAL_NUMBER)===s_(c.SERIAL_NUMBER)&&s_(x.CARD_ID)!==s_(c.CARD_ID);}).forEach(function(x){ var e={UPDATED_AT:now_()}; if(d.TIER) e.TIER=d.TIER; if(d.OWNER_NAME) e.OWNER_NAME=d.OWNER_NAME; patch_('AUTHENTICITY',x._row,e); }); }
  audit_('ADMIN',sess.adminId,'AUTH_CARD_UPDATED','AUTHENTICITY',s_(c.CARD_ID),old,d,null);
  return {noRevision:true,saved:true};
}
/* Gift / split: move some pieces of an order to another person → new card + their own serial (new random, or an existing one). */
function w_splitAuthCard_(p,sess){
  var c=find_('AUTHENTICITY','CARD_ID',p.cardId); if(!c) throw err_('CARD_NOT_FOUND','Card not found.');
  if((up_(c.STATUS)||'ACTIVE')!=='ACTIVE') throw err_('CARD_NOT_ACTIVE','Only an active card can be split.');
  var lines=cardLines_(c), have=lines.map(function(i){return s_(i.ORDER_ITEM_ID);}), move=(Array.isArray(p.itemIds)?p.itemIds:[]).map(s_).filter(function(x){return have.indexOf(x)>-1;});
  if(!move.length) throw err_('SPLIT_ITEMS_REQUIRED','Choose the pieces that belong to the other person.');
  if(move.length>=have.length) throw err_('SPLIT_KEEP_ONE','Leave at least one piece on this card. To change the whole card, edit the owner name instead.');
  var owner=req_(p.ownerName,'OWNER_NAME_REQUIRED',60), tier=up_(p.tier)||up_(c.TIER); if(AUTH_TIERS.indexOf(tier)<0) throw err_('TIER_INVALID','Tier must be FOUNDER, MEMBER or CUSTOMER.');
  var serial=s_(p.serial).toUpperCase();
  if(serial){ var known=rows_('AUTHENTICITY').filter(function(x){return normCode_(x.SERIAL_NUMBER)===normCode_(serial);})[0]; if(!known) throw err_('SERIAL_NOT_FOUND','That serial number does not exist. Leave it empty to create a new one.'); serial=s_(known.SERIAL_NUMBER); }
  else serial=newSerial_();
  var keep=have.filter(function(x){return move.indexOf(x)<0;}), t=now_(), code=newCardCode_();
  patch_('AUTHENTICITY',c._row,{ITEM_IDS:keep.join(','),ITEMS:T_(itemsText_(lines.filter(function(i){return keep.indexOf(s_(i.ORDER_ITEM_ID))>-1;}))),UPDATED_AT:t});
  var row={CARD_ID:uuid_('CARD'),CREATED_AT:t,ORDER_NUMBER:T_(str_(c.ORDER_NUMBER)),OWNER_NAME:T_(owner),TIER:tier,SERIAL_NUMBER:serial,CARD_CODE:code,QR_LINK:authLink_(code),ITEMS:T_(itemsText_(lines.filter(function(i){return move.indexOf(s_(i.ORDER_ITEM_ID))>-1;}))),
    CARD_IMAGE_URL:'',STATUS:'ACTIVE',SCANS:0,LAST_SCAN_AT:'',ORDER_ID:s_(c.ORDER_ID),CUSTOMER_ID:'',NOTES:T_('Gift from '+s_(c.OWNER_NAME)+' ('+s_(c.SERIAL_NUMBER)+')'),UPDATED_AT:t,ITEM_IDS:move.join(',')};
  insert_('AUTHENTICITY',row);
  audit_('ADMIN',sess.adminId,'AUTH_CARD_SPLIT','AUTHENTICITY',s_(c.CARD_ID),{items:have},{kept:keep,moved:move,newCard:row.CARD_ID,serial:serial},null);
  return {noRevision:true,serial:serial,qrLink:row.QR_LINK,cardId:row.CARD_ID};
}
/* Upload a finished card image (from Admin) → Google Drive (public view link) → CARD_IMAGE_URL. Shown on the website when the QR is scanned. */
function authFolder_(){ var id=s_(cfg_('AUTH_CARDS_FOLDER_ID','')); if(id){ try{ return DriveApp.getFolderById(id); }catch(_){} }
  var f=DriveApp.createFolder('TEMPORARY™ Authenticity Cards'); setCfg_('AUTH_CARDS_FOLDER_ID',f.getId(),'Google Drive folder holding uploaded authenticity card images'); return f; }
function w_uploadAuthCardImage_(p,sess){
  var c=find_('AUTHENTICITY','CARD_ID',p.cardId); if(!c) throw err_('CARD_NOT_FOUND','Card not found.');
  var m=String(p.dataUrl||'').match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/); if(!m) throw err_('CARD_IMAGE_INVALID','Upload a PNG, JPG or WEBP image.');
  var bytes=Utilities.base64Decode(m[3]); if(bytes.length>8000000) throw err_('CARD_IMAGE_TOO_BIG','The image is bigger than 8 MB.');
  var name=('TEMPORARY-'+s_(c.SERIAL_NUMBER)+'-'+s_(str_(c.ORDER_NUMBER))).replace(/[^\w-]+/g,'_')+'.'+(m[2]==='jpeg'?'jpg':m[2]);
  var file=authFolder_().createFile(Utilities.newBlob(bytes,m[1],name));
  try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW); }catch(e){ throw err_('DRIVE_SHARING_BLOCKED','Google Drive did not allow public sharing of the image. Upload it to GitHub and paste the link instead.'); }
  var url='https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w2000';
  patch_('AUTHENTICITY',c._row,{CARD_IMAGE_URL:url,UPDATED_AT:now_()});
  audit_('ADMIN',sess.adminId,'AUTH_CARD_IMAGE_UPLOADED','AUTHENTICITY',s_(c.CARD_ID),{url:s_(c.CARD_IMAGE_URL)},{url:url,file:file.getId()},null);
  return {cardImageUrl:url,noRevision:true};
}
/* Standalone QR (QR Studio): a card with its own random link, not linked to any order — for tests, events, displays. */
function w_createStandaloneCard_(p,sess){
  var label=req_(p.label,'LABEL_REQUIRED',60), code=newCardCode_(), t=now_();
  var row={CARD_ID:uuid_('CARD'),CREATED_AT:t,ORDER_NUMBER:'STANDALONE',OWNER_NAME:T_(label),TIER:'',SERIAL_NUMBER:'',CARD_CODE:code,QR_LINK:authLink_(code),ITEMS:'',CARD_IMAGE_URL:'',STATUS:'ACTIVE',SCANS:0,LAST_SCAN_AT:'',ORDER_ID:'',CUSTOMER_ID:'',NOTES:T_('Standalone QR · created in QR Studio'),UPDATED_AT:t,ITEM_IDS:''};
  insert_('AUTHENTICITY',row); audit_('ADMIN',sess.adminId,'STANDALONE_QR_CREATED','AUTHENTICITY',row.CARD_ID,null,{label:label},null);
  var out={cardId:row.CARD_ID,qrLink:row.QR_LINK,cardCode:code,noRevision:true};
  if(p.dataUrl){ var up=w_uploadAuthCardImage_({cardId:row.CARD_ID,dataUrl:p.dataUrl},sess); out.cardImageUrl=up.cardImageUrl; }
  return out;
}
function w_createAuthCards_(p,sess){ var n=backfillAuthCards_(); audit_('ADMIN',sess.adminId,'AUTH_CARDS_BACKFILLED','AUTHENTICITY','ALL',null,{created:n},null); return {created:n,noRevision:true}; }
function backfillAuthCards_(){ var n=0; rows_('ORDERS').filter(function(o){return AUTH_LIVE.indexOf(up_(o.ORDER_STATUS))>-1&&!find_('AUTHENTICITY','ORDER_ID',o.ORDER_ID);}).sort(function(a,b){return ms_(a.CREATED_AT)-ms_(b.CREATED_AT);}).forEach(function(o){ try{ ensureAuthCard_(o.ORDER_ID); n++; }catch(e){ console.error('BACKFILL '+o.ORDER_ID+' '+e); } }); return n; }

/* =====================================================================
 * 12. ADMIN AUTH + PERMISSIONS
 * ===================================================================== */
function adminPublic_(a){ return {adminId:s_(a.ADMIN_ID),email:s_(a.EMAIL),displayName:s_(a.DISPLAY_NAME),role:up_(a.ROLE),active:bool_(a.ACTIVE,false),updatedAt:iso_(a.UPDATED_AT)}; }
function adminLogin_(p){
  var g=verifyGoogle_(p.credential), a=find_('ADMIN_USERS','EMAIL',g.email);
  if(!a) throw err_('ADMIN_ACCESS_DENIED','This Google account is not an admin.');
  if(!bool_(a.ACTIVE,false)) throw err_('ADMIN_ACCOUNT_INACTIVE','This admin account is disabled.');
  if(ROLES.indexOf(up_(a.ROLE))===-1) throw err_('ADMIN_ROLE_INVALID','Admin role is invalid.');
  return withLock_(function(){
    var raw=token_(), t=now_(), exp=new Date(t.getTime()+cfgNum_('ADMIN_SESSION_HOURS',12)*3600000);
    insert_('ADMIN_SESSIONS',{SESSION_ID:uuid_('ASES'),ADMIN_ID:a.ADMIN_ID,SESSION_TOKEN_HASH:hash_(raw),DEVICE_ID:'ADMIN_CONSOLE',EXPIRES_AT:exp,LAST_SEEN_AT:t,CREATED_AT:t,UPDATED_AT:t});
    audit_('ADMIN',a.ADMIN_ID,'ADMIN_LOGIN','ADMIN',a.ADMIN_ID,null,null,null);
    return {sessionToken:raw,expiresAt:exp.toISOString(),admin:adminPublic_(a)};
  });
}
function adminSession_(p){
  var raw=s_(p&&(p.adminSessionToken||p.sessionToken)); if(!raw) throw err_('ADMIN_AUTH_REQUIRED','Admin sign-in required.');
  var h=hash_(raw), s=rows_('ADMIN_SESSIONS').filter(function(r){return safeEq_(s_(r.SESSION_TOKEN_HASH),h);})[0];
  if(!s||s_(s.REVOKED_AT)||ms_(s.EXPIRES_AT)<=Date.now()) throw err_('ADMIN_SESSION_INVALID','Admin session ended. Please sign in again.');
  var a=find_('ADMIN_USERS','ADMIN_ID',s.ADMIN_ID); if(!a||!bool_(a.ACTIVE,false)) throw err_('ADMIN_ACCOUNT_INACTIVE','This admin account is disabled.');
  return {session:s,admin:a,adminId:s_(a.ADMIN_ID),role:up_(a.ROLE)};
}
function need_(sess,perm){ if((PERMS[perm]||[]).indexOf(sess.role)===-1) throw err_('ADMIN_PERMISSION_DENIED','Your role ('+sess.role+') cannot do this.'); }

/* =====================================================================
 * 13. ADMIN READS
 * ===================================================================== */
function orderAdmin_(o,payMap){
  var pay=payMap?payMap[s_(o.ORDER_ID)]:null;
  return {orderId:s_(o.ORDER_ID),orderNumber:s_(o.ORDER_NUMBER),customerId:s_(o.CUSTOMER_ID),customerName:s_(o.CUSTOMER_NAME),email:s_(o.EMAIL),phone:s_(o.PHONE),orderStatus:up_(o.ORDER_STATUS),
    paymentMethod:s_(o.PAYMENT_METHOD),paymentStatus:pay?up_(pay.PAYMENT_STATUS):up_(o.PAYMENT_STATUS),paymentId:pay?s_(pay.PAYMENT_ID):'',total:num_(o.TOTAL,0),currency:s_(o.CURRENCY),deliveryFee:num_(o.DELIVERY_FEE,0),
    deliveryGovernorate:s_(o.DELIVERY_GOVERNORATE),deliveryArea:s_(o.DELIVERY_AREA),deliveryAddress:s_(o.DELIVERY_ADDRESS),createdAt:iso_(o.CREATED_AT),updatedAt:iso_(o.UPDATED_AT),allowedTransitions:STATUS_FLOW[up_(o.ORDER_STATUS)]||[]};
}
function payMap_(){ var m={}; rows_('PAYMENTS').forEach(function(p){ var k=s_(p.ORDER_ID); if(!m[k]||ms_(p.UPDATED_AT)>ms_(m[k].UPDATED_AT)) m[k]=p; }); return m; }
function recognizedRevenue_(orders){ return money_(orders.filter(function(o){return REVENUE_STATUSES.indexOf(up_(o.ORDER_STATUS))>-1;}).reduce(function(n,o){return n+num_(o.TOTAL,0);},0)); }
function adminDashboard_(sess){
  var orders=rows_('ORDERS'), pm=payMap_(), by={}; Object.keys(STATUS_FLOW).forEach(function(k){by[k]=0;}); orders.forEach(function(o){ var st=up_(o.ORDER_STATUS); by[st]=(by[st]||0)+1; });
  var since30=Date.now()-30*86400000, recent30=orders.filter(function(o){return ms_(o.CREATED_AT)>=since30;});
  var views=rows_('ANALYTICS_EVENTS').filter(function(e){return up_(e.TYPE)==='PRODUCT_VIEW'&&ms_(e.CREATED_AT)>=since30;}).length;
  var inv=inventoryMap_(), low=rows_('DESIGNS').filter(on_).map(function(d){var i=inv[s_(d.DESIGN_ID)]||{};return {designId:s_(d.DESIGN_ID),designName:s_(d.DESIGN_NAME),remaining:i.remaining,productionLimit:i.productionLimit,status:i.status};}).filter(function(x){return x.remaining!=null&&x.remaining<=10;});
  var newInq=rows_('INQUIRIES').filter(function(r){return (up_(r.STATUS)||'NEW')==='NEW';}).length;
  return {viewer:adminPublic_(sess.admin),metrics:{newInquiries:newInq,orders:orders.length,byStatus:by,revenue:recognizedRevenue_(orders),revenue30:recognizedRevenue_(recent30),orders30:recent30.length,customers:rows_('CUSTOMERS').length,
      activeCarts:rows_('CARTS').filter(function(c){return up_(c.STATUS)==='ACTIVE';}).length,pendingPayments:Object.keys(pm).filter(function(k){return up_(pm[k].PAYMENT_STATUS)==='PENDING';}).length,productViews30:views,conversion30:views?recent30.filter(function(o){return REVENUE_STATUSES.indexOf(up_(o.ORDER_STATUS))>-1;}).length/views:0},
    currency:s_(cfg_('CURRENCY','EGP')),recentOrders:orders.slice().sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);}).slice(0,8).map(function(o){return orderAdmin_(o,pm);}),
    recentActivity:rows_('AUDIT_LOG').slice().sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);}).slice(0,8).map(plain_),lowInventory:low,health:health_(false),revision:revision_()};
}
function adminOrders_(q){
  var pm=payMap_(), term=lo_(q.search), st=up_(q.status);
  var list=rows_('ORDERS').filter(function(o){ if(st&&st!=='ALL'&&up_(o.ORDER_STATUS)!==st) return false; if(!term) return true; return [o.ORDER_ID,o.ORDER_NUMBER,o.CUSTOMER_NAME,o.EMAIL,o.PHONE].some(function(v){return lo_(v).indexOf(term)>-1;}); })
    .sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);});
  return {total:list.length,items:list.slice(0,Math.min(500,num_(q.limit,200))).map(function(o){return orderAdmin_(o,pm);})};
}
function adminOrderDetail_(id){
  var o=find_('ORDERS','ORDER_ID',id); if(!o) throw err_('ORDER_NOT_FOUND','Order not found.');
  var pm=payMap_(), dAssets=rows_('DESIGN_ASSETS'), inv=inventoryMap_(), dmap={}; rows_('DESIGNS').forEach(function(d){dmap[s_(d.DESIGN_ID)]=designView_(d,dAssets,inv,true);});
  var items=where_('ORDER_ITEMS','ORDER_ID',id).map(function(i){ var x=plain_(i); var d=dmap[s_(i.DESIGN_ID)]; x.designAssetUrl=d?designUrlFor_(d,i.DESIGN_SIDE):''; return x; });
  return {order:orderAdmin_(o,pm),items:items,payment:pm[s_(id)]?plain_(pm[s_(id)]):null,confirmation:(function(c){return c?plain_(c):null;})(find_('ORDER_CONFIRMATIONS','ORDER_ID',id)),
    customer:(function(c){return c?customerPublic_(c):null;})(find_('CUSTOMERS','CUSTOMER_ID',o.CUSTOMER_ID)),history:where_('AUDIT_LOG','ENTITY_ID',id).map(plain_)};
}
function adminCustomers_(q){
  var term=lo_(q.search), orders=rows_('ORDERS'), byC={};
  orders.forEach(function(o){ var k=s_(o.CUSTOMER_ID); byC[k]=byC[k]||{n:0,spend:0}; byC[k].n++; if(REVENUE_STATUSES.indexOf(up_(o.ORDER_STATUS))>-1) byC[k].spend+=num_(o.TOTAL,0); });
  var list=rows_('CUSTOMERS').filter(function(c){ return !term||[c.CUSTOMER_ID,c.EMAIL,c.FULL_NAME,c.PHONE].some(function(v){return lo_(v).indexOf(term)>-1;}); }).sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);});
  return {total:list.length,items:list.slice(0,500).map(function(c){ var x=customerPublic_(c), s=byC[s_(c.CUSTOMER_ID)]||{n:0,spend:0}; x.orders=s.n; x.totalSpend=money_(s.spend); x.createdAt=iso_(c.CREATED_AT); x.lastLoginAt=iso_(c.LAST_LOGIN_AT); return x; })};
}
function adminCustomerDetail_(id){
  var c=find_('CUSTOMERS','CUSTOMER_ID',id); if(!c) throw err_('CUSTOMER_NOT_FOUND','Customer not found.'); var pm=payMap_();
  return {customer:customerPublic_(c),orders:where_('ORDERS','CUSTOMER_ID',id).sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);}).map(function(o){return orderAdmin_(o,pm);}),
    cart:cartPayload_(rows_('CARTS').filter(function(x){return s_(x.CUSTOMER_ID)===s_(id)&&up_(x.STATUS)==='ACTIVE';})[0]||null)};
}
function adminAnalytics_(q){
  var days=Math.max(1,Math.min(3650,num_(q.days,30))), since=Date.now()-days*86400000;
  var orders=rows_('ORDERS').filter(function(o){return ms_(o.CREATED_AT)>=since;}), rec={}; orders.forEach(function(o){ if(REVENUE_STATUSES.indexOf(up_(o.ORDER_STATUS))>-1) rec[s_(o.ORDER_ID)]=1; });
  var ev={}; rows_('ANALYTICS_EVENTS').forEach(function(e){ if(ms_(e.CREATED_AT)>=since){ var t=up_(e.TYPE); ev[t]=(ev[t]||0)+1; } });
  var b={product:{},design:{},color:{},size:{}}, units=0;
  rows_('ORDER_ITEMS').forEach(function(i){ if(!rec[s_(i.ORDER_ID)]) return; var q2=num_(i.QUANTITY,0), lt=num_(i.LINE_TOTAL,0); units+=q2;
    [['product',s_(i.PRODUCT_NAME)],['design',s_(i.DESIGN_NAME)],['color',s_(i.COLOR)],['size',s_(i.SIZE)]].forEach(function(x){ var m=b[x[0]]; m[x[1]]=m[x[1]]||{units:0,revenue:0}; m[x[1]].units+=q2; m[x[1]].revenue+=lt; }); });
  function top(m){ return Object.keys(m).map(function(k){return {name:k||'—',units:m[k].units,revenue:money_(m[k].revenue)};}).sort(function(a,b){return b.revenue-a.revenue;}).slice(0,12); }
  var recOrders=orders.filter(function(o){return rec[s_(o.ORDER_ID)];}), revenue=recognizedRevenue_(orders);
  var visitors={}; rows_('ANALYTICS_EVENTS').forEach(function(e){ if(ms_(e.CREATED_AT)>=since&&up_(e.TYPE)==='PAGE_VIEW') visitors[s_(e.SESSION_ID)||s_(e.EVENT_ID)]=1; });
  return {days:days,currency:s_(cfg_('CURRENCY','EGP')),metrics:{visitors:Object.keys(visitors).length,pageViews:ev.PAGE_VIEW||0,productViews:ev.PRODUCT_VIEW||0,customizeStarts:ev.CUSTOMIZE_START||0,addsToCart:ev.ADD_TO_CART||0,checkoutStarts:ev.CHECKOUT_STARTED||0,
    ordersCreated:orders.length,ordersRecognized:recOrders.length,canceled:orders.filter(function(o){return up_(o.ORDER_STATUS)==='CANCELED';}).length,revenue:revenue,units:units,aov:recOrders.length?money_(revenue/recOrders.length):0,conversion:(ev.PRODUCT_VIEW?recOrders.length/ev.PRODUCT_VIEW:0)},
    breakdown:{product:top(b.product),design:top(b.design),color:top(b.color),size:top(b.size)}};
}
function adminSettings_(){
  var keys=['SITE_LOGIN_REQUIRED','STORE_MODE','COD_ENABLED','CONFIRMATION_HOURS','CURRENCY','SESSION_HOURS','ADMIN_SESSION_HOURS','CUSTOMER_SITE_URL','CONFIRMATION_PAGE_URL','ALLOWED_ASSET_ORIGINS','ALLOWED_PARENT_ORIGINS','LOGO_ASSET_URL','LOGO_PRINT_CM','MAX_QTY_PER_LINE','MAX_CART_QTY','BRAND_NAME','ORDER_CONFIRMATION_EMAIL_ENABLED','ADMIN_NOTIFICATION_EMAILS','ADMIN_NEW_ORDER_NOTIFICATIONS','PAYMOB_ENABLED','PAYMOB_MODE','PAYMOB_PAYMENT_MINUTES','SHOW_PIECES_LEFT','PIECES_LEFT_MAX','DROP_NAME','DROP_NAME_AR','META_PIXEL_ID','DELIVERY_WORKING_DAYS'];
  var o={}; keys.forEach(function(k){o[k]=s_(cfg_(k,''));}); o.SITE_REVISION=revision_(); o.PAYMOB=pmStatus_(); return o;
}
function health_(deep){
  var ss=db_(), missing=Object.keys(SCHEMA).filter(function(n){return !ss.getSheetByName(n);}), missingCols={};
  Object.keys(SCHEMA).forEach(function(n){ if(missing.indexOf(n)>-1) return; var h=table_(n).headers; var m=SCHEMA[n].filter(function(c){return h.indexOf(c)===-1;}); if(m.length) missingCols[n]=m; });
  var trig=ScriptApp.getProjectTriggers().map(function(t){return t.getHandlerFunction();}), quota=null; try{quota=MailApp.getRemainingDailyQuota();}catch(_){}
  var out={status:(missing.length||Object.keys(missingCols).length)?'DEGRADED':'OPERATIONAL',missingSheets:missing,missingColumns:missingCols,minuteJob:trig.indexOf('TEMPORARY_MINUTE_JOB')>-1,dailyJob:trig.indexOf('TEMPORARY_DAILY_JOB')>-1,emailQuota:quota,revision:revision_(),serverTime:new Date().toISOString()};
  if(deep&&!missing.length){ out.missingPlacements=missingPlacements_().length; out.activeDeliveryZones=deliveryZones_(false).length; out.owners=rows_('ADMIN_USERS').filter(function(a){return up_(a.ROLE)==='OWNER'&&bool_(a.ACTIVE,false);}).length; }
  return out;
}
function missingPlacements_(){
  var pm=placementMap_(), out=[], logoCm=cfgNum_('LOGO_PRINT_CM',7), cat=catalog_(false);
  cat.products.forEach(function(p){ p.colors.forEach(function(c){
    cat.designs.forEach(function(d){ ['FRONT','BACK'].forEach(function(side){ [20,30].forEach(function(ps){ if(!pm[placementKey_(p.productId,c,'DESIGN',d.designId,side,ps)]) out.push({productId:p.productId,productName:p.productName,color:c,artworkType:'DESIGN',designId:d.designId,side:side,printSize:ps}); }); }); });
    ['FRONT','BACK'].forEach(function(side){ if(!pm[placementKey_(p.productId,c,'LOGO','',side,logoCm)]) out.push({productId:p.productId,productName:p.productName,color:c,artworkType:'LOGO',designId:'',side:side,printSize:logoCm}); });
  }); });
  return out;
}

/* =====================================================================
 * 14. ADMIN WRITES (each runs inside the write pipeline in adminWrite_)
 * ===================================================================== */
function checkAssetUrl_(url){
  var u=req_(url,'ASSET_URL_REQUIRED',2000); if(!/^https:\/\//i.test(u)) throw err_('ASSET_URL_INVALID','Asset URL must start with https://');
  var allowed=list_(cfg_('ALLOWED_ASSET_ORIGINS',''));
  if(allowed.length&&!allowed.some(function(o){return u.indexOf(o)===0;})) throw err_('ASSET_URL_NOT_ALLOWED','Asset URL must start with one of: '+allowed.join(', '));
  return u;
}
function upsert_(sheet,idCol,id,data,prefix){
  var t=now_(), row=id?find_(sheet,idCol,id):null, old=row?plain_(row):null;
  if(row){ data.UPDATED_AT=t; patch_(sheet,row._row,data); return {id:s_(id),old:old,created:false}; }
  var nid=id||uuid_(prefix); data[idCol]=nid; data.CREATED_AT=t; data.UPDATED_AT=t; insert_(sheet,data); return {id:nid,old:null,created:true};
}
function pick_(p,map){ var o={}; Object.keys(map).forEach(function(k){ if(Object.prototype.hasOwnProperty.call(p,k)) o[map[k]]=p[k]; }); return o; }

function w_saveProduct_(p,sess){
  var d=pick_(p,{productCode:'PRODUCT_CODE',productName:'PRODUCT_NAME',productNameAr:'PRODUCT_NAME_AR',productType:'PRODUCT_TYPE',category:'CATEGORY',description:'DESCRIPTION',descriptionAr:'DESCRIPTION_AR',material:'MATERIAL',fit:'FIT',gsm:'GSM',construction:'CONSTRUCTION',careEn:'CARE_EN',careAr:'CARE_AR',
    tagline:'TAGLINE',taglineAr:'TAGLINE_AR',materialAr:'MATERIAL_AR',lining:'LINING',liningAr:'LINING_AR',fitAr:'FIT_AR',fitNote:'FIT_NOTE',fitNoteAr:'FIT_NOTE_AR',constructionAr:'CONSTRUCTION_AR',sizeChartType:'SIZE_CHART_TYPE'});
  Object.keys(d).forEach(function(k){ d[k]=s_(d[k]); }); if(d.PRODUCT_TYPE) d.PRODUCT_TYPE=up_(d.PRODUCT_TYPE); if(d.CATEGORY) d.CATEGORY=up_(d.CATEGORY);
  if('SIZE_CHART_TYPE' in d){ d.SIZE_CHART_TYPE=up_(d.SIZE_CHART_TYPE); if(['','WEIGHT','AGE'].indexOf(d.SIZE_CHART_TYPE)<0) throw err_('SIZE_CHART_TYPE_INVALID','Size chart type must be WEIGHT or AGE.'); }
  ['PRODUCT_NAME','PRODUCT_NAME_AR','PRODUCT_CODE','DESCRIPTION','DESCRIPTION_AR','MATERIAL','MATERIAL_AR','LINING','LINING_AR','FIT','FIT_AR','FIT_NOTE','FIT_NOTE_AR','GSM','CONSTRUCTION','CONSTRUCTION_AR','CARE_EN','CARE_AR','TAGLINE','TAGLINE_AR'].forEach(function(k){ if(k in d) d[k]=T_(d[k]); });
  if('careIcons' in p){ var icons=(Array.isArray(p.careIcons)?p.careIcons:s_(p.careIcons).split(/[\s,]+/)).map(up_).filter(String); icons.forEach(function(c){ if(CARE_ICON_CODES.indexOf(c)<0) throw err_('CARE_ICON_INVALID','Unknown care icon '+c); }); d.CARE_ICONS=icons.join(','); }
  if('fabricImageUrl' in p) d.FABRIC_IMAGE_URL=s_(p.fabricImageUrl)?checkAssetUrl_(p.fabricImageUrl):'';
  if('price' in p) d.PRICE=money_(clamp_(p.price,0,1000000,'PRODUCT_PRICE_INVALID'));
  if('active' in p) d.ACTIVE=bool_(p.active,true)?'TRUE':'FALSE';
  if('displayOrder' in p) d.DISPLAY_ORDER=num_(p.displayOrder,999);
  if(!s_(p.productId)){ req_(d.PRODUCT_NAME,'PRODUCT_NAME_REQUIRED'); if(d.PRICE==null) throw err_('PRODUCT_PRICE_REQUIRED','Price is required.'); d.CURRENCY=s_(cfg_('CURRENCY','EGP')); if(!d.ACTIVE) d.ACTIVE='FALSE'; }
  else if(!find_('PRODUCTS','PRODUCT_ID',p.productId)) throw err_('PRODUCT_NOT_FOUND','Product not found.');
  var r=upsert_('PRODUCTS','PRODUCT_ID',s_(p.productId),d,'PRD');
  if('productName' in p) rows_('COLLECTION_MOCKUP_PLACEMENTS').filter(function(x){return s_(x.PRODUCT_ID)===r.id;}).forEach(function(x){ patch_('COLLECTION_MOCKUP_PLACEMENTS',x._row,{PRODUCT_NAME:d.PRODUCT_NAME}); });
  audit_('ADMIN',sess.adminId,r.created?'PRODUCT_CREATED':'PRODUCT_UPDATED','PRODUCT',r.id,r.old,d,null);
  return {product:productById_(r.id,true)};
}
function w_saveProductAsset_(p,sess){
  var pid=req_(p.productId,'PRODUCT_ID_REQUIRED'); if(!find_('PRODUCTS','PRODUCT_ID',pid)) throw err_('PRODUCT_NOT_FOUND','Product not found.');
  var d={PRODUCT_ID:pid,COLOR:req_(p.color,'COLOR_REQUIRED',60),ASSET_TYPE:up_(p.assetType)||'MOCKUP',ASSET_PATH:s_(p.assetPath),ASSET_URL:checkAssetUrl_(p.assetUrl),ACTIVE:bool_(p.active,true)?'TRUE':'FALSE',DISPLAY_ORDER:num_(p.displayOrder,999)};
  var r=upsert_('PRODUCT_ASSETS','ASSET_ID',s_(p.assetId),d,'AST');
  audit_('ADMIN',sess.adminId,r.created?'PRODUCT_ASSET_CREATED':'PRODUCT_ASSET_UPDATED','PRODUCT_ASSET',r.id,r.old,d,null);
  return {product:productById_(pid,true)};
}
function w_saveProductSize_(p,sess){
  var pid=req_(p.productId,'PRODUCT_ID_REQUIRED'); if(!find_('PRODUCTS','PRODUCT_ID',pid)) throw err_('PRODUCT_NOT_FOUND','Product not found.');
  function opt(v){ return v===''||v==null?'':clamp_(v,0,500,'SIZE_VALUE_INVALID'); }
  var d={PRODUCT_ID:pid,SIZE_LABEL:req_(p.sizeLabel,'SIZE_LABEL_REQUIRED',30),WIDTH_CM:opt(p.widthCm),LENGTH_CM:opt(p.lengthCm),AVG_WEIGHT_MIN_KG:opt(p.avgWeightMinKg),AVG_WEIGHT_MAX_KG:opt(p.avgWeightMaxKg),AGE_MIN_YEARS:opt(p.ageMinYears),AGE_MAX_YEARS:opt(p.ageMaxYears),ACTIVE:bool_(p.active,true)?'TRUE':'FALSE',DISPLAY_ORDER:num_(p.displayOrder,999)};
  var existing=s_(p.sizeId)||s_((rows_('PRODUCT_SIZES').filter(function(x){return s_(x.PRODUCT_ID)===pid&&lo_(x.SIZE_LABEL)===lo_(d.SIZE_LABEL);})[0]||{}).SIZE_ID);
  var r=upsert_('PRODUCT_SIZES','SIZE_ID',existing,d,'SIZ');
  audit_('ADMIN',sess.adminId,r.created?'PRODUCT_SIZE_CREATED':'PRODUCT_SIZE_UPDATED','PRODUCT_SIZE',r.id,r.old,d,null);
  return {product:productById_(pid,true)};
}
function w_saveDesign_(p,sess){
  var d=pick_(p,{designCode:'DESIGN_CODE',designName:'DESIGN_NAME',designNameAr:'DESIGN_NAME_AR',description:'DESCRIPTION',descriptionAr:'DESCRIPTION_AR'}); Object.keys(d).forEach(function(k){d[k]=s_(d[k]);});
  if('active' in p) d.ACTIVE=bool_(p.active,true)?'TRUE':'FALSE'; if('displayOrder' in p) d.DISPLAY_ORDER=num_(p.displayOrder,999);
  if(!s_(p.designId)){ req_(d.DESIGN_NAME,'DESIGN_NAME_REQUIRED'); if(!d.ACTIVE) d.ACTIVE='FALSE'; }
  else if(!find_('DESIGNS','DESIGN_ID',p.designId)) throw err_('DESIGN_NOT_FOUND','Design not found.');
  var r=upsert_('DESIGNS','DESIGN_ID',s_(p.designId),d,'DSN');
  ensureInventoryRows_(); if('productionLimit' in p) w_saveInventory_({designId:r.id,productionLimit:p.productionLimit},sess); refreshInventory_();
  audit_('ADMIN',sess.adminId,r.created?'DESIGN_CREATED':'DESIGN_UPDATED','DESIGN',r.id,r.old,d,null);
  return {design:designById_(r.id,true)};
}
function w_saveDesignAsset_(p,sess){
  var did=req_(p.designId,'DESIGN_ID_REQUIRED'); if(!find_('DESIGNS','DESIGN_ID',did)) throw err_('DESIGN_NOT_FOUND','Design not found.');
  var side=up_(p.side); if(side&&['FRONT','BACK'].indexOf(side)===-1) throw err_('INVALID_SIDE','Side must be FRONT, BACK or empty.');
  var d={DESIGN_ID:did,SIDE:side,ASSET_TYPE:up_(p.assetType)||'DESIGN',ASSET_PATH:s_(p.assetPath),ASSET_URL:checkAssetUrl_(p.assetUrl),ACTIVE:bool_(p.active,true)?'TRUE':'FALSE',DISPLAY_ORDER:num_(p.displayOrder,999)};
  var r=upsert_('DESIGN_ASSETS','ASSET_ID',s_(p.assetId),d,'ASTD');
  audit_('ADMIN',sess.adminId,r.created?'DESIGN_ASSET_CREATED':'DESIGN_ASSET_UPDATED','DESIGN_ASSET',r.id,r.old,d,null);
  return {design:designById_(did,true)};
}
function w_saveInventory_(p,sess){
  var did=req_(p.designId,'DESIGN_ID_REQUIRED'); ensureInventoryRows_(); var r=find_('DESIGN_INVENTORY','DESIGN_ID',did); if(!r) throw err_('DESIGN_NOT_FOUND','Design not found.');
  var old=plain_(r), d={UPDATED_AT:now_()};
  if('productionLimit' in p){ var lim=Math.floor(clamp_(p.productionLimit,0,1000000,'PRODUCTION_LIMIT_INVALID')); if(lim<num_(r.SOLD,0)) throw err_('PRODUCTION_LIMIT_BELOW_SOLD','Limit cannot be below sold units ('+num_(r.SOLD,0)+').'); d.PRODUCTION_LIMIT=lim; }
  if('manualSoldOut' in p) d.MANUAL_SOLD_OUT=bool_(p.manualSoldOut,false)?'TRUE':'FALSE';
  patch_('DESIGN_INVENTORY',r._row,d); refreshInventory_();
  audit_('ADMIN',sess.adminId,'INVENTORY_UPDATED','DESIGN_INVENTORY',did,old,d,null);
  return {inventory:inventoryMap_()[did]};
}
function geom_(g,min,max){ return {width:clamp_(g.width,0.1,max,'WIDTH_INVALID'),height:clamp_(g.height==null||g.height===''?g.width:g.height,0.1,max,'HEIGHT_INVALID'),top:clamp_(g.top,min,max,'TOP_INVALID'),left:clamp_(g.left,min,max,'LEFT_INVALID'),rotation:clamp_(g.rotation||0,-360,360,'ROTATION_INVALID'),opacity:clamp_(g.opacity==null?1:g.opacity,0,1,'OPACITY_INVALID')}; }
function w_savePlacements_(p,sess){
  var input=Array.isArray(p.placements)?p.placements:[]; if(!input.length) throw err_('PLACEMENTS_INPUT_REQUIRED','No placement changes to save.');
  var logoCm=cfgNum_('LOGO_PRINT_CM',7), expanded=[], products={};
  input.forEach(function(x){
    var pid=req_(x.productId,'PRODUCT_ID_REQUIRED'); var prod=products[pid]||(products[pid]=productById_(pid,true)); if(!prod) throw err_('PRODUCT_NOT_FOUND','Product not found.');
    var type=up_(x.artworkType); if(['DESIGN','LOGO'].indexOf(type)===-1) throw err_('INVALID_ARTWORK_TYPE','Layer must be DESIGN or LOGO.');
    var side=up_(x.side); if(['FRONT','BACK'].indexOf(side)===-1) throw err_('INVALID_SIDE','Side must be FRONT or BACK.');
    var did=type==='LOGO'?'':req_(x.designId,'DESIGN_ID_REQUIRED'); if(did&&!find_('DESIGNS','DESIGN_ID',did)) throw err_('DESIGN_NOT_FOUND','Design not found.');
    var ps=type==='LOGO'?logoCm:Number(x.printSize); if(type==='DESIGN'&&[20,30].indexOf(ps)===-1) throw err_('INVALID_PRINT_SIZE','Print size must be 20 or 30.');
    var g=geom_(x,0,100), colors=bool_(x.applyAllColors||p.applyAllColors,false)?prod.colors:[matchChoice_(x.color,prod.colors,'INVALID_COLOR')];
    colors.forEach(function(c){ expanded.push({productId:pid,color:c,artworkType:type,designId:did,side:side,printSize:ps,g:g,active:x.active!==false}); });
  });
  var seen={}, byKey={}, saved=[], olds=[];
  rows_('PLACEMENTS').forEach(function(r){ var k=placementKey_(r.PRODUCT_ID,r.COLOR,r.ARTWORK_TYPE||(s_(r.DESIGN_ID)?'DESIGN':'LOGO'),r.DESIGN_ID,r.SIDE,r.PRINT_SIZE); if(!byKey[k]) byKey[k]=r; });
  var t=now_(), inserts=[];
  expanded.forEach(function(x){
    var k=placementKey_(x.productId,x.color,x.artworkType,x.designId,x.side,x.printSize); if(seen[k]) return; seen[k]=1;
    var d={PRODUCT_ID:x.productId,DESIGN_ID:x.designId,COLOR:x.color,ARTWORK_TYPE:x.artworkType,SIDE:x.side,PRINT_SIZE:x.printSize,PRINT_WIDTH_CM:x.printSize,PRINT_HEIGHT_CM:x.printSize,WIDTH:x.g.width,HEIGHT:x.g.height,TOP:x.g.top,LEFT:x.g.left,ROTATION:x.g.rotation,OPACITY:x.g.opacity,ACTIVE:x.active?'TRUE':'FALSE',UPDATED_AT:t};
    var ex=byKey[k];
    if(ex){ olds.push(placementView_(ex)); patch_('PLACEMENTS',ex._row,d); d.PLACEMENT_ID=s_(ex.PLACEMENT_ID); }
    else { d.PLACEMENT_ID=uuid_('PLC'); d.NOTES='ADMIN'; inserts.push(d); }
    saved.push(placementView_(d));
  });
  insertMany_('PLACEMENTS',inserts);
  audit_('ADMIN',sess.adminId,'PLACEMENTS_SAVED','PLACEMENT',saved.length+' rows',olds,saved,{created:inserts.length});
  return {savedCount:saved.length,placements:saved};
}
function w_saveCollectionMockups_(p,sess){
  var input=Array.isArray(p.items)?p.items:[]; if(!input.length) throw err_('COLLECTION_MOCKUP_INPUT_REQUIRED','No collection changes to save.');
  var th=themes_().themes.filter(function(x){return x.enabled;}).map(function(x){return x.id;}), t=now_(), saved=[], olds=[];
  input.forEach(function(x){
    var prod=productById_(req_(x.productId,'PRODUCT_ID_REQUIRED'),true); if(!prod) throw err_('PRODUCT_NOT_FOUND','Product not found.');
    var color=s_(x.color)?matchChoice_(x.color,prod.colors,'INVALID_COLOR'):'', g=geom_(x,-100,200);
    var themeIds=bool_(x.saveAllThemes,false)?th:[lo_(x.themeId)]; var preview=bool_(x.websitePreview,false);
    themeIds.forEach(function(tid){
      var rows=rows_('COLLECTION_MOCKUP_PLACEMENTS');
      if(preview) rows.filter(function(r){return s_(r.PRODUCT_ID)===prod.productId&&lo_(r.THEME_ID)===tid&&lo_(r.COLOR)!==lo_(color)&&bool_(r.WEBSITE_PREVIEW,false);}).forEach(function(r){ patch_('COLLECTION_MOCKUP_PLACEMENTS',r._row,{WEBSITE_PREVIEW:'FALSE',UPDATED_AT:t}); });
      var ex=rows_('COLLECTION_MOCKUP_PLACEMENTS').filter(function(r){return s_(r.PRODUCT_ID)===prod.productId&&lo_(r.COLOR)===lo_(color)&&lo_(r.THEME_ID)===tid;})[0];
      var d={PRODUCT_ID:prod.productId,PRODUCT_NAME:prod.productName,COLOR:color,THEME_ID:tid,WIDTH:g.width,HEIGHT:g.height,TOP:g.top,LEFT:g.left,ROTATION:g.rotation,OPACITY:g.opacity,ACTIVE:x.active===false?'FALSE':'TRUE',WEBSITE_PREVIEW:preview?'TRUE':'FALSE',UPDATED_AT:t};
      if(ex){ olds.push(collectionView_(ex)); patch_('COLLECTION_MOCKUP_PLACEMENTS',ex._row,d); d.PLACEMENT_ID=s_(ex.PLACEMENT_ID); }
      else { d.PLACEMENT_ID=uuid_('CMP'); insert_('COLLECTION_MOCKUP_PLACEMENTS',d); }
      saved.push(collectionView_(d));
    });
  });
  audit_('ADMIN',sess.adminId,'COLLECTION_MOCKUPS_SAVED','COLLECTION_MOCKUP',saved.length+' rows',olds,saved,null);
  return {savedCount:saved.length,items:saved};
}
function w_saveThemes_(p,sess){
  var list=Array.isArray(p.themes)?p.themes:[]; if(!list.length) throw err_('THEMES_REQUIRED','No themes provided.');
  var ids={}; list.forEach(function(x){ var id=lo_(x.id); if(!/^[a-z0-9_-]+$/.test(id)) throw err_('THEME_ID_INVALID','Theme id must be lowercase letters, numbers, - or _.'); if(ids[id]) throw err_('THEME_DUPLICATE','Duplicate theme '+id); ids[id]=1; });
  var enabled=list.filter(function(x){return x.enabled!==false;}); if(!enabled.length) throw err_('THEME_AT_LEAST_ONE_REQUIRED','At least one theme must stay enabled.');
  var def=lo_(p.activeTheme); if(!enabled.some(function(x){return lo_(x.id)===def;})) def=lo_(enabled[0].id);
  var old=themes_(), t=now_();
  list.forEach(function(x,i){
    var id=lo_(x.id), ex=find_('THEMES','ID',id);
    var d={ID:id,NAME:s_(x.name)||id,NAME_AR:s_(x.nameAr),ENABLED:x.enabled!==false?'TRUE':'FALSE',DISPLAY_ORDER:num_(x.order,i+1),IS_DEFAULT:id===def?'TRUE':'FALSE',LABEL:s_(x.label),TITLE:s_(x.title),TITLE_AR:s_(x.titleAr),SUB:s_(x.sub),SUB_AR:s_(x.subAr),MODE:s_(x.mode)||'artifact',HERO_IMAGE_URL:s_(x.heroImageUrl),FRAME_IMAGE_URL:s_(x.frameImageUrl),UPDATED_AT:t};
    if(ex) patch_('THEMES',ex._row,d); else insert_('THEMES',d);
  });
  rows_('THEMES').forEach(function(r){ if(!ids[lo_(r.ID)]&&bool_(r.IS_DEFAULT,false)) patch_('THEMES',r._row,{IS_DEFAULT:'FALSE',UPDATED_AT:t}); });
  var now=themes_(); audit_('ADMIN',sess.adminId,'THEMES_UPDATED','THEME',now.activeTheme,old,now,null);
  return now;
}
function w_saveContent_(p,sess){
  var vals=p.values&&typeof p.values==='object'?p.values:{}, lang=lo_(p.lang), section=up_(p.section)||'CONTENT', t=now_(), changed=[], reg=registryMap_(), inserts=[];
  if(Object.keys(vals).length>600) throw err_('CONTENT_TOO_MANY','Save fewer than 600 texts at once.');
  Object.keys(vals).forEach(function(k){
    if(!/^[A-Za-z0-9_.-]{1,120}$/.test(k)) throw err_('CONTENT_KEY_INVALID','Invalid content key: '+k);
    var v=vals[k], d={UPDATED_AT:t}, r=reg[k];
    function clean(x){ x=String(x==null?'':x); if(x.length>45000) throw err_('TEXT_TOO_LONG','Text too long: '+k); return x; }
    if(v&&typeof v==='object'){ if('en' in v) d.EN=T_(clean(v.en)); if('ar' in v) d.AR=T_(clean(v.ar)); if(v.section) d.SECTION=up_(v.section); }
    else if(lang==='en'||lang==='ar') d[lang.toUpperCase()]=T_(clean(v));
    else throw err_('LANGUAGE_INVALID','Specify lang en/ar or {en,ar} values.');
    if(r){ d.PAGE=r.page; d.GROUP=r.group; d.LABEL=r.label; d.DISPLAY_ORDER=r.order; d.TYPE=r.type; d.SECTION=d.SECTION||r.page; }
    var ex=find_('SITE_CONTENT','KEY',k);
    if(ex){ changed.push({key:k,old:{en:str_(ex.EN),ar:str_(ex.AR)}}); patch_('SITE_CONTENT',ex._row,d); }
    else { d.KEY=k; d.SECTION=d.SECTION||section; d.TYPE=d.TYPE||'TEXT'; inserts.push(d); changed.push({key:k,old:null}); }
  });
  insertMany_('SITE_CONTENT',inserts);
  audit_('ADMIN',sess.adminId,'CONTENT_UPDATED','SITE_CONTENT',Object.keys(vals).slice(0,20).join(','),changed,vals,null);
  return pagesModel_();
}
/* Whole policy save: header fields + the complete ordered list of sections (sections not sent are removed). */
function w_savePolicy_(p,sess){
  var pol=p.policy&&typeof p.policy==='object'?p.policy:{}, secs=Array.isArray(p.sections)?p.sections:[];
  var slug=lo_(pol.slug).replace(/[^a-z0-9-]/g,''); if(!slug) throw err_('POLICY_SLUG_REQUIRED','Give the policy a short link name (letters, numbers, -).');
  var id=s_(pol.policyId), ex=id?find_('POLICIES','POLICY_ID',id):null; if(id&&!ex) throw err_('POLICY_NOT_FOUND','Policy not found.');
  var other=find_('POLICIES','SLUG',slug); if(other&&(!ex||s_(other.POLICY_ID)!==id)) throw err_('POLICY_SLUG_TAKEN','Another policy already uses this link name.');
  if(!id) id=slug;
  req_(pol.titleEn,'POLICY_TITLE_REQUIRED',300);
  if(secs.length>200) throw err_('POLICY_TOO_MANY_SECTIONS','A policy can have at most 200 sections.');
  function L(v,max){ v=String(v==null?'':v); if(v.length>(max||45000)) throw err_('TEXT_TOO_LONG','A policy text is too long.'); return T_(v); }
  var old=ex?policies_(true).filter(function(x){return x.policyId===id;})[0]:null, t=now_();
  var d={SLUG:slug,TITLE_EN:L(pol.titleEn,300),TITLE_AR:L(pol.titleAr,300),SUBTITLE_EN:L(pol.subtitleEn,500),SUBTITLE_AR:L(pol.subtitleAr,500),EFFECTIVE_DATE_EN:L(pol.effectiveEn,80),EFFECTIVE_DATE_AR:L(pol.effectiveAr,80),
    INTRO_EN:L(pol.introEn),INTRO_AR:L(pol.introAr),CLOSING_EN:L(pol.closingEn),CLOSING_AR:L(pol.closingAr),VERSION:ex?num_(ex.VERSION,1)+1:1,ACTIVE:pol.active===false?'FALSE':'TRUE',DISPLAY_ORDER:num_(pol.displayOrder,ex?num_(ex.DISPLAY_ORDER,99):99)};
  if(ex){ d.UPDATED_AT=t; patch_('POLICIES',ex._row,d); }
  else { d.POLICY_ID=id; d.CREATED_AT=t; d.UPDATED_AT=t; insert_('POLICIES',d); }
  deleteRows_('POLICY_SECTIONS',where_('POLICY_SECTIONS','POLICY_ID',id).map(function(r){return r._row;}));
  insertMany_('POLICY_SECTIONS',secs.map(function(x,i){ return {SECTION_ID:s_(x.sectionId)||uuid_('PSEC'),POLICY_ID:id,NUMBER:T_(s_(x.number)||(i+1<10?'0':'')+(i+1)),TITLE_EN:L(x.titleEn,400),TITLE_AR:L(x.titleAr,400),BODY_EN:L(x.bodyEn),BODY_AR:L(x.bodyAr),ACTIVE:x.active===false?'FALSE':'TRUE',DISPLAY_ORDER:i+1,UPDATED_AT:t}; }));
  var now=policies_(true).filter(function(x){return x.policyId===id;})[0];
  audit_('ADMIN',sess.adminId,ex?'POLICY_UPDATED':'POLICY_CREATED','POLICY',id,old,{version:now&&now.version,sections:secs.length},null);
  return {policy:now,policies:policies_(true)};
}
function w_saveInquiry_(p,sess){
  var r=find_('INQUIRIES','INQUIRY_ID',p.inquiryId); if(!r) throw err_('INQUIRY_NOT_FOUND','Inquiry not found.');
  var d={UPDATED_AT:now_()}; if('status' in p){ var st=up_(p.status); if(INQUIRY_STATUSES.indexOf(st)<0) throw err_('INQUIRY_STATUS_INVALID','Invalid status.'); d.STATUS=st; }
  if('adminNote' in p) d.ADMIN_NOTE=T_(String(p.adminNote||'').slice(0,4000));
  var old=inquiryView_(r); patch_('INQUIRIES',r._row,d);
  audit_('ADMIN',sess.adminId,'INQUIRY_UPDATED','INQUIRY',s_(r.INQUIRY_ID),{status:old.status},{status:d.STATUS||old.status},null);
  return {inquiry:inquiryView_(find_('INQUIRIES','INQUIRY_ID',p.inquiryId)),noRevision:true};
}
/* Size chart: save every row of one product at once. */
function w_saveProductSizes_(p,sess){
  var pid=req_(p.productId,'PRODUCT_ID_REQUIRED'); if(!find_('PRODUCTS','PRODUCT_ID',pid)) throw err_('PRODUCT_NOT_FOUND','Product not found.');
  var list=Array.isArray(p.sizes)?p.sizes:[]; if(!list.length) throw err_('SIZES_REQUIRED','No sizes to save.');
  function opt(v){ return v===''||v==null?'':clamp_(v,0,500,'SIZE_VALUE_INVALID'); }
  var seen={}, t=now_(), inserts=[], olds=[];
  list.forEach(function(x,i){
    var label=req_(x.sizeLabel,'SIZE_LABEL_REQUIRED',30), k=normName_(label); if(seen[k]) throw err_('SIZE_DUPLICATE','Size '+label+' appears twice.'); seen[k]=1;
    var d={PRODUCT_ID:pid,SIZE_LABEL:T_(label),WIDTH_CM:opt(x.widthCm),LENGTH_CM:opt(x.lengthCm),AVG_WEIGHT_MIN_KG:opt(x.avgWeightMinKg),AVG_WEIGHT_MAX_KG:opt(x.avgWeightMaxKg),AGE_MIN_YEARS:opt(x.ageMinYears),AGE_MAX_YEARS:opt(x.ageMaxYears),ACTIVE:x.active===false?'FALSE':'TRUE',DISPLAY_ORDER:num_(x.displayOrder,i+1),UPDATED_AT:t};
    var ex=s_(x.sizeId)?find_('PRODUCT_SIZES','SIZE_ID',x.sizeId):rows_('PRODUCT_SIZES').filter(function(r){return s_(r.PRODUCT_ID)===pid&&normName_(r.SIZE_LABEL)===k;})[0];
    if(ex){ olds.push(plain_(ex)); patch_('PRODUCT_SIZES',ex._row,d); } else { d.SIZE_ID=uuid_('SIZ'); d.CREATED_AT=t; inserts.push(d); }
  });
  insertMany_('PRODUCT_SIZES',inserts);
  audit_('ADMIN',sess.adminId,'SIZE_CHART_SAVED','PRODUCT',pid,olds,list,{created:inserts.length});
  return {product:productById_(pid,true)};
}
function specTemplatesPublic_(){ return (typeof SPEC_TEMPLATES!=='undefined'?SPEC_TEMPLATES:[]).map(function(x){ return {id:x.id,name:x.name,kids:x.kids,tagline:x.tagline[0],material:x.material[0],gsm:x.gsm,fit:x.fit[0],sizes:x.sizes.map(function(z){return z[0];})}; }); }
function templateById_(id){ return (typeof SPEC_TEMPLATES!=='undefined'?SPEC_TEMPLATES:[]).filter(function(x){return x.id===up_(id);})[0]||null; }
function matchTemplate_(p){
  var n=normName_(p.PRODUCT_NAME), kids=up_(p.CATEGORY)==='KIDS'||/kid/.test(n), list=(typeof SPEC_TEMPLATES!=='undefined'?SPEC_TEMPLATES:[]).filter(function(x){return !!x.kids===kids;});
  var exact=list.filter(function(x){return normName_(x.name)===n||x.aliases.some(function(a){return normName_(a)===n;});})[0]; if(exact) return exact;
  var best=null,len=0; list.forEach(function(x){ x.aliases.concat([x.name]).forEach(function(a){ var k=normName_(a); if(k.length>len&&n.indexOf(k)>-1){best=x;len=k.length;} }); }); return best;
}
/* Writes material, care, fit and size chart from a template. Never touches price, name, colours or images. */
function applySpecTemplate_(row,tpl,actor){
  var t=now_(), old=plain_(row);
  patch_('PRODUCTS',row._row,{TAGLINE:T_(tpl.tagline[0]),TAGLINE_AR:T_(tpl.tagline[1]),MATERIAL:T_(tpl.material[0]),MATERIAL_AR:T_(tpl.material[1]),LINING:T_(tpl.lining[0]),LINING_AR:T_(tpl.lining[1]),GSM:T_(tpl.gsm),
    FIT:T_(tpl.fit[0]),FIT_AR:T_(tpl.fit[1]),FIT_NOTE:T_(tpl.fitNote[0]),FIT_NOTE_AR:T_(tpl.fitNote[1]),CONSTRUCTION:T_(STD_CONSTRUCTION[0]),CONSTRUCTION_AR:T_(STD_CONSTRUCTION[1]),CARE_ICONS:STD_CARE,CARE_EN:'',CARE_AR:'',SIZE_CHART_TYPE:tpl.chart,SPEC_TEMPLATE:tpl.id,UPDATED_AT:t});
  var pid=s_(row.PRODUCT_ID), have=rows_('PRODUCT_SIZES').filter(function(r){return s_(r.PRODUCT_ID)===pid;}), inserts=[], updated=[];
  tpl.sizes.forEach(function(z,i){
    var age=tpl.chart==='AGE', d={WIDTH_CM:z[1],LENGTH_CM:z[2],AVG_WEIGHT_MIN_KG:age?'':z[3],AVG_WEIGHT_MAX_KG:age?'':z[4],AGE_MIN_YEARS:age?z[3]:'',AGE_MAX_YEARS:age?z[4]:'',DISPLAY_ORDER:i+1,UPDATED_AT:t};
    var ex=have.filter(function(r){return normName_(r.SIZE_LABEL)===normName_(z[0]);})[0];
    if(ex){ patch_('PRODUCT_SIZES',ex._row,d); updated.push(z[0]); }
    else { d.SIZE_ID=uuid_('SIZ'); d.PRODUCT_ID=pid; d.SIZE_LABEL=T_(z[0]); d.ACTIVE='TRUE'; d.CREATED_AT=t; inserts.push(d); }
  });
  insertMany_('PRODUCT_SIZES',inserts);
  var added=inserts.map(function(x){return String(x.SIZE_LABEL).replace(/^'/,'');});
  audit_(actor?'ADMIN':'SYSTEM',actor||'SETUP','SPEC_TEMPLATE_APPLIED','PRODUCT',pid,{material:old.MATERIAL,fit:old.FIT,gsm:old.GSM,construction:old.CONSTRUCTION,careEn:old.CARE_EN,careAr:old.CARE_AR},{template:tpl.id},{sizesUpdated:updated,sizesAdded:added});
  return {productId:pid,productName:s_(row.PRODUCT_NAME),template:tpl.id,sizesUpdated:updated,sizesAdded:added};
}
function w_applySpecTemplate_(p,sess){
  var row=find_('PRODUCTS','PRODUCT_ID',p.productId); if(!row) throw err_('PRODUCT_NOT_FOUND','Product not found.');
  var tpl=templateById_(p.templateId); if(!tpl) throw err_('TEMPLATE_NOT_FOUND','Template not found.');
  var r=applySpecTemplate_(row,tpl,sess.adminId); return {result:r,product:productById_(p.productId,true)};
}
function w_saveConfirmationMessage_(p,sess){
  var d={ID:'ORDER_CONFIRMATION',ACTIVE:p.active===false?'FALSE':'TRUE',TITLE_EN:s_(p.titleEn),TITLE_AR:s_(p.titleAr),BODY_EN:s_(p.bodyEn),BODY_AR:s_(p.bodyAr),ACTION_EN:s_(p.actionEn),ACTION_AR:s_(p.actionAr),NOTE_EN:s_(p.noteEn),NOTE_AR:s_(p.noteAr),UPDATED_AT:now_()};
  if(!d.TITLE_EN||!d.BODY_EN) throw err_('CONFIRMATION_MESSAGE_REQUIRED_EN','English title and body are required.');
  var ex=rows_('CONFIRMATION_MESSAGE')[0], old=ex?plain_(ex):null;
  if(ex) patch_('CONFIRMATION_MESSAGE',ex._row,d); else insert_('CONFIRMATION_MESSAGE',d);
  audit_('ADMIN',sess.adminId,'CONFIRMATION_MESSAGE_UPDATED','CONFIRMATION_MESSAGE','ORDER_CONFIRMATION',old,d,null);
  return confirmationMessage_();
}
function w_saveDeliveryZone_(p,sess){
  var d={GOVERNORATE:req_(p.governorate,'GOVERNORATE_REQUIRED',150),AREA:req_(p.area,'AREA_REQUIRED',200),DELIVERY_FEE:money_(clamp_(p.deliveryFee,0,100000,'DELIVERY_FEE_INVALID')),ESTIMATED_DAYS:s_(p.estimatedDays),ACTIVE:bool_(p.active,true)?'TRUE':'FALSE'};
  if(d.ACTIVE==='TRUE'&&deliveryZones_(false).some(function(z){return z.zoneId!==s_(p.zoneId)&&lo_(z.governorate)===lo_(d.GOVERNORATE)&&lo_(z.area)===lo_(d.AREA);})) throw err_('DELIVERY_ZONE_DUPLICATE','An active zone with this governorate/area already exists.');
  var r=upsert_('DELIVERY_ZONES','ZONE_ID',s_(p.zoneId),d,'ZONE');
  audit_('ADMIN',sess.adminId,r.created?'DELIVERY_ZONE_CREATED':'DELIVERY_ZONE_UPDATED','DELIVERY_ZONE',r.id,r.old,d,null);
  return {zones:deliveryZones_(true)};
}
var SETTINGS_RULES={SITE_LOGIN_REQUIRED:function(v){return bool_(v,false)?'TRUE':'FALSE';},STORE_MODE:function(v){v=up_(v);if(['OPEN','CLOSED'].indexOf(v)<0)throw err_('STORE_MODE_INVALID','OPEN or CLOSED.');return v;},COD_ENABLED:function(v){return bool_(v,true)?'TRUE':'FALSE';},CONFIRMATION_HOURS:function(v){return String(Math.floor(clamp_(v,1,168,'CONFIRMATION_HOURS_INVALID')));},
  CUSTOMER_SITE_URL:function(v){return req_(v,'URL_REQUIRED');},CONFIRMATION_PAGE_URL:function(v){return req_(v,'URL_REQUIRED');},ALLOWED_ASSET_ORIGINS:function(v){return list_(v).join(',');},ALLOWED_PARENT_ORIGINS:function(v){return list_(v).join(',');},
  LOGO_ASSET_URL:function(v){return checkAssetUrl_(v);},MAX_QTY_PER_LINE:function(v){return String(Math.floor(clamp_(v,1,100)));},MAX_CART_QTY:function(v){return String(Math.floor(clamp_(v,1,500)));},BRAND_NAME:function(v){return req_(v,'BRAND_REQUIRED',60);},
  PAYMOB_ENABLED:function(v){ var on=bool_(v,false); if(on){ var st=pmStatus_(); if(!st.modes[st.mode].ready) throw err_('PAYMOB_NOT_READY','Add the Paymob keys and card integration ID for '+st.mode+' mode first (Settings ▸ Paymob).'); } return on?'TRUE':'FALSE'; },
  PAYMOB_MODE:function(v){ v=up_(v); if(['TEST','LIVE'].indexOf(v)<0) throw err_('PAYMOB_MODE_INVALID','TEST or LIVE.'); if(cfgBool_('PAYMOB_ENABLED',false)&&!pmStatus_().modes[v].ready) throw err_('PAYMOB_NOT_READY','Add the Paymob keys for '+v+' mode before switching.'); return v; },
  PAYMOB_PAYMENT_MINUTES:function(v){return String(Math.floor(clamp_(v,15,1440)));},
  SHOW_PIECES_LEFT:function(v){return bool_(v,true)?'TRUE':'FALSE';},PIECES_LEFT_MAX:function(v){return String(Math.floor(clamp_(v,0,100000)));},
  DROP_NAME:function(v){return s_(v).slice(0,40);},DROP_NAME_AR:function(v){return s_(v).slice(0,40);},
  META_PIXEL_ID:function(v){ v=s_(v).replace(/\s/g,''); if(v&&!/^\d{6,20}$/.test(v)) throw err_('PIXEL_ID_INVALID','The Pixel ID is numbers only (15–16 digits).'); return v; },
  DELIVERY_WORKING_DAYS:function(v){return String(Math.floor(clamp_(v,1,60)));}};
function w_saveSettings_(p,sess){
  var vals=p.values||{}, old={}, nw={};
  Object.keys(vals).forEach(function(k){ if(!SETTINGS_RULES[k]) throw err_('SETTING_NOT_EDITABLE','Setting '+k+' is not editable here.'); old[k]=s_(cfg_(k,'')); nw[k]=SETTINGS_RULES[k](vals[k]); setCfg_(k,nw[k]); });
  audit_('ADMIN',sess.adminId,'SETTINGS_UPDATED','CONFIG',Object.keys(nw).join(','),old,nw,null);
  return adminSettings_();
}
function w_saveNotifications_(p,sess){
  var emails=list_(p.emails).map(email_).slice(0,2), old={e:cfg_('ADMIN_NOTIFICATION_EMAILS',''),n:cfg_('ADMIN_NEW_ORDER_NOTIFICATIONS',''),c:cfg_('ORDER_CONFIRMATION_EMAIL_ENABLED','')};
  setCfg_('ADMIN_NOTIFICATION_EMAILS',emails.join(','),'Admin recipients (max 2)');
  setCfg_('ADMIN_NEW_ORDER_NOTIFICATIONS',bool_(p.newOrderNotifications,true)?'TRUE':'FALSE','Email admins on new order');
  if('customerConfirmationEmails' in p) setCfg_('ORDER_CONFIRMATION_EMAIL_ENABLED',bool_(p.customerConfirmationEmails,true)?'TRUE':'FALSE','Customer confirmation email');
  audit_('ADMIN',sess.adminId,'NOTIFICATIONS_UPDATED','CONFIG','NOTIFICATIONS',old,{emails:emails},null);
  return adminSettings_();
}
function w_sendTestEmail_(p,sess){ var to=email_(p.email||list_(cfg_('ADMIN_NOTIFICATION_EMAILS',''))[0]||''); MailApp.sendEmail({to:to,subject:s_(cfg_('BRAND_NAME','TEMPORARY™'))+' — notification test',body:'Test from the Admin Control Center by '+s_(sess.admin.EMAIL)+' at '+new Date().toISOString()}); audit_('ADMIN',sess.adminId,'TEST_EMAIL_SENT','EMAIL',to,null,null,null); return {sent:true,email:to,noRevision:true}; }
function w_saveAdminUser_(p,sess){
  var em=email_(p.email), role=up_(p.role); if(ROLES.indexOf(role)<0) throw err_('ADMIN_ROLE_INVALID','Invalid role.');
  var ex=find_('ADMIN_USERS','EMAIL',em), d={EMAIL:em,DISPLAY_NAME:req_(p.displayName,'DISPLAY_NAME_REQUIRED',120),ROLE:role,ACTIVE:'TRUE'};
  if(ex&&up_(ex.ROLE)==='OWNER'&&role!=='OWNER'&&ownerCount_(ex.ADMIN_ID)===0) throw err_('LAST_OWNER_PROTECTED','At least one active OWNER is required.');
  var r=upsert_('ADMIN_USERS','ADMIN_ID',ex?s_(ex.ADMIN_ID):'',d,'ADM');
  audit_('ADMIN',sess.adminId,r.created?'ADMIN_CREATED':'ADMIN_UPDATED','ADMIN',r.id,r.old,d,null);
  return {admins:rows_('ADMIN_USERS').map(adminPublic_),noRevision:true};
}
function ownerCount_(excludeId){ return rows_('ADMIN_USERS').filter(function(a){return up_(a.ROLE)==='OWNER'&&bool_(a.ACTIVE,false)&&s_(a.ADMIN_ID)!==s_(excludeId);}).length; }
function w_saveAdminUserStatus_(p,sess){
  var a=find_('ADMIN_USERS','ADMIN_ID',p.adminId); if(!a) throw err_('ADMIN_NOT_FOUND','Admin not found.'); var active=bool_(p.active,false);
  if(!active&&s_(a.ADMIN_ID)===sess.adminId) throw err_('CANNOT_DEACTIVATE_SELF','You cannot disable yourself.');
  if(!active&&up_(a.ROLE)==='OWNER'&&ownerCount_(a.ADMIN_ID)===0) throw err_('LAST_OWNER_PROTECTED','At least one active OWNER is required.');
  var old=plain_(a); patch_('ADMIN_USERS',a._row,{ACTIVE:active?'TRUE':'FALSE',UPDATED_AT:now_()});
  if(!active) rows_('ADMIN_SESSIONS').filter(function(s){return s_(s.ADMIN_ID)===s_(a.ADMIN_ID)&&!s_(s.REVOKED_AT);}).forEach(function(s){ patch_('ADMIN_SESSIONS',s._row,{REVOKED_AT:now_()}); });
  audit_('ADMIN',sess.adminId,active?'ADMIN_ACTIVATED':'ADMIN_DEACTIVATED','ADMIN',a.ADMIN_ID,old,{ACTIVE:active},null);
  return {admins:rows_('ADMIN_USERS').map(adminPublic_),noRevision:true};
}
function w_transitionOrder_(p,sess){ return {order:transitionOrder_(req_(p.orderId,'ORDER_ID_REQUIRED'),p.nextStatus,'ADMIN',sess.adminId,'ADMIN'),detail:adminOrderDetail_(p.orderId)}; }
function w_transitionPayment_(p,sess){
  var oid=req_(p.orderId,'ORDER_ID_REQUIRED'), st=up_(p.nextStatus); if(PAYMENT_STATUSES.indexOf(st)<0) throw err_('PAYMENT_STATUS_INVALID','Invalid payment status.');
  var pay=payMap_()[oid]; if(!pay) throw err_('PAYMENT_NOT_FOUND','Payment record not found.');
  var old=plain_(pay), t=now_(); patch_('PAYMENTS',find_('PAYMENTS','PAYMENT_ID',pay.PAYMENT_ID)._row,{PAYMENT_STATUS:st,PAID_AT:st==='PAID'?t:'',UPDATED_AT:t});
  var o=find_('ORDERS','ORDER_ID',oid); if(o) patch_('ORDERS',o._row,{PAYMENT_STATUS:st,UPDATED_AT:t});
  audit_('ADMIN',sess.adminId,'PAYMENT_UPDATED','PAYMENT',s_(pay.PAYMENT_ID),{status:old.PAYMENT_STATUS},{status:st},{orderId:oid});
  return {detail:adminOrderDetail_(oid)};
}
function w_refreshInventory_(p,sess){ refreshInventory_(); audit_('ADMIN',sess.adminId,'INVENTORY_REFRESHED','DESIGN_INVENTORY','ALL',null,null,null); return {inventory:inventoryMap_()}; }
function w_repairMissingPlacements_(p,sess){ var r=repairMissingPlacements_(); audit_('ADMIN',sess.adminId,'PLACEMENTS_REPAIRED','PLACEMENT','MISSING',null,{created:r.created},null); return r; }

var ADMIN_WRITES={
  saveProduct:['CATALOG_WRITE',w_saveProduct_], saveProductAsset:['CATALOG_WRITE',w_saveProductAsset_], saveProductSize:['CATALOG_WRITE',w_saveProductSize_],
  saveDesign:['CATALOG_WRITE',w_saveDesign_], saveDesignAsset:['CATALOG_WRITE',w_saveDesignAsset_], saveInventory:['CATALOG_WRITE',w_saveInventory_], refreshInventory:['CATALOG_WRITE',w_refreshInventory_],
  savePlacements:['CATALOG_WRITE',w_savePlacements_], repairMissingPlacements:['CATALOG_WRITE',w_repairMissingPlacements_], saveCollectionMockups:['CATALOG_WRITE',w_saveCollectionMockups_],
  saveThemes:['STORE_CONTROL',w_saveThemes_], saveContent:['CONTENT_WRITE',w_saveContent_], saveConfirmationMessage:['CONTENT_WRITE',w_saveConfirmationMessage_],
  saveAuthCard:['ORDER_STATUS',w_saveAuthCard_], createAuthCards:['ORDER_STATUS',w_createAuthCards_], splitAuthCard:['ORDER_STATUS',w_splitAuthCard_], uploadAuthCardImage:['ORDER_STATUS',w_uploadAuthCardImage_], createStandaloneCard:['ORDER_STATUS',w_createStandaloneCard_],
  savePolicy:['CONTENT_WRITE',w_savePolicy_], saveInquiry:['ORDER_STATUS',w_saveInquiry_], saveProductSizes:['CATALOG_WRITE',w_saveProductSizes_], applySpecTemplate:['CATALOG_WRITE',w_applySpecTemplate_],
  saveDeliveryZone:['STORE_CONTROL',w_saveDeliveryZone_], saveSettings:['STORE_CONTROL',w_saveSettings_], savePaymobKeys:['ADMIN_USER_WRITE',w_savePaymobKeys_], saveNotifications:['NOTIFICATION_WRITE',w_saveNotifications_], sendTestEmail:['NOTIFICATION_WRITE',w_sendTestEmail_],
  saveAdminUser:['ADMIN_USER_WRITE',w_saveAdminUser_], saveAdminUserStatus:['ADMIN_USER_WRITE',w_saveAdminUserStatus_],
  transitionOrder:['ORDER_STATUS',w_transitionOrder_], transitionPayment:['PAYMENT_WRITE',w_transitionPayment_]
};
var ADMIN_READS={
  overview:function(q,s){return adminDashboard_(s);}, orders:function(q){return adminOrders_(q);}, orderDetail:function(q){return adminOrderDetail_(req_(q.orderId,'ORDER_ID_REQUIRED'));},
  customers:function(q){return adminCustomers_(q);}, customerDetail:function(q){return adminCustomerDetail_(req_(q.customerId,'CUSTOMER_ID_REQUIRED'));},
  catalogFull:function(){ var c=catalog_(true); return {products:c.products,designs:c.designs,logo:c.logo,currency:c.currency,placements:placements_(true),collectionMockups:collection_(true),themes:themes_(),customerSiteUrl:s_(cfg_('CUSTOMER_SITE_URL',''))}; },
  missingPlacements:function(){ return {items:missingPlacements_()}; },
  themes:function(){return themes_();}, content:function(){return content_();}, confirmationMessage:function(){return confirmationMessage_();},
  pages:function(){ var m=pagesModel_(); m.customerSiteUrl=s_(cfg_('CUSTOMER_SITE_URL','')); return m; }, policies:function(){ return {policies:policies_(true),customerSiteUrl:s_(cfg_('CUSTOMER_SITE_URL',''))}; },
  inquiries:function(q){ return adminInquiries_(q); }, authenticity:function(q){ return adminAuthenticity_(q); }, specTemplates:function(){ return {templates:specTemplatesPublic_(),careIcons:typeof CARE_ICON_CODES!=='undefined'?CARE_ICON_CODES:[]}; },
  delivery:function(){return {zones:deliveryZones_(true)};}, inventory:function(){ var inv=inventoryMap_(); return {items:rows_('DESIGNS').map(function(d){ var x=inv[s_(d.DESIGN_ID)]||{}; x.designId=s_(d.DESIGN_ID); x.designName=s_(d.DESIGN_NAME); x.active=on_(d); return x; })}; },
  analytics:function(q){return adminAnalytics_(q);}, settings:function(){return adminSettings_();}, health:function(){return health_(true);},
  audit:function(q){ var term=lo_(q.search); var l=rows_('AUDIT_LOG').filter(function(r){return !term||[r.ACTION,r.ENTITY_TYPE,r.ENTITY_ID,r.ACTOR_ID,r.DETAILS].some(function(v){return lo_(v).indexOf(term)>-1;});}).sort(function(a,b){return ms_(b.CREATED_AT)-ms_(a.CREATED_AT);}); return {total:l.length,items:l.slice(0,Math.min(1000,num_(q.limit,300))).map(plain_)}; },
  admins:function(q,s){ need_(s,'ADMIN_USER_WRITE'); return {admins:rows_('ADMIN_USERS').map(adminPublic_)}; },
  emailLog:function(){ return {items:rows_('EMAIL_LOG').slice(-200).reverse().map(plain_)}; },
  paymob:function(){ return {paymob:pmStatus_()}; }
};
function adminControl_(p){
  var sess=adminSession_(p), op=s_(p.operation), input=p.payload&&typeof p.payload==='object'?p.payload:{};
  if(ADMIN_READS[op]){ need_(sess,'READ'); return ADMIN_READS[op](input,sess); }
  var spec=ADMIN_WRITES[op]; if(!spec) throw err_('ADMIN_OPERATION_INVALID','Unknown admin operation: '+op);
  need_(sess,spec[0]);
  return withLock_(function(){
    var res=spec[1](input,sess)||{}; SpreadsheetApp.flush();
    if(!res.noRevision) res.siteRevision=bumpRevision_(); delete res.noRevision;
    return res;
  });
}

/* =====================================================================
 * 15. ROUTER — exactly one doGet and one doPost
 * ===================================================================== */
var PUBLIC_ROUTES={
  health:function(){ return {status:'OK',service:'TEMPORARY_API',version:'12.0',revision:revision_()}; },
  sitebundle:function(){ return siteBundle_(); },
  siterevision:function(){ return {revision:revision_()}; },
  placementrevision:function(){ return {revision:revision_(),placementRevision:revision_()}; },
  catalog:function(){ return catalog_(false); },
  placements:function(){ return {placements:placements_(false)}; },
  collectionmockups:function(){ return {placements:collection_(false)}; },
  themes:function(){ return themes_(); },
  content:function(){ return content_(); },
  policies:function(){ return {policies:policies_(false)}; },
  verify:function(prm){ return verifyRoute_(prm||{}); },
  deliveryzones:function(){ return {zones:deliveryZones_(false)}; }
};
var CUSTOMER_ROUTES={
  googleauth:customerLogin_, sessionbootstrap:function(p){ var s=customerSession_(p); return {customer:customerPublic_(s.customer),expiresAt:iso_(s.session.EXPIRES_AT)}; },
  context:customerContext_, cart:cartRoute_, deliveryquote:deliveryQuoteRoute_, createorder:createOrder_, orders:customerOrders_, logout:customerLogout_,
  trackevent:trackEvent_, contactinquiry:contactInquiry_, confirmationdata:confirmationData_, confirmorder:confirmOrderFromToken_,
  guestsession:guestSession_, paymobreturn:pmReturn_, paymobretry:pmRetry_, foundersjoin:foundersJoin_
};
var ADMIN_ROUTES={
  admingoogleauth:adminLogin_, adminsessionbootstrap:function(p){ var s=adminSession_(p); return {admin:adminPublic_(s.admin),expiresAt:iso_(s.session.EXPIRES_AT)}; },
  adminlogout:function(p){ var s=adminSession_(p); withLock_(function(){ patch_('ADMIN_SESSIONS',find_('ADMIN_SESSIONS','SESSION_ID',s.session.SESSION_ID)._row,{REVOKED_AT:now_()}); }); return {status:'LOGGED_OUT'}; },
  admincontrol:adminControl_
};
function dispatch_(action,payload,allowed){
  var a=lo_(action), p=payload||{};
  for(var i=0;i<allowed.length;i++){ if(allowed[i][a]) return allowed[i][a](p); }
  throw err_('ROUTE_NOT_FOUND','Unknown action: '+a);
}
function envelope_(fn){
  var id='REQ-'+Utilities.getUuid().slice(0,8).toUpperCase();
  try{ var data=fn(); return JSON.parse(JSON.stringify({ok:true,requestId:id,data:data===undefined?{}:data})); }
  catch(e){ console.error('TEMPORARY '+id+' '+(e&&e.stack||e)); return {ok:false,requestId:id,errorCode:errCode_(e),errorMessage:errMessage_(e)}; }
  finally{ MEMO={}; }
}
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e){
  var prm=(e&&e.parameter)||{}, action=lo_(prm.action||'health');
  if(action==='authbridge') return bridgePage_('customer');
  if(action==='adminbridge') return bridgePage_('admin');
  if(action==='confirmorder') return HtmlService.createHtmlOutput('<script>top.location.replace('+JSON.stringify(s_(cfg_('CONFIRMATION_PAGE_URL',''))+'?token='+encodeURIComponent(s_(prm.token)))+')</script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return json_(envelope_(function(){ if(!PUBLIC_ROUTES[action]) throw err_('POST_REQUIRED','This action requires the secure bridge.'); return PUBLIC_ROUTES[action](prm); }));
}
function doPost(e){
  var body={}; try{ body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}'); }catch(_){ return json_({ok:false,errorCode:'INVALID_JSON',errorMessage:'Invalid request.'}); }
  var qa=lo_(e&&e.parameter&&e.parameter.action);
  if(qa==='paymobwebhook') return json_(envelope_(function(){ return pmWebhook_(body,s_(e.parameter.hmac)); }));
  return json_(envelope_(function(){ return dispatch_(body.action,body,[PUBLIC_ROUTES,CUSTOMER_ROUTES,ADMIN_ROUTES]); }));
}
/* google.script.run entry points (no trailing underscore so the bridge can call them). */
function temporaryCustomerBridge(action,payload){ return envelope_(function(){ return dispatch_(action,payload,[PUBLIC_ROUTES,CUSTOMER_ROUTES]); }); }
function temporaryAdminBridge(action,payload){ return envelope_(function(){ return dispatch_(action,payload,[PUBLIC_ROUTES,ADMIN_ROUTES]); }); }
function bridgePage_(kind){
  var origins=list_(cfg_('ALLOWED_PARENT_ORIGINS','https://temporaryeg26-afk.github.io')); MEMO={};
  var pre=kind==='admin'?'TEMP_ADMIN_BRIDGE':'TEMP_BRIDGE', fn=kind==='admin'?'temporaryAdminBridge':'temporaryCustomerBridge';
  /* Apps Script nests user HTML 2+ frames below the /exec wrapper, so window.parent is Google's
   * frame, not the site. Announce READY to every ancestor; postMessage's targetOrigin makes sure
   * only an allowed site frame receives it, and replies go back to whichever ancestor called. */
  var js='(function(){var O='+JSON.stringify(origins)+',A=[],w=window,n=0,got=false;'+
    'try{for(var i=0;i<12&&w!==w.parent;i++){w=w.parent;A.push(w)}}catch(e){}'+
    'function ready(){A.forEach(function(f){O.forEach(function(o){try{f.postMessage({type:"'+pre+'_READY"},o)}catch(e){}})})}'+
    'var iv=setInterval(function(){if(got||++n>60)return clearInterval(iv);ready()},500);ready();'+
    'window.addEventListener("message",function(ev){if(O.indexOf(ev.origin)<0||A.indexOf(ev.source)<0)return;got=true;var d=ev.data||{},P=ev.source;'+
    'if(d.type==="'+pre+'_PING"){P.postMessage({type:"'+pre+'_READY"},ev.origin);return}'+
    'if(d.type!=="'+pre+'_CALL"||!d.requestId)return;var org=ev.origin;'+
    'google.script.run.withSuccessHandler(function(r){P.postMessage({type:"'+pre+'_RESULT",requestId:d.requestId,result:r},org)})'+
    '.withFailureHandler(function(err){P.postMessage({type:"'+pre+'_RESULT",requestId:d.requestId,result:{ok:false,errorCode:"INTERNAL_ERROR",errorMessage:String(err&&err.message||err)}},org)})'+
    '.'+fn+'(d.action,d.payload||{})});})();';
  return HtmlService.createHtmlOutput('<!doctype html><html><head><meta charset="utf-8"></head><body><script>'+js+'</script></body></html>').setTitle('TEMPORARY™ Secure Bridge').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* =====================================================================
 * 16. TRIGGER JOBS
 * ===================================================================== */
function TEMPORARY_MINUTE_JOB(){
  try{ expirePendingOrders_(); }catch(e){ console.error('EXPIRE_FAILED '+e); }
  try{ processEmailQueue_(); }catch(e){ console.error('EMAIL_FAILED '+e); }
  MEMO={};
}
function TEMPORARY_DAILY_JOB(){
  withLock_(function(){
    var cutoff=Date.now()-37*86400000;
    ['CUSTOMER_SESSIONS','ADMIN_SESSIONS'].forEach(function(n){ deleteRows_(n,rows_(n).filter(function(r){return (s_(r.REVOKED_AT)||ms_(r.EXPIRES_AT)<Date.now())&&ms_(r.UPDATED_AT||r.CREATED_AT)<cutoff;}).map(function(r){return r._row;})); });
    refreshInventory_();
  });
}

/* =====================================================================
 * 17. SETUP · MIGRATION · VERIFY · OPERATOR TOOLS  (run from the editor)
 * ===================================================================== */
function ensureSchema_(){
  var ss=db_(), report={createdSheets:[],addedColumns:{}};
  Object.keys(SCHEMA).forEach(function(name){
    var s=ss.getSheetByName(name);
    if(!s){ s=ss.insertSheet(name); s.getRange(1,1,1,SCHEMA[name].length).setValues([SCHEMA[name]]); report.createdSheets.push(name); }
    else{
      var lc=Math.max(1,s.getLastColumn()), h=s.getRange(1,1,1,lc).getValues()[0].map(s_), add=SCHEMA[name].filter(function(c){return h.indexOf(c)===-1;});
      if(s.getLastColumn()===0){ s.getRange(1,1,1,SCHEMA[name].length).setValues([SCHEMA[name]]); add=[]; }
      if(add.length){ if(s.getMaxColumns()<lc+add.length) s.insertColumnsAfter(s.getMaxColumns(),lc+add.length-s.getMaxColumns()); s.getRange(1,lc+1,1,add.length).setValues([add]); report.addedColumns[name]=add; }
    }
    s.setFrozenRows(1); s.getRange(1,1,1,s.getLastColumn()).setFontWeight('bold');
    forget_(name);
  });
  return report;
}
function legacyJson_(key){ try{ var v=s_(cfg_(key,'')); return v?JSON.parse(v):null; }catch(_){ return null; } }
function migrate_(){
  var log=[];
  CONFIG_DEFAULTS.forEach(function(d){ if(!find_('CONFIG','KEY',d[0])){ insert_('CONFIG',{KEY:d[0],VALUE:d[1],DESCRIPTION:d[2],UPDATED_AT:now_()}); log.push('CONFIG+'+d[0]); } });
  [['TEMP_ADMIN_NOTIFICATION_EMAILS','ADMIN_NOTIFICATION_EMAILS'],['TEMP_ADMIN_NEW_ORDER_NOTIFICATIONS','ADMIN_NEW_ORDER_NOTIFICATIONS']].forEach(function(m){ var v=s_(cfg_(m[0],'')); if(v&&!s_(cfg_(m[1],''))){ setCfg_(m[1],v); log.push('CONFIG '+m[0]+'→'+m[1]); } });
  // Arabic names → owning sheets
  var pAr=legacyJson_('TEMP_PRODUCT_NAMES_AR_JSON')||{}, dAr=legacyJson_('TEMP_DESIGN_NAMES_AR_JSON')||{};
  rows_('SITE_CONTENT').forEach(function(r){ if(up_(r.SECTION)==='PRODUCT_NAMES_AR') pAr[s_(r.KEY)]=s_(r.AR)||s_(r.EN); if(up_(r.SECTION)==='DESIGN_NAMES_AR') dAr[s_(r.KEY)]=s_(r.AR)||s_(r.EN); });
  rows_('PRODUCTS').forEach(function(p){ var v=s_(pAr[s_(p.PRODUCT_ID)]); if(v&&!s_(p.PRODUCT_NAME_AR)&&!/[?�]/.test(v)){ patch_('PRODUCTS',p._row,{PRODUCT_NAME_AR:v}); log.push('AR name '+p.PRODUCT_ID); } });
  rows_('DESIGNS').forEach(function(d){ var v=s_(dAr[s_(d.DESIGN_ID)]); if(v&&!s_(d.DESIGN_NAME_AR)&&!/[?�]/.test(v)){ patch_('DESIGNS',d._row,{DESIGN_NAME_AR:v}); log.push('AR name '+d.DESIGN_ID); } });
  // Site content from legacy CONFIG JSON (only when the sheet has no content yet)
  if(!rows_('SITE_CONTENT').filter(function(r){return CMS_EXCLUDED_SECTIONS.indexOf(up_(r.SECTION))<0;}).length){
    var en=legacyJson_('TEMP_CONTENT_EN_JSON')||{}, ar=legacyJson_('TEMP_CONTENT_AR_JSON')||{}, keys={}; Object.keys(en).concat(Object.keys(ar)).forEach(function(k){keys[k]=1;});
    insertMany_('SITE_CONTENT',Object.keys(keys).map(function(k){ return {KEY:k,SECTION:/^contact/i.test(k)?'CONTACT':(/Policy/.test(k)?'LEGAL':'CONTENT'),EN:s_(en[k]),AR:/[?�]{2,}/.test(s_(ar[k]))?'':s_(ar[k]),TYPE:/Body$/.test(k)?'HTML':'TEXT',UPDATED_AT:now_()}; }));
    log.push('SITE_CONTENT seeded '+Object.keys(keys).length);
  }
  // Themes from legacy CONFIG JSON (only when THEMES is empty)
  if(!rows_('THEMES').length){
    var th=legacyJson_('TEMP_ENABLED_THEMES_JSON')||[], meta=legacyJson_('TEMP_THEME_META_JSON')||{}, act=lo_(cfg_('TEMP_ACTIVE_THEME',''));
    insertMany_('THEMES',th.map(function(t,i){ var m=meta[lo_(t.id)]||{}; return {ID:lo_(t.id),NAME:s_(t.name),NAME_AR:s_(t.nameAr),ENABLED:t.enabled===false?'FALSE':'TRUE',DISPLAY_ORDER:num_(t.order,i+1),IS_DEFAULT:lo_(t.id)===act?'TRUE':'FALSE',LABEL:s_(m.label),TITLE:s_(m.title),TITLE_AR:s_(m.titleAr),SUB:s_(m.sub),MODE:s_(m.mode),UPDATED_AT:now_()}; }));
    log.push('THEMES seeded '+th.length);
  }
  // Inventory ledger → DESIGN_INVENTORY (one time)
  if(s_(cfg_('INVENTORY_LEDGER_VERSION',''))!=='1'){
    ensureInventoryRows_();
    rows_('DESIGNS').forEach(function(d){ var r=find_('DESIGN_INVENTORY','DESIGN_ID',d.DESIGN_ID); if(!r) return; var sold=Math.max(num_(r.SOLD,0),num_(d.SOLD,0)), lim=num_(r.PRODUCTION_LIMIT,'')===''?num_(d.PRODUCTION_LIMIT,100):num_(r.PRODUCTION_LIMIT,100), man=bool_(r.MANUAL_SOLD_OUT,false)||bool_(d.MANUAL_SOLD_OUT,false);
      patch_('DESIGN_INVENTORY',r._row,{SOLD:sold,PRODUCTION_LIMIT:lim,MANUAL_SOLD_OUT:man?'TRUE':'FALSE',UPDATED_AT:now_()}); });
    setCfg_('INVENTORY_LEDGER_VERSION','1','DESIGN_INVENTORY owns PRODUCTION_LIMIT / SOLD / MANUAL_SOLD_OUT'); log.push('Inventory ledger migrated');
  }
  // Collection mockup labels
  var names={}; rows_('PRODUCTS').forEach(function(p){names[s_(p.PRODUCT_ID)]=s_(p.PRODUCT_NAME);});
  rows_('COLLECTION_MOCKUP_PLACEMENTS').forEach(function(r){ var n=names[s_(r.PRODUCT_ID)]; if(n&&s_(r.PRODUCT_NAME)!==n) patch_('COLLECTION_MOCKUP_PLACEMENTS',r._row,{PRODUCT_NAME:n}); });
  // Placements missing ARTWORK_TYPE
  rows_('PLACEMENTS').forEach(function(r){ if(!up_(r.ARTWORK_TYPE)) patch_('PLACEMENTS',r._row,{ARTWORK_TYPE:s_(r.DESIGN_ID)?'DESIGN':'LOGO'}); });
  return log;
}
function installTriggers_(){
  var keep={TEMPORARY_MINUTE_JOB:1,TEMPORARY_DAILY_JOB:1}, have={};
  ScriptApp.getProjectTriggers().forEach(function(t){ var h=t.getHandlerFunction(); if(!keep[h]||have[h]) ScriptApp.deleteTrigger(t); else have[h]=1; });
  if(!have.TEMPORARY_MINUTE_JOB) ScriptApp.newTrigger('TEMPORARY_MINUTE_JOB').timeBased().everyMinutes(1).create();
  if(!have.TEMPORARY_DAILY_JOB) ScriptApp.newTrigger('TEMPORARY_DAILY_JOB').timeBased().everyDays(1).atHour(4).create();
}
function rebuildSyncMap_(){
  var s=sh_('SYNC_MAP'); if(s.getLastRow()>1) s.getRange(2,1,s.getLastRow()-1,Math.max(1,s.getLastColumn())).clearContent(); forget_('SYNC_MAP');
  insertMany_('SYNC_MAP',OWNERSHIP.map(function(o){return {ENTITY:o[0],SOURCE_SHEET:o[1],SOURCE_KEY:o[2],TARGET:o[3],STATUS:'OWNER',NOTES:'Writes only via GS (admincontrol / customer routes)',UPDATED_AT:now_()};}));
}
function repairMissingPlacements_(){
  var missing=missingPlacements_(), all=placements_(true), t=now_(), rows=[];
  missing.forEach(function(m){
    var donor=all.filter(function(p){return p.productId===m.productId&&p.artworkType===m.artworkType&&p.side===m.side&&p.printSize===m.printSize&&(m.artworkType==='LOGO'||p.designId===m.designId);})[0]
      ||all.filter(function(p){return p.productId===m.productId&&p.artworkType===m.artworkType&&p.side===m.side&&p.printSize===m.printSize;})[0];
    if(!donor) return;
    rows.push({PLACEMENT_ID:uuid_('PLC'),PRODUCT_ID:m.productId,DESIGN_ID:m.designId,COLOR:m.color,ARTWORK_TYPE:m.artworkType,SIDE:m.side,PRINT_SIZE:m.printSize,PRINT_WIDTH_CM:m.printSize,PRINT_HEIGHT_CM:m.printSize,WIDTH:donor.width,HEIGHT:donor.height,TOP:donor.top,LEFT:donor.left,ROTATION:donor.rotation,OPACITY:donor.opacity,ACTIVE:'TRUE',UPDATED_AT:t,NOTES:'REPAIR: copied from '+donor.color});
  });
  insertMany_('PLACEMENTS',rows);
  return {missingBefore:missing.length,created:rows.length,stillMissing:missingPlacements_().length};
}

/* ---------- content / policy / product spec seeding (never overwrites what you edited) ---------- */
function seedContent_(){
  var reg=registry_(), have={}, inserts=[], fixed=[], t=now_();
  rows_('SITE_CONTENT').forEach(function(r){ have[s_(r.KEY)]=r; });
  var bad=function(v){ v=str_(v); return /^[\s?؟�]*$/.test(v)||/\?{3,}|�/.test(v); };
  reg.forEach(function(r,i){
    var k=r[0], row=have[k], meta={PAGE:r[1],GROUP:r[2],LABEL:r[3],TYPE:r[4],DISPLAY_ORDER:i+1,SECTION:r[1]};
    if(!row){ meta.KEY=k; meta.EN=T_(r[5]); meta.AR=T_(r[6]); meta.UPDATED_AT=t; inserts.push(meta); return; }
    var d={};
    if(up_(row.PAGE)!==r[1]||s_(row.LABEL)!==r[3]||s_(row.GROUP)!==r[2]||num_(row.DISPLAY_ORDER,0)!==i+1){ d.PAGE=r[1]; d.GROUP=r[2]; d.LABEL=r[3]; d.TYPE=r[4]; d.DISPLAY_ORDER=i+1; }
    if(str_(row.EN)===''&&r[5]!=='') d.EN=T_(r[5]);
    if(r[6]!==''&&(str_(row.AR)===''||bad(row.AR))) d.AR=T_(r[6]);
    if(Object.keys(d).length){ patch_('SITE_CONTENT',row._row,d); if(d.EN||d.AR) fixed.push(k); }
  });
  insertMany_('SITE_CONTENT',inserts);
  return {added:inserts.length,filledEmptyOrBroken:fixed};
}
function seedPolicies_(){
  var list=typeof SEED_POLICIES!=='undefined'?SEED_POLICIES:[], added=[], t=now_();
  list.forEach(function(pol){
    if(find_('POLICIES','POLICY_ID',pol.policyId)||find_('POLICIES','SLUG',pol.slug)) return;
    insert_('POLICIES',{POLICY_ID:pol.policyId,SLUG:pol.slug,TITLE_EN:T_(pol.titleEn),TITLE_AR:T_(pol.titleAr),SUBTITLE_EN:T_(pol.subtitleEn),SUBTITLE_AR:T_(pol.subtitleAr),EFFECTIVE_DATE_EN:T_(pol.effectiveEn),EFFECTIVE_DATE_AR:T_(pol.effectiveAr),
      INTRO_EN:T_(pol.introEn),INTRO_AR:T_(pol.introAr),CLOSING_EN:T_(pol.closingEn),CLOSING_AR:T_(pol.closingAr),VERSION:1,ACTIVE:'TRUE',DISPLAY_ORDER:pol.order,CREATED_AT:t,UPDATED_AT:t});
    insertMany_('POLICY_SECTIONS',pol.sections.map(function(x,i){ return {SECTION_ID:uuid_('PSEC'),POLICY_ID:pol.policyId,NUMBER:T_(x.number),TITLE_EN:T_(x.titleEn),TITLE_AR:T_(x.titleAr),BODY_EN:T_(x.bodyEn),BODY_AR:T_(x.bodyAr),ACTIVE:'TRUE',DISPLAY_ORDER:i+1,UPDATED_AT:t}; }));
    added.push(pol.slug+' ('+pol.sections.length+' sections)');
  });
  return {added:added};
}
function seedProductSpecs_(force){
  var out={applied:[],skippedAlreadyDone:[],noMatch:[]};
  rows_('PRODUCTS').filter(function(p){return s_(p.PRODUCT_ID);}).forEach(function(p){
    if(!force&&s_(p.SPEC_TEMPLATE)){ out.skippedAlreadyDone.push(s_(p.PRODUCT_NAME)); return; }
    var tpl=matchTemplate_(p); if(!tpl){ out.noMatch.push(s_(p.PRODUCT_NAME)+' ('+s_(p.PRODUCT_ID)+')'); return; }
    var fresh=find_('PRODUCTS','PRODUCT_ID',p.PRODUCT_ID); out.applied.push(applySpecTemplate_(fresh,tpl,''));
  });
  return out;
}

/** Run once after installing this file. Non-destructive and safe to re-run. */
function TEMPORARY_SETUP(){
  return withLock_(function(){
    var schema=ensureSchema_(), mig=migrate_();
    mig.push({authenticityCardsCreated:backfillAuthCards_()});
    mig.push({content:seedContent_()}); mig.push({policies:seedPolicies_()}); mig.push({productSpecs:seedProductSpecs_(false)});
    refreshInventory_(); installTriggers_(); rebuildSyncMap_(); confSecret_();
    if(!rows_('CONFIRMATION_MESSAGE').length) insert_('CONFIRMATION_MESSAGE',{ID:'ORDER_CONFIRMATION',ACTIVE:'TRUE',TITLE_EN:'Order received',TITLE_AR:'تم استلام طلبك',BODY_EN:'Check your email and confirm your order within the confirmation window.',BODY_AR:'افتح الإيميل وأكّد طلبك خلال فترة التأكيد.',ACTION_EN:'Continue shopping',ACTION_AR:'كمّل تسوق',UPDATED_AT:now_()});
    var rev=bumpRevision_(), out={ok:true,schema:schema,migration:mig,revision:rev,health:health_(true)};
    Logger.log(JSON.stringify(out,null,2)); return out;
  });
}
/** Read-only contract verification. */
function TEMPORARY_VERIFY(){
  var errors=[],warn=[],h=health_(true);
  if(h.missingSheets.length) errors.push('Missing sheets: '+h.missingSheets.join(','));
  Object.keys(h.missingColumns).forEach(function(k){ errors.push('Missing columns '+k+': '+h.missingColumns[k].join(',')); });
  if(!h.minuteJob) errors.push('Minute trigger missing (run TEMPORARY_SETUP)');
  if(!h.owners) errors.push('No active OWNER in ADMIN_USERS (run TEMPORARY_ADD_OWNER)');
  if(!h.activeDeliveryZones) errors.push('No active DELIVERY_ZONES');
  if(h.missingPlacements) warn.push(h.missingPlacements+' placement identities missing → customers cannot buy those combinations (Admin ▸ Placement Studio ▸ Repair, or TEMPORARY_REPAIR_MISSING_PLACEMENTS)');
  var cat=catalog_(false); if(!cat.products.length) errors.push('No active products');
  cat.products.forEach(function(p){ if(!p.colors.length) errors.push('Product '+p.productName+' has no active PRODUCT_ASSETS colors'); if(!p.sizes.length) errors.push('Product '+p.productName+' has no active sizes'); p.colors.forEach(function(c){ if(!mockupUrlFor_(p,c)) warn.push(p.productName+' / '+c+' has no mockup URL'); }); });
  cat.designs.forEach(function(d){ if(!d.assets.length) errors.push('Design '+d.designName+' has no active DESIGN_ASSETS'); });
  var th=themes_(); if(!th.activeTheme) errors.push('No enabled theme'); if(th.themes.filter(function(t){return t.enabled&&t.isDefault;}).length>1) errors.push('More than one default theme');
  if(!s_(cfg_('LOGO_ASSET_URL',''))) errors.push('LOGO_ASSET_URL missing');
  var c=content_(); if(!c.en.contactEmail) warn.push('Contact email is empty → fill it in Admin ▸ Website Pages ▸ Contact page (inquiry emails go there)');
  if(typeof CONTENT_REGISTRY==='undefined') errors.push('TEMPORARY_SEED_CONTENT.gs is missing from the project');
  var pol=policies_(false); if(!pol.length) errors.push('No active policies (run TEMPORARY_SETUP)'); pol.forEach(function(x){ if(!x.sections.length) warn.push('Policy '+x.slug+' has no sections'); if(!x.titleAr) warn.push('Policy '+x.slug+' has no Arabic title'); });
  rows_('PRODUCTS').filter(function(p){return s_(p.PRODUCT_ID)&&on_(p);}).forEach(function(p){ if(!s_(p.MATERIAL)) warn.push('Product '+s_(p.PRODUCT_NAME)+' has no material yet → Admin ▸ Products ▸ Material & Care (or apply a template)'); });
  var dupP={}; placements_(false).forEach(function(p){ var k=placementKey_(p.productId,p.color,p.artworkType,p.designId,p.side,p.printSize); if(dupP[k]) errors.push('Duplicate placement '+k); dupP[k]=1; });
  var out={status:errors.length?'FAIL':'PASS',errors:errors,warnings:warn,health:h};
  Logger.log('STATUS: '+out.status); errors.forEach(function(e){Logger.log('FAIL  '+e);}); warn.forEach(function(w){Logger.log('WARN  '+w);});
  return out;
}
function TEMPORARY_ADD_OWNER(email,name){
  email=email||'PUT-OWNER-EMAIL-HERE@gmail.com'; name=name||'Owner';
  return withLock_(function(){ var e=email_(email), ex=find_('ADMIN_USERS','EMAIL',e);
    if(ex) patch_('ADMIN_USERS',ex._row,{ROLE:'OWNER',ACTIVE:'TRUE',DISPLAY_NAME:name,UPDATED_AT:now_()});
    else insert_('ADMIN_USERS',{ADMIN_ID:uuid_('ADM'),EMAIL:e,DISPLAY_NAME:name,ROLE:'OWNER',ACTIVE:'TRUE',CREATED_AT:now_(),UPDATED_AT:now_()});
    return {ok:true,owner:e}; });
}
/** Re-apply the material / care / size-chart templates to EVERY matching product (overwrites those fields, never prices). */
function TEMPORARY_SEED_PRODUCT_SPECS(){ return withLock_(function(){ var r=seedProductSpecs_(true); bumpRevision_(); Logger.log(JSON.stringify(r,null,2)); return r; }); }
function TEMPORARY_REPAIR_MISSING_PLACEMENTS(){ return withLock_(function(){ var r=repairMissingPlacements_(); bumpRevision_(); Logger.log(JSON.stringify(r)); return r; }); }
function TEMPORARY_RUN_MINUTE_JOB_NOW(){ TEMPORARY_MINUTE_JOB(); return 'done'; }
function TEMPORARY_REFRESH_INVENTORY(){ return withLock_(function(){ refreshInventory_(); bumpRevision_(); return inventoryMap_(); }); }

/* =====================================================================
 * 18. v12 — GUEST CHECKOUT · PAYMOB ONLINE PAYMENT · FOUNDERS CLUB · PIXEL
 * ===================================================================== */
/* ---------- Guest checkout: a guest is a CUSTOMERS row without GOOGLE_SUB ---------- */
function isGuest_(c){ return !s_(c&&c.GOOGLE_SUB); }
function guestSession_(p){
  var device=s_(p.deviceId).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,120);
  return withLock_(function(){
    var t=now_(), c=insert_('CUSTOMERS',{CUSTOMER_ID:uuid_('GST'),GOOGLE_SUB:'',EMAIL:'',FULL_NAME:'',CREATED_AT:t,UPDATED_AT:t,LAST_LOGIN_AT:t});
    var raw=token_(), exp=new Date(t.getTime()+cfgNum_('SESSION_HOURS',720)*3600000);
    insert_('CUSTOMER_SESSIONS',{SESSION_ID:uuid_('SES'),CUSTOMER_ID:c.CUSTOMER_ID,SESSION_TOKEN_HASH:hash_(raw),DEVICE_ID:device,EXPIRES_AT:exp,LAST_SEEN_AT:t,CREATED_AT:t,UPDATED_AT:t});
    return {sessionToken:raw,expiresAt:exp.toISOString(),customer:customerPublic_(c)};
  });
}
/* After Google sign-in: move the guest's bag (and unpaid/paid orders) to the Google account. */
function mergeGuest_(guestToken,toCustomerId){
  if(!guestToken) return;
  try{
    var g=customerSession_({sessionToken:guestToken}); if(!isGuest_(g.customer)||g.customerId===toCustomerId) return;
    var t=now_(), gc=activeCart_(g,false);
    if(gc){
      var mine=rows_('CARTS').filter(function(c){return s_(c.CUSTOMER_ID)===toCustomerId&&up_(c.STATUS)==='ACTIVE';})[0];
      if(mine){ rows_('CART_ITEMS').filter(function(i){return s_(i.CART_ID)===s_(gc.CART_ID);}).forEach(function(i){ patch_('CART_ITEMS',i._row,{CART_ID:mine.CART_ID,UPDATED_AT:t}); });
        patch_('CARTS',find_('CARTS','CART_ID',gc.CART_ID)._row,{STATUS:'CLEARED',ITEM_COUNT:0,SUBTOTAL:0,UPDATED_AT:t}); syncCartTotals_(find_('CARTS','CART_ID',mine.CART_ID)); }
      else patch_('CARTS',find_('CARTS','CART_ID',gc.CART_ID)._row,{CUSTOMER_ID:toCustomerId,UPDATED_AT:t});
    }
    where_('ORDERS','CUSTOMER_ID',g.customerId).forEach(function(o){ patch_('ORDERS',o._row,{CUSTOMER_ID:toCustomerId,UPDATED_AT:t}); });
    where_('PAYMENTS','CUSTOMER_ID',g.customerId).forEach(function(o){ patch_('PAYMENTS',o._row,{CUSTOMER_ID:toCustomerId,UPDATED_AT:t}); });
    patch_('CUSTOMER_SESSIONS',find_('CUSTOMER_SESSIONS','SESSION_ID',g.session.SESSION_ID)._row,{REVOKED_AT:t,UPDATED_AT:t});
    var to=find_('CUSTOMERS','CUSTOMER_ID',toCustomerId), gp={};
    ['PHONE','DATE_OF_BIRTH','DELIVERY_GOVERNORATE','DELIVERY_AREA','DELIVERY_ADDRESS','MARKETING_OPT_IN','OPT_IN_AT','SERIAL_NUMBER'].forEach(function(k){ if(!s_(to[k])&&s_(g.customer[k])) gp[k]=k==='PHONE'?T_(s_(g.customer[k])):g.customer[k]; });
    if(Object.keys(gp).length) patch_('CUSTOMERS',to._row,gp);
  }catch(e){ console.error('GUEST_MERGE '+e); }
}

/* ---------- Paymob (Flash / Intention API) ---------- */
var PAYMOB_BASE='https://accept.paymob.com';
var API_EXEC_DEFAULT='https://script.google.com/macros/s/AKfycbx5InYO32kfhcCo34Me8AfCK3mZhaSsJABXL0dElh_kZT-dZKICpMxhXSUmWL9jsAiK/exec';
/* The live web-app /exec URL (ScriptApp.getService().getUrl() can return the editor /dev URL). */
/* Paymob blocks requests from Google's servers, so API calls go through the store's Cloudflare relay when one is set. */
function pmFetch_(path,opts){
  var relay=s_(cfg_('PAYMOB_RELAY_URL','')).trim().replace(/\/+$/,''), key=s_(PropertiesService.getScriptProperties().getProperty('PAYMOB_RELAY_KEY'));
  opts=opts||{}; opts.muteHttpExceptions=true; opts.headers=opts.headers||{};
  if(relay&&key){ opts.headers['x-relay-key']=key; return UrlFetchApp.fetch(relay+path,opts); }
  return UrlFetchApp.fetch(PAYMOB_BASE+path,opts);
}
function hookUrl_(){ var u=s_(cfg_('API_EXEC_URL','')).trim()||API_EXEC_DEFAULT; return u.replace(/\/dev$/,'/exec')+'?action=paymobwebhook'; }
function pmMode_(){ return up_(cfg_('PAYMOB_MODE','TEST'))==='LIVE'?'LIVE':'TEST'; }
function pmSecret_(kind,mode){ return s_(PropertiesService.getScriptProperties().getProperty('PAYMOB_'+kind+'_'+(mode||pmMode_()))); }
function pmIntegrations_(mode){ mode=mode||pmMode_(); return ['CARD','WALLET'].map(function(k){ return Math.floor(num_(cfg_('PAYMOB_'+k+'_INTEGRATION_'+mode,''),0)); }).filter(function(n){return n>0;}); }
function pmStatus_(){
  var out={enabled:cfgBool_('PAYMOB_ENABLED',false),mode:pmMode_(),modes:{}};
  ['TEST','LIVE'].forEach(function(m){ out.modes[m]={secretKey:!!pmSecret_('SECRET_KEY',m),hmac:!!pmSecret_('HMAC',m),publicKey:!!s_(cfg_('PAYMOB_PUBLIC_KEY_'+m,'')),card:Math.floor(num_(cfg_('PAYMOB_CARD_INTEGRATION_'+m,''),0))||0,wallet:Math.floor(num_(cfg_('PAYMOB_WALLET_INTEGRATION_'+m,''),0))||0}; out.modes[m].ready=out.modes[m].secretKey&&out.modes[m].hmac&&out.modes[m].publicKey&&out.modes[m].card>0; });
  out.ready=out.enabled&&out.modes[out.mode].ready;
  out.webhookUrl=hookUrl_();
  out.returnUrl=siteBase_(); out.relayUrl=s_(cfg_('PAYMOB_RELAY_URL','')); out.relayKey=!!s_(PropertiesService.getScriptProperties().getProperty('PAYMOB_RELAY_KEY'));
  return out;
}
function pmReady_(){ return pmStatus_().ready; }
function paymentProvider_(){ return pmReady_()?'PAYMOB':(cfgBool_('COD_ENABLED',false)?'COD':'NONE'); }
function siteBase_(){ return s_(cfg_('CUSTOMER_SITE_URL','https://temporaryeg26-afk.github.io/order/')).split('#')[0].split('?')[0]; }
function w_savePaymobKeys_(p,sess){
  var mode=up_(p.mode)==='LIVE'?'LIVE':'TEST', pr=PropertiesService.getScriptProperties(), changed=[];
  [['secretKey','SECRET_KEY'],['hmac','HMAC']].forEach(function(k){ var v=s_(p[k[0]]).trim(); if(v){ if(v.length<10||v.length>400) throw err_('PAYMOB_KEY_INVALID','That key does not look right. Copy it again from Paymob.'); pr.setProperty('PAYMOB_'+k[1]+'_'+mode,v); changed.push(k[1]); } });
  if(p.relayUrl!=null&&s_(p.relayUrl).trim()!==''){ var ru=s_(p.relayUrl).trim().replace(/\/+$/,''); if(!/^https:\/\/[a-z0-9.-]+\.workers\.dev$/i.test(ru)) throw err_('PAYMOB_RELAY_INVALID','The relay address must look like https://name.account.workers.dev'); setCfg_('PAYMOB_RELAY_URL',ru,'Cloudflare relay for Paymob API calls'); changed.push('RELAY_URL'); }
  if(s_(p.relayKey).trim()){ var rk=s_(p.relayKey).trim(); if(rk.length<20) throw err_('PAYMOB_RELAY_INVALID','The relay password must be at least 20 characters.'); pr.setProperty('PAYMOB_RELAY_KEY',rk); changed.push('RELAY_KEY'); }
  if(p.clearSecrets===true){ pr.deleteProperty('PAYMOB_SECRET_KEY_'+mode); pr.deleteProperty('PAYMOB_HMAC_'+mode); changed.push('CLEARED'); }
  if(p.publicKey!=null&&s_(p.publicKey).trim()!==''){ setCfg_('PAYMOB_PUBLIC_KEY_'+mode,s_(p.publicKey).trim(),'Paymob public key ('+mode+')'); changed.push('PUBLIC_KEY'); }
  ['card','wallet'].forEach(function(k){ if(p[k]!=null){ var v=s_(p[k]).trim(); if(v&&!/^\d{1,12}$/.test(v)) throw err_('PAYMOB_INTEGRATION_INVALID','Integration IDs are numbers only.'); setCfg_('PAYMOB_'+k.toUpperCase()+'_INTEGRATION_'+mode,v,'Paymob '+k+' integration ID ('+mode+')'); changed.push(k.toUpperCase()); } });
  audit_('ADMIN',sess.adminId,'PAYMOB_KEYS_UPDATED','CONFIG','PAYMOB_'+mode,null,{changed:changed},null);
  return {paymob:pmStatus_()};
}
function pmCents_(v){ return Math.round(num_(v,0)*100); }
function pmIntention_(o,items){
  var mode=pmMode_(), sk=pmSecret_('SECRET_KEY'), pk=s_(cfg_('PAYMOB_PUBLIC_KEY_'+mode,'')), ints=pmIntegrations_();
  if(!sk||!pk||!ints.length) throw err_('PAYMENT_NOT_AVAILABLE','Online payment is not available right now. Please try again later.');
  var nm=s_(o.CUSTOMER_NAME).trim().split(/\s+/), first=nm[0]||'Customer', last=nm.slice(1).join(' ')||'.';
  var lines=items.map(function(i){ return {name:(s_(i.PRODUCT_NAME)+' · '+s_(i.DESIGN_NAME)).slice(0,50),amount:pmCents_(i.UNIT_PRICE),description:(s_(i.COLOR)+' / '+s_(i.SIZE)).slice(0,50),quantity:num_(i.QUANTITY,1)}; });
  if(num_(o.DELIVERY_FEE,0)>0) lines.push({name:'Delivery',amount:pmCents_(o.DELIVERY_FEE),description:'Delivery',quantity:1});
  var amount=lines.reduce(function(n,l){return n+l.amount*l.quantity;},0);
  if(amount!==pmCents_(o.TOTAL)) throw err_('PAYMENT_TOTAL_MISMATCH','Order total mismatch. Please try again.');
  var ref=s_(o.ORDER_ID)+'-P'+Date.now().toString(36).toUpperCase(), hook=hookUrl_();
  var body={amount:amount,currency:s_(o.CURRENCY)||'EGP',payment_methods:ints,items:lines,
    billing_data:{first_name:first.slice(0,50),last_name:last.slice(0,50),email:s_(o.EMAIL),phone_number:s_(o.PHONE),street:s_(o.DELIVERY_ADDRESS).slice(0,200)||'NA',building:'NA',floor:'NA',apartment:'NA',city:s_(o.DELIVERY_AREA)||'NA',state:s_(o.DELIVERY_GOVERNORATE)||'NA',country:'EG'},
    customer:{first_name:first.slice(0,50),last_name:last.slice(0,50),email:s_(o.EMAIL)},
    special_reference:ref,expiration:Math.max(900,cfgNum_('PAYMOB_PAYMENT_MINUTES',60)*60),redirection_url:siteBase_(),extras:{order_number:s_(o.ORDER_NUMBER)}};
  if(hook) body.notification_url=hook;
  var r=pmFetch_('/v1/intention/',{method:'post',contentType:'application/json',headers:{Authorization:'Token '+sk},payload:JSON.stringify(body)});
  var code=r.getResponseCode(), j={}; try{ j=JSON.parse(r.getContentText()); }catch(_){}
  if(code>=300||!j.client_secret){ console.error('PAYMOB_INTENTION '+code+' '+r.getContentText().slice(0,600)); throw err_('PAYMENT_START_FAILED','We could not open the payment page. Please try again.'); }
  return {checkoutUrl:PAYMOB_BASE+'/unifiedcheckout/?publicKey='+encodeURIComponent(pk)+'&clientSecret='+encodeURIComponent(j.client_secret),intentionId:s_(j.id),reference:ref};
}
var PM_HMAC_KEYS=['amount_cents','created_at','currency','error_occured','has_parent_transaction','id','integration_id','is_3d_secure','is_auth','is_capture','is_refunded','is_standalone_payment','is_voided','order.id','owner','pending','source_data.pan','source_data.sub_type','source_data.type','success'];
function pmVal_(o,path,flat){
  if(flat){ var k=path==='order.id'?'order':path; var v=o[k]; return v==null?'':String(v); }
  var cur=o; path.split('.').forEach(function(seg){ cur=cur==null?null:cur[seg]; }); return cur==null?'':String(cur);
}
function pmHmacOk_(o,given,flat){
  var key=pmSecret_('HMAC'); if(!key||!given) return false;
  var str=PM_HMAC_KEYS.map(function(k){return pmVal_(o,k,flat);}).join('');
  var sig=Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_512,str,key,Utilities.Charset.UTF_8).map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');
  return safeEq_(sig,lo_(given));
}
function pmBool_(v){ return v===true||lo_(v)==='true'; }
function pmOrderFromRef_(ref){ ref=s_(ref); var i=ref.lastIndexOf('-P'); return i>0?ref.slice(0,i):ref; }
/* Idempotent: the webhook and the customer's return page can both call this. */
function pmSettle_(txn){
  var orderId=pmOrderFromRef_(txn.ref);
  return withLock_(function(){
    var o=find_('ORDERS','ORDER_ID',orderId); if(!o) return {status:'NOT_FOUND'};
    var pay=where_('PAYMENTS','ORDER_ID',orderId).sort(function(a,b){return ms_(b.UPDATED_AT)-ms_(a.UPDATED_AT);})[0], t=now_();
    if(pay&&up_(pay.PAYMENT_STATUS)==='PAID') return {status:'PAID',order:o};
    if(txn.pending) return {status:'PENDING',order:o};
    var ok=txn.success&&!txn.voided&&!txn.refunded&&txn.amountCents===pmCents_(o.TOTAL)&&up_(txn.currency||o.CURRENCY)===up_(o.CURRENCY);
    if(!ok){
      if(pay) patch_('PAYMENTS',pay._row,{PAYMENT_STATUS:'FAILED',PROVIDER_TRANSACTION_ID:T_(s_(txn.id)),UPDATED_AT:t});
      if(txn.success&&txn.amountCents!==pmCents_(o.TOTAL)) audit_('SYSTEM','PAYMOB','PAYMENT_AMOUNT_MISMATCH','ORDER',orderId,null,{paid:txn.amountCents,expected:pmCents_(o.TOTAL)},null);
      return {status:'FAILED',order:o};
    }
    var pp={PROVIDER:'PAYMOB',PAYMENT_STATUS:'PAID',PROVIDER_TRANSACTION_ID:T_(s_(txn.id)),PAYMENT_METHOD:T_(up_(txn.method||'ONLINE')),PAID_AT:t,UPDATED_AT:t};
    if(pay) patch_('PAYMENTS',pay._row,pp); else insert_('PAYMENTS',Object.assign({PAYMENT_ID:uuid_('PAY'),ORDER_ID:orderId,CUSTOMER_ID:s_(o.CUSTOMER_ID),AMOUNT:num_(o.TOTAL,0),CURRENCY:s_(o.CURRENCY),CREATED_AT:t},pp));
    patch_('ORDERS',o._row,{PAYMENT_STATUS:'PAID',PAYMENT_METHOD:'ONLINE',UPDATED_AT:t});
    audit_('SYSTEM','PAYMOB','PAYMENT_PAID','ORDER',orderId,null,{amount:num_(o.TOTAL,0),txn:s_(txn.id),method:txn.method||''},null);
    if(up_(o.ORDER_STATUS)==='PENDING'){ try{ transitionOrder_(orderId,'CONFIRMED','SYSTEM','PAYMOB','PAYMENT'); }catch(e){ console.error('PAID_CONFIRM '+orderId+' '+e); } }
    else if(up_(o.ORDER_STATUS)==='CANCELED') audit_('SYSTEM','PAYMOB','PAID_AFTER_CANCEL','ORDER',orderId,null,{note:'Paid after the payment window closed — reinstate or refund.'},null);
    try{ insert_('ANALYTICS_EVENTS',{EVENT_ID:uuid_('EVT'),TYPE:'PURCHASE',CUSTOMER_ID:s_(o.CUSTOMER_ID),SESSION_ID:'',DEVICE:'',PRODUCT_ID:'',DESIGN_ID:'',COLOR:'',SIZE:'',VALUE:num_(o.TOTAL,0),CREATED_AT:t}); }catch(_){}
    queueEmail_('CUSTOMER_ORDER_RECEIVED',orderId); queueEmail_('ADMIN_NEW_ORDER',orderId);
    return {status:'PAID',order:find_('ORDERS','ORDER_ID',orderId)};
  });
}
function pmWebhook_(body,hmac){
  var o=(body&&body.obj)||{};
  if(up_(body&&body.type)!=='TRANSACTION') return {received:true,ignored:true};
  if(!pmHmacOk_(o,hmac,false)){ console.error('PAYMOB_WEBHOOK_BAD_HMAC'); return {received:false,error:'BAD_HMAC'}; }
  var r=pmSettle_({ref:(o.order&&o.order.merchant_order_id)||'',id:o.id,success:pmBool_(o.success),pending:pmBool_(o.pending),voided:pmBool_(o.is_voided),refunded:pmBool_(o.is_refunded),amountCents:Math.round(num_(o.amount_cents,0)),currency:s_(o.currency),method:s_(o.source_data&&o.source_data.type)});
  return {received:true,status:r.status};
}
function pmReturnPublic_(o,status){
  return {status:status,orderNumber:s_(o.ORDER_NUMBER),orderId:s_(o.ORDER_ID),total:num_(o.TOTAL,0),deliveryFee:num_(o.DELIVERY_FEE,0),currency:s_(o.CURRENCY),orderStatus:up_(o.ORDER_STATUS),
    canRetry:status==='FAILED'&&up_(o.ORDER_STATUS)==='PENDING',items:where_('ORDER_ITEMS','ORDER_ID',o.ORDER_ID).map(function(i){return {productId:s_(i.PRODUCT_ID),designId:s_(i.DESIGN_ID),quantity:num_(i.QUANTITY,0),unitPrice:num_(i.UNIT_PRICE,0)};})};
}
/* Customer lands back on the website from Paymob: ?id=…&success=…&hmac=… */
function pmReturn_(p){
  var q=(p.params&&typeof p.params==='object')?p.params:{};
  if(!pmHmacOk_(q,q.hmac,true)) throw err_('PAYMENT_VERIFY_FAILED','We could not verify this payment. If you were charged, contact us with your order number.');
  var r=pmSettle_({ref:q.merchant_order_id||'',id:q.id,success:pmBool_(q.success),pending:pmBool_(q.pending),voided:pmBool_(q.is_voided),refunded:pmBool_(q.is_refunded),amountCents:Math.round(num_(q.amount_cents,0)),currency:s_(q.currency),method:s_(q['source_data.type'])});
  if(r.status==='NOT_FOUND') throw err_('ORDER_NOT_FOUND','Order not found.');
  return pmReturnPublic_(r.order,r.status);
}
function pmRetry_(p){
  var sess=customerSession_(p), o=find_('ORDERS','ORDER_ID',s_(p.orderId));
  if(!o||s_(o.CUSTOMER_ID)!==sess.customerId) throw err_('ORDER_NOT_FOUND','Order not found.');
  if(up_(o.ORDER_STATUS)!=='PENDING') throw err_('PAYMENT_NOT_AVAILABLE','This order can no longer be paid. Please place a new order.');
  var c=find_('ORDER_CONFIRMATIONS','ORDER_ID',o.ORDER_ID); if(c&&ms_(c.EXPIRES_AT)<=Date.now()) throw err_('PAYMENT_WINDOW_CLOSED','The payment window for this order has closed. Please place a new order.');
  var pm=pmIntention_(o,where_('ORDER_ITEMS','ORDER_ID',o.ORDER_ID));
  withLock_(function(){ var pay=where_('PAYMENTS','ORDER_ID',o.ORDER_ID)[0]; if(pay) patch_('PAYMENTS',pay._row,{PAYMENT_STATUS:'PENDING',PROVIDER_TRANSACTION_ID:T_(pm.intentionId),UPDATED_AT:now_()}); });
  return {checkoutUrl:pm.checkoutUrl};
}

/* ---------- Founders club (optional, after purchase) ---------- */
function foundersJoin_(p){
  var sess=customerSession_(p), dob=s_(p.dateOfBirth).slice(0,10);
  if(dob){ if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)) throw err_('DOB_INVALID','Enter a valid date of birth.'); var dd=new Date(dob+'T00:00:00Z'); if(isNaN(dd.getTime())||dd.toISOString().slice(0,10)!==dob) throw err_('DOB_INVALID','Enter a valid date of birth.'); var age=(Date.now()-dd.getTime())/31557600000; if(!(age>=10&&age<=100)) throw err_('DOB_INVALID','Enter a valid date of birth.'); }
  return withLock_(function(){
    var c=find_('CUSTOMERS','CUSTOMER_ID',sess.customerId), t=now_(), patch={MARKETING_OPT_IN:p.optIn===false?'FALSE':'TRUE',OPT_IN_AT:t,UPDATED_AT:t}; if(dob) patch.DATE_OF_BIRTH=T_(dob);
    patch_('CUSTOMERS',c._row,patch); audit_('CUSTOMER',sess.customerId,'FOUNDERS_JOIN','CUSTOMER',sess.customerId,null,{optIn:patch.MARKETING_OPT_IN,dob:!!dob},null);
    return {customer:customerPublic_(find_('CUSTOMERS','CUSTOMER_ID',sess.customerId))};
  });
}

/* ---------- Order-received email (paid online orders) ---------- */
function sendOrderReceived_(o){
  var brand=s_(cfg_('BRAND_NAME','TEMPORARY™')), cur=s_(o.CURRENCY), items=where_('ORDER_ITEMS','ORDER_ID',o.ORDER_ID), days=cfgNum_('DELIVERY_WORKING_DAYS',8);
  var rows=items.map(function(i){ return '<tr><td style="padding:8px 0;border-bottom:1px solid #eee">'+escHtml_(i.PRODUCT_NAME)+' · '+escHtml_(i.DESIGN_NAME)+'<br><span style="color:#777;font-size:12px">'+escHtml_(i.COLOR)+' · '+escHtml_(i.SIZE)+' · '+escHtml_(i.DESIGN_SIDE)+' '+escHtml_(i.DESIGN_PRINT_SIZE)+'cm × '+num_(i.QUANTITY,1)+'</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">'+num_(i.LINE_TOTAL,0).toFixed(2)+' '+escHtml_(cur)+'</td></tr>'; }).join('');
  var site=siteBase_();
  var html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#111"><div style="font-weight:700;letter-spacing:2px;font-size:20px">'+escHtml_(brand)+'</div><h1 style="font-size:24px;margin:28px 0 10px">ORDER RECEIVED</h1><p>Hi '+escHtml_(o.CUSTOMER_NAME)+', your payment went through and your order is confirmed.</p>'+
    '<div style="border:1px solid #ddd;padding:16px;margin:20px 0"><b>Order:</b> '+escHtml_(o.ORDER_NUMBER)+'<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px">'+rows+'<tr><td style="padding:8px 0">Delivery</td><td style="padding:8px 0;text-align:right">'+num_(o.DELIVERY_FEE,0).toFixed(2)+' '+escHtml_(cur)+'</td></tr><tr><td style="padding:8px 0"><b>Total paid</b></td><td style="padding:8px 0;text-align:right"><b>'+num_(o.TOTAL,0).toFixed(2)+' '+escHtml_(cur)+'</b></td></tr></table></div>'+
    '<p>Your pieces are made for you now. Delivery within <b>'+days+' working days</b> (Friday and Saturday are days off).</p><p>Deliver to: '+escHtml_(o.DELIVERY_ADDRESS)+', '+escHtml_(o.DELIVERY_AREA)+', '+escHtml_(o.DELIVERY_GOVERNORATE)+'</p>'+
    '<p style="text-align:center;margin-top:28px"><a href="'+escHtml_(site)+'" style="display:inline-block;padding:14px 26px;background:#111;color:#fff;text-decoration:none;font-weight:700">VISIT '+escHtml_(brand)+'</a></p><p style="font-size:12px;color:#555">Questions? Reply to this email with your order number.</p><p style="font-size:12px">EVERYTHING IS TEMPORARY</p></div>';
  MailApp.sendEmail({to:s_(o.EMAIL),subject:brand+' · ORDER RECEIVED · '+s_(o.ORDER_NUMBER),htmlBody:html,body:'Order '+s_(o.ORDER_NUMBER)+' received and paid. Total '+cur+' '+num_(o.TOTAL,0)+'. Delivery within '+days+' working days (Friday and Saturday off).'});
}

/* ---------- v12 one-time content update (COD → online payment, delivery days, address) ---------- */
var V12_CONTENT={
  m4:['Secure online payment · card & wallet','دفع أونلاين آمن · كارت أو محفظة'],
  cashOnDelivery:['Secure payment','دفع آمن'],
  placeOrder:['Pay securely','ادفع بأمان'],
  contactAddress:['Cairo, EG','القاهرة، مصر'],
  cod:['Pay online','ادفع أونلاين'],
  codSub:['Card or mobile wallet · secure checkout by Paymob','كارت أو محفظة · دفع آمن من خلال Paymob'],
  agreeTerms:['By paying you agree to the Terms & Conditions and our policies.','لما تدفع تبقى موافق على الشروط والأحكام وسياساتنا.'],
  status_PENDING:['Awaiting payment','مستني الدفع'],
  madeToOrder:['Made for you after you order · delivered within 8 working days (Friday & Saturday off).','بتتعمل مخصوص ليك بعد ما تطلب · بتوصلك خلال ٨ أيام عمل (الجمعة والسبت إجازة).']
};
function v12Update_(){
  var log=[], t=now_();
  if(num_(cfg_('CONTENT_VERSION',''),0)>=12) return ['already v12'];
  setCfg_('COD_ENABLED','FALSE','Cash on delivery available'); log.push('COD_ENABLED=FALSE');
  Object.keys(V12_CONTENT).forEach(function(k){ var r=find_('SITE_CONTENT','KEY',k); if(r){ patch_('SITE_CONTENT',r._row,{EN:T_(V12_CONTENT[k][0]),AR:T_(V12_CONTENT[k][1]),UPDATED_AT:t}); log.push('content '+k); } });
  (typeof V12_POLICY_PATCH!=='undefined'?V12_POLICY_PATCH:[]).forEach(function(px){
    var sec=rows_('POLICY_SECTIONS').filter(function(s){return s_(s.POLICY_ID)===px.policyId&&s_(s.NUMBER).replace(/^0+/,'')===String(px.number).replace(/^0+/,'');})[0];
    if(!sec) return;
    patch_('POLICY_SECTIONS',sec._row,{TITLE_EN:T_(px.titleEn),TITLE_AR:T_(px.titleAr),BODY_EN:T_(px.bodyEn),BODY_AR:T_(px.bodyAr),UPDATED_AT:t}); log.push('policy '+px.policyId+' '+px.number);
  });
  ['shipping','terms','privacy','returns'].forEach(function(id){ var p=find_('POLICIES','POLICY_ID',id); if(p) patch_('POLICIES',p._row,{VERSION:num_(p.VERSION,1)+1,UPDATED_AT:t}); });
  var cm=find_('CONFIRMATION_MESSAGE','ID','ORDER_CONFIRMATION');
  if(cm) patch_('CONFIRMATION_MESSAGE',cm._row,{TITLE_EN:'Order received',TITLE_AR:'طلبك وصلنا',BODY_EN:'Payment received — your order is confirmed. We sent the details to your email.',BODY_AR:'الدفع تم وطلبك اتأكد. بعتنالك التفاصيل على الإيميل.'});
  setCfg_('CONTENT_VERSION','12','Website content version'); log.push('CONTENT_VERSION=12');
  return log;
}
/** Run once after installing v12 (also safe to re-run). */
function TEMPORARY_V12_UPDATE(){
  return withLock_(function(){
    var schema=ensureSchema_(), mig=migrate_(), seed=seedContent_(), v12=v12Update_();
    try{ CacheService.getScriptCache().removeAll(['TEMP_SITE_REVISION']); }catch(_){}
    var out={ok:true,schema:schema,migration:mig,content:seed,v12:v12,paymob:pmStatus_(),revision:bumpRevision_()};
    Logger.log(JSON.stringify(out,null,2)); return out;
  });
}
/** Run from the editor once to approve the Paymob connection (external request permission). */
function TEMPORARY_TEST_PAYMOB_CONNECTION(){
  var r=pmFetch_('/v1/intention/',{method:'post',contentType:'application/json',headers:{Authorization:'Token '+(pmSecret_('SECRET_KEY')||'x')},payload:'{}'});
  var out={mode:pmMode_(),httpStatus:r.getResponseCode(),note:r.getResponseCode()===401?'Key rejected — check the Secret key for this mode':'Connection to Paymob works (a 400 here is normal: the test sends an empty order)',status:pmStatus_()};
  Logger.log(JSON.stringify(out,null,2)); return out;
}
/** Diagnostic: asks Paymob for a 1 EGP test payment link and prints Paymob's exact answer. Creates no order. */
function TEMPORARY_TEST_PAYMOB_INTENTION(){
  var mode=pmMode_(), sk=pmSecret_('SECRET_KEY'), ints=pmIntegrations_();
  var body={amount:100,currency:'EGP',payment_methods:ints,items:[{name:'Test',amount:100,description:'Test',quantity:1}],
    billing_data:{first_name:'Test',last_name:'Order',email:'test@example.com',phone_number:'01000000000',street:'NA',building:'NA',floor:'NA',apartment:'NA',city:'Cairo',state:'Cairo',country:'EG'},
    special_reference:'DIAG-'+Date.now(),notification_url:hookUrl_(),redirection_url:siteBase_()};
  var r=pmFetch_('/v1/intention/',{method:'post',contentType:'application/json',headers:{Authorization:'Token '+sk},payload:JSON.stringify(body)});
  var out={relay:s_(cfg_('PAYMOB_RELAY_URL','')),mode:mode,integrations:ints,secretKeyStartsWith:sk.slice(0,7),secretKeyKind:(/_test_/.test(sk)?'TEST key':/_live_/.test(sk)?'LIVE key':'unknown'),publicKeyKind:(/_test_/.test(s_(cfg_('PAYMOB_PUBLIC_KEY_'+mode,'')))?'TEST key':/_live_/.test(s_(cfg_('PAYMOB_PUBLIC_KEY_'+mode,'')))?'LIVE key':'unknown'),secretKeyLength:sk.length,httpStatus:r.getResponseCode(),paymobAnswer:r.getContentText().slice(0,1500)};
  Logger.log(JSON.stringify(out,null,2)); return out;
}
/** Diagnostic 2: which Paymob addresses answer this server. */
function TEMPORARY_TEST_PAYMOB_ROUTES(){
  var sk=pmSecret_('SECRET_KEY'), out=[];
  [['GET','https://accept.paymob.com/api/acceptance/payment_keys',null],
   ['POST','https://accept.paymob.com/v1/intention/','{}'],
   ['POST','https://accept.paymob.com/api/auth/tokens','{"api_key":"x"}'],
   ['POST','https://accept.paymobsolutions.com/v1/intention/','{}'],
   ['GET','https://accept.paymob.com/',null],
   ['GET','https://www.paymob.com/',null]].forEach(function(t){
    try{ var o={method:t[0].toLowerCase(),muteHttpExceptions:true,followRedirects:false,headers:{Accept:'application/json',Authorization:'Token '+sk}}; if(t[2]){o.contentType='application/json';o.payload=t[2];}
      var r=UrlFetchApp.fetch(t[1],o); out.push(t[0]+' '+t[1]+' → '+r.getResponseCode()+' '+r.getContentText().replace(/\s+/g,' ').slice(0,160)); }
    catch(e){ out.push(t[1]+' → ERROR '+e); }
  });
  Logger.log(out.join('\n')); return out;
}

/** Diagnostic 3: tries different payment_methods formats. */
function TEMPORARY_TEST_PAYMOB_FORMATS(){
  var sk=pmSecret_('SECRET_KEY'), out=[];
  [[4371028],['4371028'],['card']].forEach(function(pm){
    var body={amount:100,currency:'EGP',payment_methods:pm,items:[{name:'Test',amount:100,description:'Test',quantity:1}],billing_data:{first_name:'Test',last_name:'Order',email:'test@example.com',phone_number:'01000000000',street:'NA',building:'NA',floor:'NA',apartment:'NA',city:'Cairo',state:'Cairo',country:'EG'},special_reference:'DIAG-'+Date.now()+'-'+out.length};
    var r=pmFetch_('/v1/intention/',{method:'post',contentType:'application/json',headers:{Authorization:'Token '+sk},payload:JSON.stringify(body)});
    out.push(JSON.stringify(pm)+' -> '+r.getResponseCode()+' '+r.getContentText().slice(0,300));
  });
  Logger.log(out.join('\n')); return out;
}
