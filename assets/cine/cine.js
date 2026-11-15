/* TEMPORARY cinematic theme intros. Loaded only when a cinematic theme is active.
   Reads products, designs, prices, stock and print placement from the site (Google Sheet); nothing is hard-coded here. */
(function(){
'use strict';
const BASE=((document.currentScript&&document.currentScript.src)||'assets/cine/cine.js').replace(/cine\.js.*$/,'');
const A=n=>BASE+n;
let root,R,api,opts,pend=[],cleans=[],closed=true,curSel=null,cardEl,enterEl,hintEl;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ar=()=>api&&api.lang()==='ar';
const L=(en,a)=>ar()&&a?a:en;
function T(ms,fn){const id=setTimeout(()=>{pend=pend.filter(x=>x!==id);if(!closed)fn()},ms);pend.push(id);return id}
function loop(fn){let live=true;const f=()=>{if(!live)return;fn();requestAnimationFrame(f)};requestAnimationFrame(f);cleans.push(()=>live=false)}
function el(tag,cls,html,par){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;(par||R).appendChild(e);return e}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const raf2=f=>requestAnimationFrame(()=>requestAnimationFrame(f));
const on=(...a)=>a.forEach(x=>x&&x.classList.add('on')),off=(...a)=>a.forEach(x=>x&&x.classList.remove('on'));
function bg(name,cls,par){const d=el('div','cn-L cn-bg '+(cls||''),null,par);d.style.backgroundImage=`url("${A(name)}")`;return d}
function kick(text,top){const k=el('div','cn-kick',text);k.style.top=top||'9%';return k}
function cta(label,cb,auto){const b=el('button','cn-cta',label);b.type='button';let used=false;const go=()=>{if(used)return;used=true;b.remove();cb()};b.onclick=e=>{e.stopPropagation();go()};if(auto)T(auto,go);return b}
function video(name,poster){const v=el('video','cn-vid');v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';if(poster)v.poster=A(poster);v.src=A(name);return v}
function playThen(v,cb,maxMs){let used=false;const go=()=>{if(used)return;used=true;cb()};v.addEventListener('ended',go);v.addEventListener('error',go);T(maxMs||7500,go);const p=v.play();if(p&&p.catch)p.catch(go)}

/* ---- looks: product + design, drawn with the customizer's own placement rows ---- */
let LK=[],K=0,VIEW=null,dock,rail;
function mkLooks(){const P=api.products().slice(0,8),all=api.designs(),D=all.filter(d=>!d.soldOut),ds=D.length?D:all;LK=P.map((p,i)=>({p,d:ds.length?ds[i%ds.length]:null}));K=0;return LK}
function layer(f,url,g,cls){if(!url||!g)return null;const a=el('div','a '+(cls||''),null,f);Object.assign(a.style,{width:g.width+'%',height:(g.height||g.width)+'%',left:g.left+'%',top:g.top+'%',opacity:g.opacity==null?1:g.opacity,transform:`translate(-50%,-50%) rotate(${g.rotation||0}deg)`});const i=el('img','',null,a);i.src=url;i.alt='';i.draggable=false;return a}
function setLook(f,l){f._l=l;const p=l.p,c=api.previewColor(p),m=api.mockup(p,c);f.style.setProperty('--m',`url("${m}")`);const b=f.querySelector('.b');if(b.getAttribute('src')!==m)b.src=m;b.alt=api.pName(p);f.querySelectorAll('.a').forEach(x=>x.remove());if(l.d)layer(f,api.art(l.d,'FRONT'),api.placement(p.productId,c,'DESIGN',l.d.designId,'FRONT',20),'ds');layer(f,api.logoUrl(),api.placement(p.productId,c,'LOGO','','BACK',api.logoCm()),'lg')}
function fig(l,cls,par){const f=el('div','cn-fig '+(cls||''),null,par);el('i','dc',null,f);const b=el('img','b',null,f);b.draggable=false;setLook(f,l);return f}
/* feet land on the floor: the model's shoes sit at 86% of the 4:5 figure box */
function stand(f,widthPct,feetPx,cxPct){const W=R.clientWidth,h=widthPct/100*W*1.25;f.style.width=widthPct+'%';f.style.left=(cxPct-widthPct/2)+'%';f.style.top=(feetPx-h*.875)+'px'}
function floorY(){const H=R.clientHeight;return dock?Math.min(H*.74,H-dock.offsetHeight-R.clientWidth*.075):H*.7}
/* depth carousel: one hero look on the floor, the previous / next product standing behind it */
function carousel(o){o=o||{};const par=o.par||R,n=LK.length,cls=(o.cls||'')+' '+(o.deco||'');const hero=fig(LK[0],'cn-hero '+cls,par),left=n>2&&o.sides!==false?fig(LK[n-1],'cn-side '+cls,par):null,right=n>1&&o.sides!==false?fig(LK[1%n],'cn-side '+cls,par):null;
 hero.style.zIndex=12;hero.onclick=e=>e.stopPropagation();if(left)left.onclick=e=>{e.stopPropagation();go(K-1)};if(right)right.onclick=e=>{e.stopPropagation();go(K+1)};
 const c={hero,left,right,els:[hero,left,right].filter(Boolean),
  lay(){const fy=floorY(),H=R.clientHeight,W=R.clientWidth,top=(o.head||.34)*H,w=Math.max(40,Math.min(o.w||72,(fy-top)/.73/1.25/W*100));stand(hero,w,fy,50);const sw=w*(o.sw||.62),sy=fy-(fy-top)*(o.rise==null?.2:o.rise),dx=o.dx||.56;if(left)stand(left,sw,sy,50-w*dx);if(right)stand(right,sw,sy,50+w*dx)},
  fill(){setLook(hero,LK[K]);if(left)setLook(left,LK[(K-1+n)%n]);if(right)setLook(right,LK[(K+1)%n])},
  apply(first){if(first||o.swap===false){c.fill();return}if(typeof o.swap==='function'){o.swap(c);return}c.els.forEach(x=>x.classList.add('cn-sw'));T(230,()=>{c.fill();c.els.forEach(x=>x.classList.remove('cn-sw'))})},
  show(){c.lay();c.els.forEach((x,i)=>T(i?450+i*150:0,()=>on(x)))}};
 c.lay();const ro=()=>c.lay();addEventListener('resize',ro);cleans.push(()=>removeEventListener('resize',ro));
 VIEW=c;return c}
function go(k){const n=LK.length;if(!n)return;K=((k%n)+n)%n;if(VIEW)VIEW.apply();paint()}
function setDesign(d){LK[K]={p:LK[K].p,d};if(VIEW)VIEW.apply();paint()}
function stockLine(d){if(!d)return api.t('limitedRun');if(d.soldOut)return api.t('soldOut');const rem=Number(d.remaining)||0,lim=Number(d.productionLimit)||0;if(!api.showLeft(rem))return L('Limited run · this design','كمية محدودة · التصميم ده');return lim?L(`${rem} of ${lim} left · this design`,`فاضل ${rem} من ${lim} · التصميم ده`):L(`${rem} left · this design`,`فاضل ${rem} · التصميم ده`)}
function paint(){if(!cardEl||!LK.length)return;const l=LK[K],p=l.p,d=l.d,ds=api.designs();
 cardEl.dir=ar()?'rtl':'ltr';cardEl.innerHTML=(ds.length>1?`<div class="dz">${ds.map((x,i)=>`<button type="button" data-i="${i}" class="${d&&x.designId===d.designId?'on':''}" ${x.soldOut?'disabled':''}>${esc(api.dName(x))}</button>`).join('')}</div>`:'')+`<span class="k">${esc(String((ds.length>1?'':(d?api.dName(d)+' · ':''))+stockLine(d)).toUpperCase())}</span><b>${esc(api.pName(p))}</b><span>${esc(api.money(p.price,p.currency))}</span><button type="button" class="buy" ${d&&d.soldOut?'disabled':''}>${esc(L('CUSTOMIZE','خصّص'))}</button>`;
 cardEl.querySelectorAll('.dz button').forEach(b=>b.onclick=e=>{e.stopPropagation();setDesign(ds[Number(b.dataset.i)])});
 cardEl.querySelector('.buy').onclick=e=>{e.stopPropagation();finish();api.open(p.productId,d&&d.designId)};
 if(rail)[...rail.children].forEach((b,i)=>{const o=i===K;b.classList.toggle('on',o);if(o&&rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:b.offsetLeft-rail.clientWidth/2+b.offsetWidth/2,behavior:'smooth'})});if(VIEW&&VIEW.lay)requestAnimationFrame(()=>{if(VIEW&&VIEW.lay)VIEW.lay()})}
/* bottom dock: product switcher, product card, enter-the-store. Built up-front (hidden) so the floor line is known. */
function mkDock(){dock=el('div','cn-dock');dock.onclick=e=>e.stopPropagation();if(LK.length>1){rail=el('div','cn-rail',LK.map((l,i)=>`<button type="button" data-i="${i}">${esc(api.pName(l.p).toUpperCase())}</button>`).join(''),dock);rail.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();go(Number(b.dataset.i))})}
 cardEl=el('div','cn-card',null,dock);enterEl=el('button','cn-enter',esc(L('ENTER THE STORE','ادخل المتجر'))+' <span>→</span>',dock);enterEl.type='button';enterEl.onclick=e=>{e.stopPropagation();finish()};paint()}
