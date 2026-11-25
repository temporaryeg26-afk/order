/* TEMPORARY store layouts (10 themes). Loaded only when one of these themes is active.
   Reads products, colours, designs, stock and print placement from the site (Google Sheet). Never writes anything.
   Every piece opens a quick panel (colour, design, front/back, 20x20 / 30x30); "Customize & buy" opens the site's own customizer. */
(function(){
'use strict';
const BASE=((document.currentScript&&document.currentScript.src)||'assets/shop/shop.js').replace(/shop\.js.*$/,'');
const ROOT=BASE.replace(/assets\/shop\/$/,'');
const A=n=>ROOT+'assets/'+n;
const IDS=['maison','atelier','drop','broadcast','edition','swift','hyper','concept','index','sleek'];
const FONTS={maison:'Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600',atelier:'Inter:wght@400;500;600;700',drop:'Archivo:wdth,wght@62..125,400..900',broadcast:'Manrope:wght@400;500;700;800',edition:'Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Manrope:wght@400;500;700',swift:'',hyper:'Archivo:wdth,wght@62..125,400..900&family=Inter:wght@400;500;600',concept:'Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;500;600',index:'IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600',sleek:'Jost:wght@300;400;500;600'};
let api=null,host=null,root=null,live=false,cleans=[],panel=null,lastFocus=null;
const ST=new Map(); /* per product: {c,d,side,ps} */

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar=()=>api&&api.lang()==='ar';
const L=(en,a)=>ar()&&a?a:en;
const lc=s=>String(s||'').toLowerCase();
function el(tag,cls,html,par){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(par)par.appendChild(e);return e}

/* ---------------- data ---------------- */
const P=()=>api.products();
const DS=()=>api.designs();
const liveD=()=>{const d=DS().filter(x=>!x.soldOut);return d.length?d:DS()};
function st(p){let s=ST.get(p.productId);if(!s){const ds=liveD();s={c:api.previewColor(p)||p.colors[0]||'',d:(ds[0]||{}).designId||'',side:'BACK',ps:20};ST.set(p.productId,s)}if(!p.colors.some(c=>lc(c)===lc(s.c)))s.c=p.colors[0]||'';return s}
const dById=id=>DS().find(d=>d.designId===id)||null;
function kind(p){const s=lc((p.productName||'')+' '+api.pName(p));if(/kid|child|junior/.test(s))return 'kids';if(/hood/.test(s))return 'hoodies';if(/crew|sweat/.test(s))return 'crewnecks';if(/long/.test(s))return 'long';return 'tees'}
const KINDS=[['all','All','الكل'],['tees','T-shirts','تيشيرتات'],['long','Long sleeve','كم طويل'],['crewnecks','Crewnecks','كرونك'],['hoodies','Hoodies','هوديز'],['kids','Kids','أطفال']];
function kindsPresent(){const h=new Set(P().map(kind));return KINDS.filter(k=>k[0]==='all'||h.has(k[0]))}
const money=p=>api.money(p.price,p.currency);
function stockLine(d){if(!d)return api.t('limitedRun');if(d.soldOut)return api.t('soldOut');const n=Number(d.remaining)||0,m=Number(d.productionLimit)||0;if(!api.showLeft(n))return L('Limited run · per design','كمية محدودة لكل تصميم');return m?api.t('designLeft',{n,m}):api.t('piecesLeft',{n})}
function editionLine(){const ds=DS(),lim=ds.map(d=>Number(d.productionLimit)||0),same=lim.length&&lim.every(x=>x&&x===lim[0]);return same?L(`${ds.length} designs · ${lim[0]} pieces of each · never restocked`,`${ds.length} تصميم · ${lim[0]} قطعة من كل تصميم · مفيش إعادة إنتاج`):L('Limited pieces per design · never restocked','كمية محدودة لكل تصميم · مفيش إعادة إنتاج')}

/* ---------------- figure: one model from the mockup, with the design + logo placed by the customizer's own rows ---------------- */
const FS=1.25,FI=1199/1312,FO=(FS-FI)/2;/* customizer stage is 4:5 around the 1312x1199 mockup: convert its % to mockup % */
function layer(f,url,g,cls){if(!url||!g)return;g=Object.assign({},g,{top:((g.top/100)*FS-FO)/FI*100,height:(g.height||g.width)*FS/FI});const a=el('div','sp-a '+(cls||''),'<img alt="" draggable="false">',f);Object.assign(a.style,{width:g.width+'%',height:(g.height||g.width)+'%',left:g.left+'%',top:g.top+'%',opacity:g.opacity==null?1:g.opacity,transform:`translate(-50%,-50%) rotate(${g.rotation||0}deg)`});a.firstChild.src=url}
function fig(p,o){o=o||{};const s=st(p),f=el('div','sp-fig'+(o.cls?' '+o.cls:''));f.innerHTML='<div class="sp-in"><img class="sp-b" alt="" draggable="false" loading="lazy" decoding="async"></div>';paintFig(f,p,o);return f}
function paintFig(f,p,o){o=o||{};const s=st(p),c=o.c||s.c,view=o.view||s.side,d=o.d===undefined?dById(s.d):o.d,ps=o.ps||s.ps,inn=f.firstChild,b=inn.firstChild,m=api.mockup(p,c);if(b.getAttribute('src')!==m)b.src=m;window.tmpTone&&tmpTone(f,c);b.alt=api.pName(p)+(c?' · '+api.cName(c):'');
 inn.classList.toggle('bk',view==='BACK');inn.querySelectorAll('.sp-a').forEach(x=>x.remove());const side=s.side;
 if(d)layer(inn,api.art(d,side)||api.art(d,'FRONT'),api.placement(p.productId,c,'DESIGN',d.designId,side,ps),'ds');layer(inn,api.logoUrl(),api.placement(p.productId,c,'LOGO','',side==='FRONT'?'BACK':'FRONT',api.logoCm()),'lg')}

/* ---------------- product card ---------------- */
function swatches(p,on,par,big){const s=st(p),w=el('div','sp-sw'+(big?' big':''),null,par);p.colors.forEach(c=>{const b=el('button',lc(c)===lc(s.c)?'on':'',null,w);b.type='button';b.style.setProperty('--c',api.hex(c));b.title=api.cName(c);b.setAttribute('aria-label',api.cName(c));b.onclick=e=>{e.stopPropagation();s.c=c;[...w.children].forEach(x=>x.classList.toggle('on',x===b));on(c)}});return w}
function card(p,o){o=o||{};const a=el('article','sp-card'+(o.cls?' '+o.cls:''));a.tabIndex=0;a.setAttribute('role','button');a.setAttribute('aria-label',api.pName(p)+' · '+money(p));
 const ph=el('div','sp-ph',null,a);const f=fig(p,{view:o.view});ph.appendChild(f);if(o.num)el('span','sp-num',String(o.num).padStart(2,'0'),ph);
 const meta=el('div','sp-meta',null,a);el('div','sp-nm',`<b>${esc(api.pName(p))}</b><span>${esc(money(p))}</span>`,meta);
 if(o.sw!==false&&p.colors.length>1)swatches(p,()=>paintFig(f,p,{view:o.view}),meta);
 if(o.quick){const q=el('button','sp-quick',esc(L('Choose','اختار')),meta);q.type='button'}
 const go=()=>openPanel(p);a.onclick=go;a.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};a._f=f;a._p=p;return a}

/* ---------------- quick panel ---------------- */
function openPanel(p){closePanel(true);lastFocus=document.activeElement;const s=st(p);let view=s.side;
 const ov=el('div','sp-ov',null,document.body);ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',api.pName(p));ov.dataset.th=api.theme();ov.dir=ar()?'rtl':'ltr';
 const sh=el('div','sp-sheet',null,ov);const x=el('button','sp-x','<span aria-hidden="true">×</span>',sh);x.type='button';x.setAttribute('aria-label',L('Close','إغلاق'));
 const vis=el('div','sp-vis',null,sh),f=fig(p,{view,cls:'lg'});vis.appendChild(f);const flip=el('div','sp-flip',null,vis);
 const info=el('div','sp-info',null,sh);
 const draw=()=>{paintFig(f,p,{view});[...flip.children].forEach(b=>b.classList.toggle('on',b.dataset.v===view));const d=dById(s.d);
  info.innerHTML=`<span class="sp-k">${esc(d?api.dName(d):'')}${d?' · ':''}${esc(stockLine(d))}</span><h3>${esc(api.pName(p))}</h3><div class="sp-price">${esc(money(p))}</div>`;
  if(p.colors.length){const r=el('div','sp-row',`<label>${esc(L('Colour','اللون'))} · <b>${esc(api.cName(s.c))}</b></label>`,info);swatches(p,()=>draw(),r,true)}
  if(DS().length){const r=el('div','sp-row',`<label>${esc(L('Design','التصميم'))}</label>`,info),w=el('div','sp-dz',null,r);DS().forEach(dd=>{const u=api.art(dd,'FRONT')||api.art(dd,'BACK'),b=el('button',dd.designId===s.d?'on':'',(u?`<img src="${esc(u)}" alt="">`:'')+`<span>${esc(api.dName(dd))}</span>`,w);b.type='button';b.disabled=!!dd.soldOut;b.onclick=()=>{s.d=dd.designId;view=s.side;draw()}})}
  const r2=el('div','sp-row sp-two',null,info);
  const seg=(lab,key,opts)=>{const g=el('div','',`<label>${esc(lab)}</label>`,r2),w=el('div','sp-seg',null,g);opts.forEach(([v,t])=>{const b=el('button',String(s[key])===String(v)?'on':'',esc(t),w);b.type='button';b.onclick=()=>{s[key]=key==='ps'?Number(v):v;if(key==='side')view=v;draw()}})};
  seg(L('Design placement','مكان التصميم'),'side',[['FRONT',L('Front','قدّام')],['BACK',L('Back','ضهر')]]);
  seg(L('Print size','مقاس الطباعة'),'ps',[[20,'20 × 20 cm'],[30,'30 × 30 cm']]);
  el('p','sp-note',esc(L('The logo goes on the other side.','اللوجو بيتطبع على الناحية التانية.')),info);
  const acts=el('div','sp-acts',null,info);const buy=el('button','sp-buy',esc(L('Customize & buy','خصّص واشتري')),acts);buy.type='button';buy.disabled=!!(d&&d.soldOut);
  buy.onclick=()=>{const pid=p.productId,did=s.d,sd=s.side,ps=s.ps,c=s.c;closePanel();api.open(pid,did,sd,ps,c)};
  const det=el('a','sp-det',esc(L('Full details','كل التفاصيل')),acts);det.href='#/product/'+encodeURIComponent(p.productId);det.onclick=()=>closePanel()};
 [['FRONT',L('Front view','قدّام')],['BACK',L('Back view','ضهر')]].forEach(([v,t])=>{const b=el('button','',esc(t),flip);b.type='button';b.dataset.v=v;b.onclick=()=>{view=v;draw()}});
 draw();ov.onclick=e=>{if(e.target===ov)closePanel()};x.onclick=()=>closePanel();
 const key=e=>{if(e.key==='Escape')closePanel();if(e.key==='Tab'){const q=[...sh.querySelectorAll('button:not([disabled]),a[href]')];if(!q.length)return;const i=q.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){e.preventDefault();q[q.length-1].focus()}else if(!e.shiftKey&&i===q.length-1){e.preventDefault();q[0].focus()}}};
 document.addEventListener('keydown',key);panel={ov,key};document.documentElement.classList.add('sp-lock');requestAnimationFrame(()=>{ov.classList.add('on');x.focus({preventScroll:true})});
 if(api.track)try{api.track(p)}catch(_){}}