/* every scene ends here */
function store(){if(closed||!dock)return;paint();raf2(()=>on(dock))}

/* ---- particles ---- */
const SPR={};
function spr(c){if(SPR[c])return SPR[c];const s=document.createElement('canvas');s.width=s.height=128;const x=s.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,`rgba(${c},.5)`);g.addColorStop(.45,`rgba(${c},.2)`);g.addColorStop(1,`rgba(${c},0)`);x.fillStyle=g;x.fillRect(0,0,128,128);return SPR[c]=s}
const dot=(x,p,o,a)=>{x.globalAlpha=Math.max(0,a);x.fillStyle=`rgb(${p.c||o.col})`;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()};
const FX={
 smoke:{n:26,make:(W,H,i)=>({x:rnd(-.1,1.1)*W,y:i?rnd(.2,1.1)*H:H*rnd(1,1.2),r:rnd(.22,.45)*W,vx:rnd(-.25,.25),vy:-rnd(.3,.9),l:i?rnd(0,300):0,m:rnd(360,620)}),step(p){p.x+=p.vx;p.y+=p.vy;p.r*=1.0012;if(++p.l>p.m)p.dead=1},draw(x,p,o){x.globalAlpha=Math.max(0,Math.sin(Math.PI*p.l/p.m))*o.op;x.drawImage(spr(o.col),p.x-p.r,p.y-p.r,p.r*2,p.r*2)}},
 dust:{n:46,make:(W,H)=>({x:rnd(0,W),y:rnd(0,H),r:rnd(1,2.6),vx:rnd(-.15,.15),vy:rnd(-.25,.05),l:0,m:rnd(200,500)}),step(p){p.x+=p.vx;p.y+=p.vy;if(++p.l>p.m)p.dead=1},draw(x,p,o){dot(x,p,o,Math.sin(Math.PI*p.l/p.m)*.8)}},
 confetti:{n:60,make:(W,H,i)=>({x:rnd(0,W),y:i?rnd(0,H):-10,r:rnd(3,7),vy:rnd(.7,2),ph:rnd(0,6),l:0,c:['243,217,160','255,90,170','90,220,255','255,255,255'][Math.floor(rnd(0,4))]}),step(p,W,H){p.l++;p.y+=p.vy;p.x+=Math.sin(p.ph+p.l/26)*.9;if(p.y>H+10)p.dead=1},draw(x,p){x.globalAlpha=.9;x.fillStyle=`rgb(${p.c})`;x.save();x.translate(p.x,p.y);x.rotate(p.ph+p.l/14);x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()}},
 ash:{n:26,make:(W,H,i)=>({x:rnd(0,W),y:i?rnd(0,H):-10,r:rnd(1.5,4),vy:rnd(.4,1.1),ph:rnd(0,6),l:0}),step(p,W,H){p.l++;p.y+=p.vy;p.x+=Math.sin(p.ph+p.l/30)*.6;if(p.y>H+10)p.dead=1},draw(x,p,o){x.globalAlpha=.8;x.fillStyle=`rgb(${o.col})`;x.fillRect(p.x,p.y,p.r,p.r*.6)}},
 flash:{n:6,make:(W,H)=>({x:Math.random()<.5?rnd(0,.2)*W:rnd(.8,1)*W,y:rnd(.5,.9)*H,r:rnd(5,11),l:-rnd(10,150),m:7}),step(p){if(++p.l>p.m)p.dead=1},draw(x,p,o){if(p.l<0)return;x.globalAlpha=1-p.l/p.m;x.drawImage(spr('255,255,255'),p.x-p.r*6,p.y-p.r*6,p.r*12,p.r*12)}}
};
function fx(type,o){o=Object.assign({op:.5,col:'200,195,185'},o||{});const par=o.par||R,d=FX[type],c=el('canvas','cn-cv',null,par);if(o.z!=null)c.style.zIndex=o.z;const W=c.width=Math.max(2,par.clientWidth*1.4),H=c.height=Math.max(2,par.clientHeight*1.4),x=c.getContext('2d'),P=[];for(let i=0;i<(o.n||d.n);i++)P.push(d.make(W,H,1));loop(()=>{x.clearRect(0,0,W,H);for(let i=0;i<P.length;i++){const p=P[i];d.step(p,W,H);if(p.dead)P[i]=d.make(W,H,0);else d.draw(x,p,o)}x.globalAlpha=1});return c}
function reveal(figs,gap,cls){figs.forEach((f,i)=>T(i*(gap||350),()=>f.classList.add(cls||'on')))}
const drop=()=>esc((api.dropLabel()||'DROP 01').toUpperCase());
const WORD='<span class="cn-logo">TEMPORARY™</span>';