function closePanel(now){if(!panel)return;const {ov,key}=panel;panel=null;document.removeEventListener('keydown',key);document.documentElement.classList.remove('sp-lock');if(now){ov.remove();return}ov.classList.remove('on');setTimeout(()=>ov.remove(),380);if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true})}catch(_){}}

/* ---------------- shared bits ---------------- */
function reveal(){if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){root.querySelectorAll('.rv').forEach(x=>x.classList.add('in'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});root.querySelectorAll('.rv').forEach(x=>io.observe(x));cleans.push(()=>io.disconnect())}
const drop=()=>esc(api.dropLabel()||'Drop 01');
function head(par,kick,title,sub,cls){return el('header','sp-head rv'+(cls?' '+cls:''),`${kick?`<span class="sp-kick">${kick}</span>`:''}<h2>${title}</h2>${sub?`<p>${sub}</p>`:''}`,par)}
function grid(par,list,o){const g=el('div','sp-grid'+(o&&o.cls?' '+o.cls:''),null,par);list.forEach((p,i)=>{const c=card(p,Object.assign({},o||{},{num:o&&o.num?i+1:0}));c.classList.add('rv');c.style.transitionDelay=(i%4)*60+'ms';g.appendChild(c)});return g}
function filters(par,onChange){const bar=el('div','sp-filters rv',null,par),chips=el('div','sp-chips',null,bar);let k='all',c='';
 kindsPresent().forEach(([id,en,a])=>{const b=el('button',id==='all'?'on':'',esc(L(en,a)),chips);b.type='button';b.onclick=()=>{k=id;[...chips.children].forEach(x=>x.classList.toggle('on',x===b));onChange(k,c)}});
 const cols=[...new Map(P().flatMap(p=>p.colors).map(x=>[lc(x),x])).values()];if(cols.length>1){const w=el('div','sp-cf',null,bar);cols.forEach(col=>{const b=el('button','',null,w);b.type='button';b.style.setProperty('--c',api.hex(col));b.title=api.cName(col);b.setAttribute('aria-label',api.cName(col));b.onclick=()=>{c=c===col?'':col;[...w.children].forEach(x=>x.classList.toggle('on',x===b&&c));onChange(k,c)}})}return bar}
function applyFilter(g,k,c){[...g.children].forEach(cd=>{const p=cd._p,ok=(k==='all'||kind(p)===k)&&(!c||p.colors.some(x=>lc(x)===lc(c)));cd.hidden=!ok;if(ok&&c){st(p).c=p.colors.find(x=>lc(x)===lc(c));paintFig(cd._f,p);const sw=cd.querySelector('.sp-sw');if(sw)[...sw.children].forEach((b,i)=>b.classList.toggle('on',lc(p.colors[i])===lc(c)))}})}
function bigImg(par,src,cls,alt){const f=el('figure','sp-img rv'+(cls?' '+cls:''),`<img src="${esc(src)}" alt="${esc(alt||'')}" loading="lazy" decoding="async">`,par);return f}
function statement(par,cls){return el('section','sp-state rv'+(cls?' '+cls:''),`<p>${esc(L('Same mindset. Different generation.','نفس العقلية. جيل مختلف.'))}</p><span>TEMPORARY™ · ${drop()}</span>`,par)}
function editionBlock(par){const ds=DS();const s=el('section','sp-ed rv',`<span class="sp-kick">${drop()}</span><h2>${esc(L('The edition','الإصدار'))}</h2><p>${esc(editionLine())}</p>`,par);const w=el('div','sp-edd',null,s);ds.forEach(d=>{const u=api.art(d,'FRONT')||api.art(d,'BACK');el('div','',`${u?`<img src="${esc(u)}" alt="" loading="lazy">`:''}<b>${esc(api.dName(d))}</b><span>${esc(stockLine(d))}</span>`,w)});return s}