/* ================= scenes ================= */
const SC={};
SC.vault=()=>{
 const room=bg('vault-in.webp');el('div','cn-floorglow',null,room);const c=carousel({deco:'t-ped'});
 const sm=fx('smoke',{z:30,col:'226,200,150',op:.5});
 const v=video('vault.mp4','vault-poster.webp');v.style.zIndex=40;v.classList.add('cn-fade');
 const k=kick(L('PRIVATE VAULT','الخزنة الخاصة')+' · '+drop());k.style.zIndex=41;
 cta(L('OPEN THE VAULT','افتح الخزنة'),()=>{k.style.opacity=0;playThen(v,()=>{v.classList.add('cn-hide');T(400,()=>c.show());T(1500,()=>{sm.style.transition='opacity 3s';sm.style.opacity=.3;store()})})},2600);
};
SC.museum=()=>{
 const b=bg('museum.webp','mu-bg');const g=el('div','mu-grid');const n=LK.length;g.style.gridTemplateRows=`repeat(${Math.ceil(n/2)},1fr)`;
 const cs=LK.map((l,i)=>{const c=el('div','mu-case',`<i>N°0${i+1}</i>`,g);c._f=fig(l,'',c);c.onclick=e=>{e.stopPropagation();go(i)};return c});
 g.style.bottom=(R.clientHeight-floorY()+R.clientWidth*.03)+'px';
 VIEW={apply(){cs.forEach((c,i)=>{c.classList.toggle('sel',i===K);if(c._f._l!==LK[i])setLook(c._f,LK[i])})}};
 fx('dust',{z:8,col:'245,220,170'});
 const tor=el('div','cn-L cn-fade');tor.style.cssText='z-index:20;background:#000e;pointer-events:none';
 const k=kick(L('AFTER HOURS','بعد الإغلاق')+' · '+drop(),'6%');k.style.zIndex=21;
 const cen=i=>{const c=cs[i],r=c.getBoundingClientRect(),s=R.getBoundingClientRect();return[(r.left+r.width/2-s.left)/s.width*100,(r.top+r.height/2-s.top)/s.height*100]};
 let pts=null,st=null;
 loop(()=>{if(st==null)return;const t=(performance.now()-st)/800,i=Math.min(Math.floor(t),pts.length-2),f=Math.min(1,t-i),e=f<.5?2*f*f:1-2*(1-f)*(1-f),x=pts[i][0]+(pts[i+1][0]-pts[i][0])*e,y=pts[i][1]+(pts[i+1][1]-pts[i][1])*e,r=R.clientWidth*.24;tor.style.background=`radial-gradient(circle at ${x}% ${y}%,#0000 0 ${r*.55}px,#000e ${r*1.35}px)`});
 cta(L('LIGHT THE TORCH','أشعل الضوء'),()=>{pts=[[50,-15]].concat(cs.map((c,i)=>cen(i)),[[50,40]]);st=performance.now();cs.forEach((c,i)=>T(800*(i+1),()=>on(c)));const end=800*(n+1);T(end,()=>{tor.classList.add('cn-hide');b.classList.add('lit');k.textContent=L('THE COLLECTION · TAP A PIECE','المجموعة · اختار قطعتك')});T(end+400,()=>{VIEW.apply();store()})},2600);
};
SC.elevator=()=>{
 bg('elevator-in.webp');const c=carousel({cls:'refl',sides:false,w:84,head:.3});let busy=false,auto=true;
 const shut=el('div','el-shut','<i></i><i></i>');const pan=el('div','el-panel');
 const label=()=>{pan.innerHTML=`<small>${esc(L('FLOOR','الدور'))} ${String(K+1).padStart(2,'0')} / ${String(LK.length).padStart(2,'0')}</small>${esc(api.pName(LK[K].p).toUpperCase())}`};
 VIEW={apply(){if(busy){c.fill();label();return}busy=true;shut.classList.add('shut');T(520,()=>{c.fill();label();T(240,()=>{shut.classList.remove('shut');busy=false})})}};
 const stop=()=>{auto=false};R.addEventListener('pointerdown',stop,{once:true});
 const v=video('elevator.mp4','elevator-poster.webp');v.style.zIndex=50;v.classList.add('cn-fade');
 const k=kick(L('PRIVATE LIFT','المصعد الخاص')+' · '+drop());k.style.zIndex=51;
 const cyc=()=>T(3600,()=>{if(auto&&LK.length>1){go(K+1);cyc()}});
 cta(L('CALL THE LIFT','اطلب المصعد'),()=>{k.style.opacity=0;playThen(v,()=>{v.classList.add('cn-hide');label();on(pan);c.show();store();T(900,()=>{auto=true;R.addEventListener('pointerdown',stop,{once:true});cyc()})})},2600);
};
SC.runway=()=>{
 bg('runway.webp');fx('flash',{z:6});fx('smoke',{z:4,col:'200,190,170',op:.25,n:12});
 const wl=LK.slice(0,3),walkers=wl.map(l=>fig(l,'rw-walk'));const c=carousel({cls:'refl',deco:'t-walk',sides:false,w:78,swap:c=>{c.hero.classList.add('rw-far');c.fill();raf2(()=>raf2(()=>c.hero.classList.remove('rw-far')))}});
 const cur=el('div','cn-L rw-cur',WORD);const k=kick(drop()+' · '+L('THE SHOW','العرض'));k.style.zIndex=51;
 cta(L('RAISE THE CURTAIN','ارفع الستارة'),()=>{k.style.opacity=0;cur.classList.add('up');const fy=floorY(),step=2400;walkers.forEach((m,n)=>{const t=1300+n*step;m.style.top=(fy-R.clientWidth*.7*1.25*.875)+'px';T(t,()=>m.classList.add('go'));T(t+step-350,()=>{m.style.opacity=0})});const end=1300+walkers.length*step;T(end,()=>{kick(L('THE FINALE','الختام'),'10%');c.show()});T(end+700,()=>store())},2600);
};
SC.rooftop=()=>{
 const v=video('fireworks.mp4','fireworks-poster.webp');v.loop=true;const p=v.play();if(p&&p.catch)p.catch(()=>{});
 const sh=el('div','cn-L');sh.style.cssText='background:linear-gradient(#0007,#0000 30%,#0000 55%,#000a)';
 fx('confetti',{z:25});const a=el('div','rt-neon rt-ar','TEMPORARY™'),e=el('div','rt-neon rt-en',L('NOW OPEN · CAIRO','الافتتاح · القاهرة'));
 const c=carousel({head:.36,deco:'t-neon',rise:.1});T(400,()=>on(a));T(1100,()=>on(e));
 cta(L('JOIN THE PARTY','ادخل الحفلة'),()=>{a.style.transition=e.style.transition='top 1s,transform 1s';a.style.top='8%';a.style.transform='scale(.7)';e.style.top='19%';c.show();T(1200,()=>store())},3000);
};
SC.mask=()=>{
 bg('mirror.webp');const c=carousel({cls:'refl',sides:false,w:60});
 const ech=[[.76,.5,.8],[.56,.84,.5],[.4,1.08,.28]].flatMap(([s,dx,op])=>[-1,1].map(sg=>{const f=fig(LK[0],'mk-echo');f._e=[s,dx*sg,op];f.onclick=e=>{e.stopPropagation();go(K+sg)};return f}));
 const lay0=c.lay,fill0=c.fill;c.lay=()=>{lay0();const hw=parseFloat(c.hero.style.width),fy=floorY(),hh=hw/100*R.clientWidth*1.25;ech.forEach(f=>{const[s,dx]=f._e;stand(f,hw*s,fy-(1-s)*hh*.42,50+dx*hw)})};c.fill=()=>{fill0();ech.forEach(f=>setLook(f,LK[K]))};
 const show0=c.show;c.show=()=>{show0();ech.forEach((f,i)=>T(500+i*120,()=>{f.style.opacity=f._e[2]}))};
 fx('smoke',{z:4,col:'190,200,215',op:.22,n:10});
 const fl=el('div','cn-L mk-flash');const v=video('mask.mp4','mask-poster.webp');v.style.zIndex=40;v.classList.add('cn-fade');
 const k=kick(L('LOOK CLOSER','اقترب'));k.style.zIndex=41;
 cta(L('STEP THROUGH','اعبر'),()=>{k.style.opacity=0;playThen(v,()=>{fl.style.opacity=1;v.remove();T(350,()=>{fl.style.transition='opacity 1.6s';fl.style.opacity=0;c.show()});T(1700,()=>store())})},2600);
};
SC.smoke=()=>{
 bg('smoke.webp');const c=carousel({sides:false,w:78,deco:'t-smoke',swap:c=>{c.hero.classList.add('cn-diss');T(620,()=>{c.fill();c.hero.classList.remove('cn-diss')})}});fx('smoke',{z:14,col:'214,208,200',op:.55,n:34});
 const lg=el('div','sm-logo',WORD);lg.firstChild.style.fontSize='8.4cqw';T(200,()=>lg.classList.add('in'));
 cta(L('ENTER','ادخل'),()=>{lg.classList.add('gone');c.lay();c.els.forEach((f,i)=>T(500+i*450,()=>f.classList.add('cn-mat','on')));T(2300,()=>store())},2800);
};
const HG=`<svg viewBox="0 0 100 160"><defs><clipPath id="cnht"><path d="M18 14H82C82 50 56 64 52 80H48C44 64 18 50 18 14Z"/></clipPath><clipPath id="cnhb"><path d="M48 80H52C56 96 82 110 82 146H18C18 110 44 96 48 80Z"/></clipPath><linearGradient id="cnsg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3d9a0"/><stop offset="1" stop-color="#b98a3e"/></linearGradient></defs><g clip-path="url(#cnht)"><rect class="hg-top" x="0" y="30" width="100" height="50" fill="url(#cnsg)"/></g><g clip-path="url(#cnhb)"><rect class="hg-bot" x="0" y="96" width="100" height="50" fill="url(#cnsg)"/></g><line class="hg-str" x1="50" y1="78" x2="50" y2="146" stroke="#e7c98a" stroke-width="1.4" stroke-dasharray="2 3" opacity="0"><animate attributeName="stroke-dashoffset" from="0" to="-10" dur=".4s" repeatCount="indefinite"/></line><path d="M18 14H82C82 50 56 64 52 80C56 96 82 110 82 146H18C18 110 44 96 48 80C44 64 18 50 18 14Z" fill="#ffffff0d" stroke="#ffffff77" stroke-width="1"/><rect x="8" y="4" width="84" height="10" rx="3" fill="#7a5730"/><rect x="8" y="146" width="84" height="10" rx="3" fill="#7a5730"/><rect x="11" y="14" width="3" height="132" fill="#4a331b"/><rect x="86" y="14" width="3" height="132" fill="#4a331b"/></svg>`;
SC.hourglass=()=>{
 bg('hourglass.webp');el('div','cn-L').style.background='linear-gradient(#000d,#0008 40%,#0000 62%)';fx('dust',{z:2,col:'240,210,150',n:34});
 const ds=api.designs(),lims=ds.map(d=>Number(d.productionLimit)||0),same=lims.length&&lims.every(x=>x&&x===lims[0]),showN=ds.some(d=>api.showLeft(Number(d.remaining)||0));
 const w=el('div','hg-wrap',HG);const k=kick('TIME IS TEMPORARY','58%');
 const c=carousel({head:.5,deco:'t-dome',sw:.66,dx:.7,rise:0});
 const goo=()=>{k.style.opacity=0;w.classList.add('flip');T(1250,()=>{w.style.transition='none';w.classList.remove('flip');w.classList.add('hg-run');w.querySelector('.hg-str').setAttribute('opacity','1');raf2(()=>w.style.transition='')});
  const cnt=el('div','hg-count',same?`<b>0</b><span>${esc(L('PIECES OF EACH DESIGN · THEN IT IS GONE','قطعة من كل تصميم · وبعدها خلاص'))}</span>`:`<b style="font-size:9cqw">${esc(api.t('limitedRun'))}</b><span>${esc(L('EVERY DESIGN IS LIMITED','كل تصميم كميته محدودة'))}</span>`);
  if(same){const b=cnt.querySelector('b'),t0=performance.now()+1300;loop(()=>{const p=Math.min(1,Math.max(0,(performance.now()-t0)/1800));b.textContent=Math.round(lims[0]*(1-Math.pow(1-p,3)))})}
  T(4300,()=>{w.classList.add('cn-small');cnt.classList.add('cn-small');const rows=el('div','hg-rows',ds.slice(0,4).map(d=>`<div><span>${esc(api.dName(d).toUpperCase())} · ${esc(stockLine(d).replace(/ · .*$/,'').toUpperCase())}</span><i style="--w:100%"></i></div>`).join(''));raf2(()=>{on(rows);[...rows.querySelectorAll('i')].forEach((b,j)=>{const d=ds[j],lim=Number(d.productionLimit)||Math.max(1,...ds.map(x=>Number(x.remaining)||0));b.style.setProperty('--w',(d.soldOut?0:showN?Math.round(100*(Number(d.remaining)||0)/lim):100)+'%')})});c.show()});
  T(5400,()=>store())};
 w.style.cursor='pointer';w.onclick=()=>{const b=root.querySelector('.cn-cta');if(b)b.click()};cta(L('FLIP THE HOURGLASS','اقلب الساعة'),goo,3200);
};
SC.metro=()=>{
 const car=bg('metro.webp','mt-shake');const sign=el('div','mt-sign','TEMPORARY LINE');const c=carousel({cls:'refl',deco:'t-ride',swap:c=>{c.els.forEach(x=>x.classList.add('mt-out'));T(380,()=>{c.fill();c.els.forEach(x=>{x.classList.add('mt-pre');x.classList.remove('mt-out')});raf2(()=>raf2(()=>c.els.forEach(x=>x.classList.remove('mt-pre'))))})}});
 const set=()=>{sign.textContent=L('NOW BOARDING ▸ ','الآن ▸ ')+api.pName(LK[K].p).toUpperCase()};const ap=c.apply;c.apply=f=>{ap(f);set()};
 const doors=el('div','cn-L mt-doors','<div></div><div></div>');const k=kick(L('PLATFORM 01','رصيف ٠١')+' · '+drop(),'80%');k.style.zIndex=51;k.style.color='#0a1a2e';k.style.textShadow='none';
 cta(L('BOARD','اركب'),()=>{k.remove();doors.classList.add('open');T(1300,()=>{sign.textContent=L('NEXT STOP ▸ ','المحطة التالية ▸ ')+(api.dropLabel()||'DROP 01').toUpperCase();c.show()});T(3000,()=>{car.classList.remove('mt-shake');set();store()})},2600);
};
SC.darkroom=()=>{
 bg('darkroom.webp');const red=el('div','cn-L dk-red');const logo=api.logoUrl();const n=Math.min(LK.length,6);
 const k=kick(L('DARKROOM · DEVELOPING','غرفة التحميض'));k.style.color='#ff9a9a';let prs=[];
 VIEW={apply(){prs.forEach((p,i)=>{p.classList.toggle('sel',i===K);if(p._f._l!==LK[i])setLook(p._f,LK[i])})}};
 cta(L('DEVELOP','حمّض'),()=>{k.style.opacity=0;const tray=el('div','dk-tray','<div class="dk-print"><div class="dev dk-word">'+(logo?`<img src="${esc(logo)}" alt="TEMPORARY" style="width:62%;margin:0 auto;display:block;filter:brightness(0)">`:'TEMPORARY™')+`<small>${drop()}</small></div></div>`);
  T(3600,()=>{tray.style.opacity=0;tray.style.transform='translateY(-8%)';prs=LK.slice(0,n).map((l,i)=>{const p=el('div','dk-pr'+(i>2?' row2':''),'<span class="peg"></span><div class="dk-print"></div>');p.style.left=(3+(i%3)*32)+'%';p.style.animationDelay=(-i*.7)+'s';p._f=fig(l,'dev',p.querySelector('.dk-print'));p.onclick=e=>{e.stopPropagation();go(i)};T(400+i*400,()=>on(p));return p});
   T(400+n*400+1800,()=>{red.style.opacity=.25;VIEW.apply();store()})})},2600);
};
SC.fitting=()=>{
 bg('fitting.webp','ft-bg');const c=carousel({sides:false,w:66,head:.2});let auto=true;const ds=api.designs().filter(d=>!d.soldOut);
 const hold=()=>{const H=R.clientHeight,W=R.clientWidth,fy=Math.min(floorY(),H*.6);stand(c.hero,Math.min(62,(fy-H*.16)/.73/1.25/W*100),fy,50)};c.lay=hold;hold();
 const cur=el('div','cn-L ft-cur','<div></div><div></div>');const k=kick(L('THE FITTING ROOM','غرفة القياس')+' · '+drop());k.style.zIndex=51;
 R.addEventListener('pointerdown',()=>{auto=false},{once:true});
 cta(L('TRY IT ON','جرّبها'),()=>{k.style.opacity=0;cur.classList.add('open');hold();on(c.hero);T(1400,()=>{store();auto=true;R.addEventListener('pointerdown',()=>{auto=false},{once:true})});if(ds.length>1){T(3400,()=>{if(auto)setDesign(ds[1])});T(5600,()=>{if(auto)setDesign(ds[0])})}},2600);
};
SC.credits=()=>{
 el('div','cn-L').style.background='#000';
 const sc=[bg('credits-a.webp','cr-scene'),bg('credits-b.webp','cr-scene')];
 const cut=LK.slice(0,2).map((l,i)=>{const f=fig(l,'cr-fig');f.style.zIndex=20;const lo=el('div','cr-lower',`<small>${esc(l.d?api.dName(l.d).toUpperCase():drop())}</small><b>${esc(api.pName(l.p))}</b>`);return[sc[i%2],f,lo]});
 const fin=bg('credits.webp','cn-fade cn-hide');const line=el('div','cn-L');line.style.zIndex=22;const c=carousel({par:line,deco:'t-film',sw:.7,dx:.9,rise:0,w:60});
 const t1=el('div','cr-title',`<small>TEMPORARY™ ${esc(L('PRESENTS','تقدّم'))}</small>`),t2=el('div','cr-title',`<b>${esc(api.dropLabel()||'Drop 01')}</b>`),t3=el('div','cr-title',`<small>${esc(api.t('madeToOrder')).replace(' · ','<br>')}</small>`);
 el('div','cn-L cr-vig');const gc=el('canvas','cn-cv cr-grain');gc.width=90;gc.height=185;const gx=gc.getContext('2d'),im=gx.createImageData(90,185);let fr=0;
 loop(()=>{if(fr++%3)return;for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}gx.putImageData(im,0,0)});
 el('div','cr-bar t');el('div','cr-bar b');
 cta(L('PLAY','شغّل'),()=>{R.classList.add('cr-on');T(700,()=>on(t1));T(2300,()=>off(t1));T(2800,()=>on(t2));T(4500,()=>off(t2));let t=5000;cut.forEach(x=>{T(t,()=>on(...x));T(t+2700,()=>off(...x));t+=3100});T(t,()=>on(t3));T(t+2200,()=>off(t3));T(t+2600,()=>{R.classList.remove('cr-on');fin.classList.remove('cn-hide');c.show()});T(t+3400,()=>store())},2000);
};