/* ================= the 10 layouts ================= */
const LAY={};
/* 1 MAISON — after Prestige: one huge image per screen, generous space, quiet type */
LAY.maison=r=>{
 const h=el('section','sp-hero mz-hero',`<img src="${esc(A('heroes/main.webp'))}" alt="" fetchpriority="high"><div class="mz-cap rv"><span class="sp-kick">${drop()}</span><h1>${esc(L('Everything is temporary.','كل حاجة مؤقتة.'))}</h1><p>${esc(editionLine())}</p><a class="sp-link" href="#mzPieces">${esc(L('Discover the pieces','اكتشف القطع'))}</a></div>`,r);
 const sp=el('section','mz-split',null,r);bigImg(sp,A('cine/vault-in.webp'),'mz-tall');el('div','mz-copy rv',`<span class="sp-kick">${esc(L('The house','البيت'))}</span><h2>${esc(L('Made to order. Made to last.','بيتعمل مخصوص ليك. ويعيش معاك.'))}</h2><p>${esc(L('Every piece is printed after you order it, in the design, placement and size you choose. Limited pieces per design, never restocked.','كل قطعة بتتطبع بعد ما تطلبها، بالتصميم والمكان والمقاس اللي تختاره. كمية محدودة لكل تصميم ومفيش إعادة إنتاج.'))}</p>`,sp);
 const s=el('section','sp-sec',null,r);s.id='mzPieces';head(s,drop(),esc(L('The pieces','القطع')));grid(s,P(),{cls:'mz-grid',sw:true});
 const lb=el('section','mz-look',null,r);bigImg(lb,A('cine/mirror.webp'));bigImg(lb,A('cine/fitting.webp'));
 statement(r,'mz-state');
};
/* 2 ATELIER — after Symmetry: organised merchandising, filters, swatches */
LAY.atelier=r=>{
 const s=el('section','sp-sec at-sec',null,r);head(s,drop(),esc(L('Shop the collection','تسوّق المجموعة')),esc(editionLine()));
 let g;filters(s,(k,c)=>applyFilter(g,k,c));g=grid(s,P(),{cls:'at-grid'});
 editionBlock(r);
};
/* 3 DROP — after Impulse: a shoppable hero, then the drop */
LAY.drop=r=>{
 const h=el('section','dr-hero',`<img class="dr-bg" src="${esc(A('cine/runway.webp'))}" alt=""><div class="dr-shade"></div><div class="dr-t rv"><span class="sp-kick">${drop()}</span><h1>${esc(L('Shop the look','اختار اللوك'))}</h1><p>${esc(L('Tap a piece to choose your design.','اضغط على أي قطعة واختار تصميمك.'))}</p></div>`,r);
 const line=el('div','dr-line',null,h);const ps=P().slice(0,Math.min(4,P().length));ps.forEach((p,i)=>{const w=el('button','dr-m',null,line);w.type='button';w.setAttribute('aria-label',api.pName(p));w.appendChild(fig(p,{view:'FRONT'}));el('span','dr-pin','<i>+</i><em>'+esc(api.pName(p))+' · '+esc(money(p))+'</em>',w);w.onclick=()=>openPanel(p);w.style.setProperty('--i',i)});
 const st2=el('section','dr-stats rv',`<div><b>${DS().length}</b><span>${esc(L('designs','تصميم'))}</span></div><div><b>${esc(String((DS()[0]||{}).productionLimit||'—'))}</b><span>${esc(L('pieces of each','قطعة من كل تصميم'))}</span></div><div><b>0</b><span>${esc(L('restocks','إعادة إنتاج'))}</span></div>`,r);
 const s=el('section','sp-sec',null,r);head(s,'',esc(L('The drop','الدروب')));grid(s,P(),{cls:'dr-grid'});
};
/* 4 BROADCAST — after Broadcast: fast shopping in swipeable rows, one tap to choose */
LAY.broadcast=r=>{
 const h=el('section','bc-top rv',`<span class="sp-kick">${drop()}</span><h1>${esc(L('New this drop','الجديد في الدروب'))}</h1><p>${esc(editionLine())}</p>`,r);
 kindsPresent().filter(k=>k[0]!=='all').forEach(([id,en,a])=>{const list=P().filter(p=>kind(p)===id);if(!list.length)return;const s=el('section','bc-row rv',`<div class="bc-h"><h2>${esc(L(en,a))}</h2><span>${list.length} ${esc(L(list.length>1?'pieces':'piece','قطعة'))}</span></div>`,r);const tr=el('div','bc-track',null,s);list.forEach(p=>tr.appendChild(card(p,{quick:true})))});
 editionBlock(r);
};
/* 5 THE EDITION — after Be Yours: every piece told as a story */
LAY.edition=r=>{
 el('section','ed-top rv',`<span class="sp-kick">${drop()}</span><h1>${esc(L('The Edition','الإصدار'))}</h1><p>${esc(editionLine())}</p>`,r);
 const nav=el('nav','ed-nav',null,r);nav.setAttribute('aria-label',L('Pieces','القطع'));
 P().forEach((p,i)=>{const id='ed-'+i;const a=el('a','',esc(api.pName(p)),nav);a.href='#'+id;a.onclick=e=>{e.preventDefault();document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'})};
  const d=dById(st(p).d),u=d?(api.art(d,'FRONT')||api.art(d,'BACK')):'';
  const ch=el('article','ed-ch',null,r);ch.id=id;
  const a1=el('div','ed-a rv',null,ch);a1.appendChild(fig(p,{view:'BACK'}));el('span','ed-cap',esc(L('The design · on the back','التصميم · على الضهر')),a1);
  const tx=el('div','ed-b rv',`<span class="sp-kick">N°${String(i+1).padStart(2,'0')}</span><h2>${esc(api.pName(p))}</h2><div class="sp-price">${esc(money(p))}</div>
   <dl><div><dt>${esc(L('The design','التصميم'))}</dt><dd>${esc(d?api.dName(d):'—')}${u?`<img src="${esc(u)}" alt="">`:''}</dd></div><div><dt>${esc(L('The fit','القَصّة'))}</dt><dd>${esc(/oversized/i.test(p.productName)?L('Oversized, dropped shoulders','أوفر سايز، كتف نازل'):L('Regular fit','قَصّة عادية'))}</dd></div><div><dt>${esc(L('The colours','الألوان'))}</dt><dd>${p.colors.map(c=>esc(api.cName(c))).join(' · ')}</dd></div><div><dt>${esc(L('The edition','الإصدار'))}</dt><dd>${esc(stockLine(d))}</dd></div></dl>`,ch);
  const b=el('button','sp-buy',esc(L('Choose your piece','اختار قطعتك')),tx);b.type='button';b.onclick=()=>openPanel(p);
  const a2=el('div','ed-c rv',null,ch);a2.appendChild(fig(p,{view:'FRONT'}));el('span','ed-cap',esc(L('The fit · front','القَصّة · قدّام')),a2)});
};
/* 6 SWIFT — after Enterprise: the lightest, fastest store for Instagram traffic */
LAY.swift=r=>{
 el('section','sw-top',`<h1>${drop()}</h1><p>${esc(editionLine())}</p>`,r);
 const s=el('section','sp-sec sw-sec',null,r);let g;filters(s,(k,c)=>applyFilter(g,k,c));g=grid(s,P(),{cls:'sw-grid',sw:false});
};
/* 7 HYPER — after Hyper: bold type, numbered index, strict grid */
LAY.hyper=r=>{
 el('section','hy-top rv',`<span class="sp-kick">TEMPORARY™ / ${drop()}</span><h1>${esc(L('Not for','مش')).toUpperCase()}<br>${esc(L('everyone.','لأي حد.')).toUpperCase()}</h1><p>${esc(editionLine())}</p>`,r);
 const ix=el('ol','hy-index rv',null,r);P().forEach((p,i)=>{const li=el('li','',`<span>${String(i+1).padStart(2,'0')}</span><b>${esc(api.pName(p))}</b><em>${esc(money(p))}</em>`,ix);li.tabIndex=0;li.onclick=()=>openPanel(p);li.onkeydown=e=>{if(e.key==='Enter')openPanel(p)}});
 const s=el('section','sp-sec',null,r);grid(s,P(),{cls:'hy-grid',num:true});
};
/* 8 CONCEPT — after Concept: editorial mosaic mixing rooms and pieces */
LAY.concept=r=>{
 el('section','co-top rv',`<span class="sp-kick">${drop()}</span><h1><i>${esc(L('Temporary','مؤقت'))}</i> ${esc(L('people,','ناس،'))}<br>${esc(L('bolder today.','أجرأ النهارده.'))}</h1>`,r);
 const m=el('section','co-mosaic',null,r);const rooms=['cine/rooftop.webp','cine/metro.webp','cine/darkroom.webp','cine/museum.webp'];let ri=0;
 P().forEach((p,i)=>{if(i%3===1&&ri<rooms.length){const f=bigImg(m,A(rooms[ri++]),'co-room');if(ri===1)el('figcaption','',esc(L('Opening night · Cairo','ليلة الافتتاح · القاهرة')),f)}const c=card(p);c.classList.add('rv');if(i%4===0)c.classList.add('co-wide');m.appendChild(c)});
 statement(r,'co-state');
};
/* 9 INDEX — after Eurus: every piece in every colour, at a glance */
LAY.index=r=>{
 el('section','ix-top rv',`<span class="sp-kick">${drop()} · INDEX</span><h1>${esc(L('Every piece, every colour.','كل قطعة، بكل لون.'))}</h1><p>${esc(editionLine())}</p>`,r);
 const t=el('section','ix-list',null,r);
 P().forEach((p,i)=>{const row=el('div','ix-row rv',`<div class="ix-h"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(api.pName(p))}</b><em>${esc(money(p))}</em></div>`,t);const w=el('div','ix-cols',null,row);
  p.colors.forEach(c=>{const b=el('button','ix-c',null,w);b.type='button';b.setAttribute('aria-label',api.pName(p)+' · '+api.cName(c));b.appendChild(fig(p,{c,view:'FRONT',d:null}));el('span','',`<i style="--c:${esc(api.hex(c))}"></i>${esc(api.cName(c))}`,b);b.onclick=()=>{st(p).c=c;openPanel(p)}})});
};
/* 10 SLEEK — after Sleek: one piece fills the screen; swipe to the next */
LAY.sleek=r=>{
 const deck=el('section','sl-deck',null,r);deck.setAttribute('aria-label',L('Pieces','القطع'));const dots=el('div','sl-dots',null,r);
 P().forEach((p,i)=>{const sl=el('div','sl-slide',null,deck);sl.appendChild(fig(p,{view:'BACK'}));el('div','sl-t',`<span>${String(i+1).padStart(2,'0')} / ${String(P().length).padStart(2,'0')}</span><h2>${esc(api.pName(p))}</h2><p>${esc(money(p))}</p>`,sl);const b=el('button','sp-buy',esc(L('Choose','اختار')),sl.lastChild);b.type='button';b.onclick=()=>openPanel(p);
  const d=el('button','',null,dots);d.type='button';d.setAttribute('aria-label',api.pName(p));d.onclick=()=>sl.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'})});
 const set=()=>{const i=Math.round(deck.scrollLeft/Math.max(1,deck.clientWidth))*(ar()?-1:1);[...dots.children].forEach((d,j)=>d.classList.toggle('on',j===Math.abs(i)))};deck.addEventListener('scroll',set,{passive:true});set();
 el('p','sl-hint',esc(L('Swipe · tap Choose','اسحب · اضغط اختار')),r);
};

/* ================= shell ================= */
let cssP=null;
function ensure(id){if(!cssP)cssP=new Promise(ok=>{const l=document.createElement('link');l.rel='stylesheet';l.href=BASE+'shop.css?v=2';l.onload=ok;l.onerror=ok;document.head.appendChild(l);setTimeout(ok,4000)});
 const f=FONTS[id];if(f&&!document.getElementById('spf-'+id)){const l=document.createElement('link');l.id='spf-'+id;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f+'&display=swap';document.head.appendChild(l)}return cssP}
function unmount(){closePanel(true);cleans.forEach(f=>{try{f()}catch(_){}});cleans=[];if(root){root.remove();root=null}live=false}
function mount(id,a,h){if(!LAY[id]||!a||!h)return false;unmount();api=a;host=h;if(!P().length)return false;live=true;const tok={};mount._t=tok;
 ensure(id).then(()=>{if(!live||mount._t!==tok||!h.isConnected)return;try{root=el('div','sp-root sp-'+id,null,h);root.dir=ar()?'rtl':'ltr';LAY[id](root);reveal()}catch(e){console.error('shop',e);unmount();h.dispatchEvent(new Event('cinefail'))}});return true}
window.TemporaryShop={ids:IDS,has:id=>!!LAY[id],mount,unmount,ensure,open:id=>{const p=P().find(x=>x.productId===id);if(p)openPanel(p)}};
})();