/* ================= music: every theme has its own generated score (or assets/cine/music/<theme>.mp3 if present) ================= */
const MU=(()=>{
 const SCORE={
  vault:{bpm:60,bpc:8,ch:[[38,50,53,57],[36,48,52,55],[41,53,57,60],[33,45,48,52]],pad:['triangle',700,.05],arp:[8,'sine',24,.035],bass:.09},
  museum:{bpm:66,bpc:8,ch:[[48,55,59,64],[45,52,55,60],[41,53,57,60],[43,50,55,59]],pad:['triangle',1300,.045],arp:[4,'sine',12,.03]},
  elevator:{bpm:88,bpc:4,ch:[[50,53,57,60,64],[43,53,57,59,64],[48,52,55,59,62],[45,52,55,61]],pad:['sine',1100,.03],arp:[2,'triangle',12,.035,.5],hat:'..x...x...x...x.',bass:.08},
  runway:{bpm:122,bpc:8,ch:[[45,57,60,64],[41,57,60,65],[48,55,60,64],[43,55,59,62]],pad:['sawtooth',900,.022],kick:'x...x...x...x...',hat:'..x...x...x...x.',bp:'..x...x...x...x.',bass:.1},
  rooftop:{bpm:116,bpc:8,ch:[[41,57,60,64],[43,55,59,62],[45,55,60,64],[40,55,59,62]],pad:['triangle',1500,.035],arp:[2,'triangle',12,.03,.35],kick:'x...x...x...x...',hat:'x.x.x.x.x.x.x.x.',bass:.08},
  mask:{bpm:50,bpc:16,ch:[[26,38,45,50],[24,36,43,51]],pad:['sawtooth',380,.05],noise:[300,.012],bass:.1},
  smoke:{bpm:48,bpc:16,ch:[[45,52,57,59,64],[41,48,53,57,60]],pad:['sine',900,.05],noise:[900,.012]},
  hourglass:{bpm:60,bpc:8,ch:[[40,52,55,59],[36,48,55,60],[43,50,55,59],[38,50,54,57]],pad:['triangle',900,.04],tick:'x...x...x...x...',arp:[8,'sine',24,.03]},
  metro:{bpm:100,bpc:8,ch:[[36,48,51,55],[44,48,51,56],[39,51,55,58],[46,50,53,58]],pad:['sawtooth',700,.022],arp:[2,'triangle',12,.028,.3],kick:'x.......x.......',hat:'....x.......x...',noise:[180,.02],bass:.09},
  darkroom:{bpm:70,bpc:8,ch:[[41,53,56,60,63],[37,53,56,60],[39,51,55,58],[36,51,55,58]],pad:['sine',600,.055],kick:'x.........x.....',bass:.08},
  fitting:{bpm:96,bpc:4,ch:[[45,52,56,61,64],[42,52,57,61],[38,54,57,61],[40,52,56,62]],pad:['sine',1200,.03],arp:[2,'triangle',12,.035,.45],hat:'..x...x...x.x.x.',bass:.08},
  credits:{bpm:72,bpc:8,ch:[[38,50,57,62,65],[34,50,53,58,62],[41,53,57,60,65],[36,52,55,60,64]],pad:['sawtooth',1400,.028,2.2],kick:'x...............',bass:.1}};
 let ctx,master,send,timer,cfg=null,want=null,step=0,nextT=0,nb=null,noiseSrc=null,audio=null,started=null,muted=false;
 try{muted=localStorage.getItem('temporary_music')==='off'}catch(_){}
 const hz=n=>440*Math.pow(2,(n-69)/12);
 function init(){if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=0;const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
  const dl=ctx.createDelay(1),fb=ctx.createGain(),lp=ctx.createBiquadFilter();dl.delayTime.value=.37;fb.gain.value=.45;lp.frequency.value=1700;dl.connect(lp);lp.connect(fb);fb.connect(dl);send=ctx.createGain();send.gain.value=.55;send.connect(dl);dl.connect(master);
  nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}
 function tone(t,note,dur,type,cut,gain,att,rel,rv){const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=o2.type=type;o.frequency.value=o2.frequency.value=hz(note);o2.detune.value=9;f.type='lowpass';f.frequency.value=cut;att=Math.min(att,dur*.5);rel=Math.min(rel,dur*.5);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(gain,t+att);g.gain.setValueAtTime(gain,t+dur-rel);g.gain.linearRampToValueAtTime(0.0001,t+dur);o.connect(f);o2.connect(f);f.connect(g);g.connect(master);if(rv)g.connect(send);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
 function kick(t,g){const o=ctx.createOscillator(),a=ctx.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(38,t+.14);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(0.0001,t+.3);o.connect(a);a.connect(master);o.start(t);o.stop(t+.32)}
 function hiss(t,g,hp,len){const s=ctx.createBufferSource(),a=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=nb;f.type='highpass';f.frequency.value=hp;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(0.0001,t+len);s.connect(f);f.connect(a);a.connect(master);s.start(t,Math.random());s.stop(t+len+.02)}
 function sched(){if(!cfg||!ctx)return;const s16=60/cfg.bpm/4;while(nextT<ctx.currentTime+.35){const t=nextT,bar=cfg.bpc*4,ci=Math.floor(step/bar)%cfg.ch.length,ch=cfg.ch[ci],i=step%16;
   if(step%bar===0){const dur=s16*bar,p=cfg.pad;ch.slice(1).forEach(n=>tone(t,n,dur*1.04,p[0],p[1],p[2],p[3]||dur*.3,dur*.35,true));if(cfg.bass&&!cfg.bp)tone(t,ch[0],dur,'sine',300,cfg.bass,.05,dur*.3)}
   if(cfg.bp&&cfg.bp[i]==='x')tone(t,ch[0],s16*1.6,'triangle',420,cfg.bass,.01,.08);
   if(cfg.arp&&step%cfg.arp[0]===0){const a=cfg.arp,ns=ch.slice(1),n=ns[Math.floor(step/a[0])%ns.length]+a[2];tone(t,n,a[4]||1.6,a[1],2400,a[3],.01,(a[4]||1.6)*.8,true)}
   if(cfg.kick&&cfg.kick[i]==='x')kick(t,.22);if(cfg.hat&&cfg.hat[i]==='x')hiss(t,.035,7000,.05);if(cfg.tick&&cfg.tick[i]==='x')tone(t,(Math.floor(step/4)%2?86:91),.05,'sine',5000,.04,.002,.04);
   step++;nextT+=s16}}
 function halt(){clearInterval(timer);timer=null;cfg=null;started=null;if(noiseSrc){try{noiseSrc.stop()}catch(_){}noiseSrc=null}if(audio){audio.pause();audio=null}}
 function synth(id){cfg=SCORE[id];if(!cfg||!init())return;step=0;nextT=ctx.currentTime+.12;if(cfg.noise){noiseSrc=ctx.createBufferSource();noiseSrc.buffer=nb;noiseSrc.loop=true;const f=ctx.createBiquadFilter(),a=ctx.createGain();f.type='lowpass';f.frequency.value=cfg.noise[0];a.gain.value=cfg.noise[1]*4;noiseSrc.connect(f);f.connect(a);a.connect(master);noiseSrc.start()}
  master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(0.0001,ctx.currentTime);master.gain.linearRampToValueAtTime(.9,ctx.currentTime+2.5);timer=setInterval(sched,110);sched()}
 /* must be called from a tap (browsers only allow sound after a gesture) */
 function kickoff(){if(closed||!want||muted||started===want)return;halt();const id=want;started=id;if(init()&&ctx.state==='suspended')ctx.resume();
  const a=new Audio();a.loop=true;a.volume=.5;a.preload='auto';let dead=false;const fall=()=>{if(dead)return;dead=true;if(audio===a)audio=null;if(started===id&&want===id&&!muted)synth(id)};a.addEventListener('error',fall);a.src=A('music/'+id+'.mp3');audio=a;const p=a.play();if(p&&p.catch)p.catch(fall)}
 function paintBtns(){document.querySelectorAll('[data-music]').forEach(b=>{b.classList.toggle('off',muted);b.setAttribute('aria-pressed',String(!muted))})}
 addEventListener('pointerdown',()=>kickoff(),true);addEventListener('keydown',()=>kickoff(),true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(ctx&&ctx.state==='running')ctx.suspend();if(audio)audio.pause()}else if(!muted&&started){if(ctx)ctx.resume();if(audio)audio.play().catch(()=>{})}});
 return{stop(){want=null;if(ctx&&master&&timer){try{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(master.gain.value,ctx.currentTime);master.gain.linearRampToValueAtTime(0.0001,ctx.currentTime+1)}catch(_){}}if(audio){const a=audio,iv=setInterval(()=>{a.volume=Math.max(0,a.volume-.06);if(a.volume<=0)clearInterval(iv)},100)}setTimeout(()=>{if(!want)halt()},1100)},theme(id){want=SCORE[id]?id:null;if(!want)halt();else if(started&&started!==want)kickoff();paintBtns()},toggle(){muted=!muted;try{localStorage.setItem('temporary_music',muted?'off':'on')}catch(_){}if(muted)halt();else kickoff();paintBtns();return muted},muted:()=>muted,paint:paintBtns}})();

/* ================= shell ================= */
let cssReady=null;function ensureAssets(){if(!cssReady)cssReady=new Promise(ok=>{const l=document.createElement('link');l.id='cineCss';l.rel='stylesheet';l.href=A('cine.css?v=4');l.onload=ok;l.onerror=ok;document.head.appendChild(l);setTimeout(ok,4000)});if(!document.getElementById('cineFont')){const l=document.createElement('link');l.id='cineFont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Reem+Kufi:wght@700&display=swap';document.head.appendChild(l)}}
function teardown(){pend.forEach(clearTimeout);pend=[];cleans.forEach(f=>{try{f()}catch(_){}});cleans=[];cardEl=enterEl=hintEl=curSel=dock=rail=VIEW=null;LK=[];if(root){root.remove();root=null}document.documentElement.classList.remove('cine-on')}
function finish(){if(closed)return;closed=true;MU.stop(); /* music belongs to the entrance only */const r=root;if(r)r.classList.add('cn-out');document.documentElement.classList.remove('cine-on');const cb=opts&&opts.onDone;setTimeout(()=>{if(root===r)teardown()},950);if(cb)try{cb()}catch(_){}}
function build(id){
 root=document.createElement('div');root.id='cine';if(ar())root.className='cn-ar';root.setAttribute('role','dialog');root.setAttribute('aria-label','TEMPORARY');
 const amb=document.createElement('div');amb.className='cn-amb';root.appendChild(amb);const st=document.createElement('div');st.className='cn-stage';root.appendChild(st);R=st;
 const sk=document.createElement('button');sk.type='button';sk.className='cn-skip';sk.textContent=L('SKIP','تخطي')+' ▸';sk.onclick=e=>{e.stopPropagation();finish()};
 const snd=document.createElement('button');snd.type='button';snd.className='cn-snd';snd.dataset.music='1';snd.setAttribute('aria-label','Music');snd.innerHTML='<i></i><i></i><i></i>';snd.onclick=e=>{e.stopPropagation();MU.toggle()};
 document.body.appendChild(root);document.documentElement.classList.add('cine-on');
 MU.theme(id);mkLooks();
 try{mkDock();SC[id]();st.appendChild(dock);const first=st.querySelector('.cn-bg,.cn-vid');if(first){const u=first.poster||(first.style.backgroundImage.match(/url\("?(.*?)"?\)/)||[])[1];if(u)amb.style.backgroundImage=`url("${u}")`}}catch(e){console.error('cine',e);closed=true;teardown();return false}
 st.appendChild(sk);st.appendChild(snd);MU.paint();return true}
function play(id,a,o){if(!SC[id]||!a)return false;if(!closed||root)teardown();api=a;opts=o||{};if(!api.products().length)return false;closed=false;const tok=opts;ensureAssets();cssReady.then(()=>{if(closed||opts!==tok)return;build(id)});return true}
window.TemporaryCine={music:MU,play,close:finish,has:id=>!!SC[id],ids:Object.keys(SC),active:()=>!closed};
})();
