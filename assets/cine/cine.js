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
function looks(max){const P=api.products(),all=api.designs(),D=all.filter(d=>!d.soldOut),ds=D.length?D:all;return P.slice(0,max||6).map((p,i)=>({p,d:ds.length?ds[i%ds.length]:null}))}
function layer(f,url,g,cls){if(!url||!g)return null;const a=el('div','a '+(cls||''),null,f);Object.assign(a.style,{width:g.width+'%',height:(g.height||g.width)+'%',left:g.left+'%',top:g.top+'%',opacity:g.opacity==null?1:g.opacity,transform:`translate(-50%,-50%) rotate(${g.rotation||0}deg)`});const i=el('img','',null,a);i.src=url;i.alt='';i.draggable=false;return a}
function dress(f,l){f.querySelectorAll('.a').forEach(x=>x.remove());const p=l.p,c=api.previewColor(p);if(l.d)layer(f,api.art(l.d,'FRONT'),api.placement(p.productId,c,'DESIGN',l.d.designId,'FRONT',20),'ds');layer(f,api.logoUrl(),api.placement(p.productId,c,'LOGO','','BACK',api.logoCm()),'lg')}
function fig(l,cls,par){const p=l.p,m=api.mockup(p,api.previewColor(p));const f=el('div','cn-fig '+(cls||''),null,par);f.style.setProperty('--m',`url("${m}")`);const b=el('img','b',null,f);b.src=m;b.alt=api.pName(p);b.draggable=false;dress(f,l);f._l=l;f.onclick=e=>{e.stopPropagation();select(f)};return f}
function place(f,[x,y,w],z){f.style.left=x+'%';f.style.top=y+'%';f.style.width=w+'%';if(z!=null)f.style.zIndex=z}
const LAY={1:[[10,32,80]],2:[[-4,35,58],[46,35,58]],3:[[0,25,50],[50,25,50],[16,37,68]],4:[[2,23,46],[52,23,46],[-4,39,56],[48,39,56]],5:[[-6,23,42],[29,21,42],[64,23,42],[-4,40,56],[48,40,56]],6:[[-6,23,42],[29,21,42],[64,23,42],[-8,41,50],[25,43,50],[58,41,50]]};
function group(ls,cls,par){const lay=LAY[Math.min(ls.length,6)]||[];return ls.slice(0,6).map((l,i)=>{const f=fig(l,cls,par);place(f,lay[i],10+i);return f})}
function select(f){if(!f||!f._l)return;curSel=f;(root.querySelectorAll('.cn-fig.sel')||[]).forEach(x=>x.classList.remove('sel'));f.classList.add('sel');showCard(f._l)}
function showCard(l){if(!cardEl)return;const p=l.p,d=l.d,rem=d?Number(d.remaining)||0:0;const k=d?(api.dName(d)+(api.showLeft(rem)&&!d.soldOut?' · '+api.t('piecesLeftCard',{n:rem}):'')):api.t('limitedRun');
 cardEl.innerHTML=`<span class="k">${esc(String(k).toUpperCase())}</span><b>${esc(api.pName(p))}</b><span>${esc(api.money(p.price,p.currency))}</span><button type="button">${esc(L('CUSTOMIZE','خصّص'))}</button>`;
 cardEl.querySelector('button').onclick=e=>{e.stopPropagation();finish();api.open(p.productId,d&&d.designId)};cardEl.dir=ar()?'rtl':'ltr';on(cardEl)}
/* every scene ends here: tap a look to see it, or walk into the store */
function store(figs,first){if(closed)return;if(!cardEl){cardEl=el('div','cn-card');}if(!enterEl){enterEl=el('button','cn-enter',esc(L('ENTER THE STORE','ادخل المتجر'))+' <span>→</span>');enterEl.type='button';enterEl.onclick=e=>{e.stopPropagation();finish()}}
 if(!hintEl&&figs&&figs.length>1){hintEl=el('div','cn-hintb',esc(L('TAP A LOOK','اضغط على أي قطعة')));}
 raf2(()=>{on(enterEl);if(hintEl)on(hintEl)});const f=first||(figs&&figs[figs.length-1]);if(f)T(500,()=>{select(f);if(hintEl)T(2600,()=>off(hintEl))})}

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
 const room=bg('vault-in.webp');el('div','cn-floorglow',null,room);const figs=group(looks(3),'refl');
 const sm=fx('smoke',{z:30,col:'226,200,150',op:.5});
 const v=video('vault.mp4','vault-poster.webp');v.style.zIndex=40;v.classList.add('cn-fade');
 const k=kick(L('PRIVATE VAULT','الخزنة الخاصة')+' · '+drop());k.style.zIndex=41;
 cta(L('OPEN THE VAULT','افتح الخزنة'),()=>{k.style.opacity=0;playThen(v,()=>{v.classList.add('cn-hide');T(400,()=>reveal(figs,380));T(1700,()=>{sm.style.transition='opacity 3s';sm.style.opacity=.35;store(figs)})})},2600);
};
SC.museum=()=>{
 const b=bg('museum.webp','mu-bg');const g=el('div','mu-grid');const ls=looks(4);
 const cs=ls.map((l,i)=>{const c=el('div','mu-case',`<i>N°0${i+1} · ${esc(api.pName(l.p).split(' ').slice(-1)[0].toUpperCase())}</i>`,g);const f=fig(l,'',c);c._f=f;return c});
 fx('dust',{z:8,col:'245,220,170'});
 const tor=el('div','cn-L cn-fade');tor.style.cssText='z-index:20;background:#000e;pointer-events:none';
 const k=kick(L('AFTER HOURS','بعد الإغلاق')+' · '+drop());k.style.zIndex=21;
 const pts=[[50,-15],[27,34],[73,34],[27,60],[73,60],[50,46]].slice(0,ls.length+1).concat([[50,46]]);let st=null;
 loop(()=>{if(st==null)return;const t=(performance.now()-st)/1000,i=Math.min(Math.floor(t),pts.length-2),f=Math.min(1,t-i),e=f<.5?2*f*f:1-2*(1-f)*(1-f),x=pts[i][0]+(pts[i+1][0]-pts[i][0])*e,y=pts[i][1]+(pts[i+1][1]-pts[i][1])*e,r=R.clientWidth*.22;tor.style.background=`radial-gradient(circle at ${x}% ${y}%,#0000 0 ${r*.55}px,#000e ${r*1.35}px)`});
 cta(L('LIGHT THE TORCH','أشعل الضوء'),()=>{st=performance.now();cs.forEach((c,i)=>T(1000*(i+1),()=>on(c)));const end=1000*(ls.length+1);T(end,()=>{tor.classList.add('cn-hide');b.classList.add('lit');k.textContent=L('THE COLLECTION','المجموعة')});T(end+500,()=>store(cs.map(c=>c._f),cs[0]&&cs[0]._f))},2600);
};
SC.elevator=()=>{
 const ls=looks(6);bg('elevator-in.webp');const holder=el('div','cn-L');let i=0,f=null,auto=true,busy=false;
 const shut=el('div','el-shut','<i></i><i></i>');
 const pan=el('div','el-panel');const dots=el('div','el-dots',ls.map(()=>'<i></i>').join(''));dots.style.opacity=0;
 const show=n=>{i=(n+ls.length)%ls.length;holder.innerHTML='';f=fig(ls[i],'refl',holder);place(f,[6,33,88],5);raf2(()=>on(f));pan.innerHTML=`<small>${esc(L('FLOOR','الدور'))} ${String(i+1).padStart(2,'0')} / ${String(ls.length).padStart(2,'0')}</small>${esc(api.pName(ls[i].p).toUpperCase())}`;[...dots.children].forEach((d,j)=>d.classList.toggle('on',j===i));select(f)};
 const ride=n=>{if(busy||closed)return;busy=true;shut.classList.add('shut');T(520,()=>{show(n);T(260,()=>{shut.classList.remove('shut');busy=false})})};
 const mk=(t,side,d)=>{const b=el('button','el-nav',t);b.type='button';b.style[side]='3%';b.style.display='none';b.onclick=e=>{e.stopPropagation();auto=false;ride(i+d)};return b};
 const pv=mk('‹','left',-1),nx=mk('›','right',1);
 const v=video('elevator.mp4','elevator-poster.webp');v.style.zIndex=50;v.classList.add('cn-fade');
 const k=kick(L('PRIVATE LIFT','المصعد الخاص')+' · '+drop());k.style.zIndex=51;
 const cyc=()=>T(3400,()=>{if(auto){ride(i+1);cyc()}});
 cta(L('CALL THE LIFT','اطلب المصعد'),()=>{k.style.opacity=0;playThen(v,()=>{v.classList.add('cn-hide');store([],null);on(pan);dots.style.opacity=1;show(0);if(ls.length>1){pv.style.display=nx.style.display='';cyc()}})},2600);
};
SC.runway=()=>{
 const ls=looks(5);bg('runway.webp');fx('flash',{z:6});fx('smoke',{z:4,col:'200,190,170',op:.25,n:12});
 const walkers=ls.map(l=>fig(l,'rw-walk'));const line=el('div','cn-L');line.style.zIndex=8;const figs=group(ls,'refl',line);
 const cur=el('div','cn-L rw-cur',WORD);const k=kick(drop()+' · '+L('THE SHOW','العرض'));k.style.zIndex=51;
 cta(L('RAISE THE CURTAIN','ارفع الستارة'),()=>{k.style.opacity=0;cur.classList.add('up');const step=2600;walkers.forEach((m,n)=>{const t=1300+n*step;T(t,()=>m.classList.add('go'));T(t+step-350,()=>{m.style.opacity=0})});const end=1300+walkers.length*step;T(end,()=>{const k2=kick(L('THE FINALE · TAP A LOOK','الختام · اختار قطعتك'),'12%');reveal(figs,260)});T(end+900,()=>store(figs))},2600);
};
SC.rooftop=()=>{
 const v=video('fireworks.mp4','fireworks-poster.webp');v.loop=true;const p=v.play();if(p&&p.catch)p.catch(()=>{});
 const sh=el('div','cn-L');sh.style.cssText='background:linear-gradient(#0006,#0000 30%,#0000 60%,#0008)';
 fx('confetti',{z:25});const a=el('div','rt-neon rt-ar','مؤقت'),e=el('div','rt-neon rt-en',L('NOW OPEN · CAIRO','الافتتاح · القاهرة'));
 const figs=group(looks(4),'');T(400,()=>on(a));T(1100,()=>on(e));
 cta(L('JOIN THE PARTY','ادخل الحفلة'),()=>{a.style.transition=e.style.transition='top 1s,transform 1s,opacity 1s';a.style.top='9%';a.style.transform='scale(.62)';e.style.top='19.5%';reveal(figs,300);T(1500,()=>store(figs))},3000);
};
SC.mask=()=>{
 const room=bg('mirror.webp');const figs=group(looks(3),'refl');fx('smoke',{z:4,col:'190,200,215',op:.22,n:10});
 const fl=el('div','cn-L mk-flash');const v=video('mask.mp4','mask-poster.webp');v.style.zIndex=40;v.classList.add('cn-fade');
 const k=kick(L('LOOK CLOSER','اقترب'));k.style.zIndex=41;
 cta(L('STEP THROUGH','اعبر'),()=>{k.style.opacity=0;playThen(v,()=>{fl.style.opacity=1;v.remove();T(350,()=>{fl.style.transition='opacity 1.6s';fl.style.opacity=0;reveal(figs,380)});T(1900,()=>store(figs))})},2600);
};
SC.smoke=()=>{
 bg('smoke.webp');const all=api.designs(),sold=all.find(d=>d.soldOut);const ls=looks(3);const figs=group(ls,'');
 fx('smoke',{z:14,col:'214,208,200',op:.6,n:34});
 const lg=el('div','sm-logo',WORD);lg.firstChild.style.fontSize='8.4cqw';T(200,()=>lg.classList.add('in'));
 cta(L('ENTER','ادخل'),()=>{lg.classList.add('gone');figs.forEach((f,i)=>T(500+i*500,()=>f.classList.add('mat','on')));
  if(sold&&ls[0]){T(2600,()=>{const g=fig({p:ls[0].p,d:sold},'');place(g,[58,12,40],9);g.onclick=null;g.classList.add('mat','on');const tag=kick(esc(api.dName(sold).toUpperCase())+' · '+esc(api.t('soldOut').toUpperCase()),'9%');tag.style.cssText+='left:56%;right:0;font-size:2.2cqw;color:#ff9a6a';T(2200,()=>{g.style.transition='opacity 2.4s,filter 2.4s,transform 2.4s';g.classList.remove('mat');g.style.filter='sepia(1) brightness(.4)';g.style.opacity=0;g.style.transform='translateY(-6%)';fx('ash',{par:g,z:3,col:'150,145,140'})})})}
  T(2400,()=>store(figs))},2800);
};
const HG=`<svg viewBox="0 0 100 160"><defs><clipPath id="cnht"><path d="M18 14H82C82 50 56 64 52 80H48C44 64 18 50 18 14Z"/></clipPath><clipPath id="cnhb"><path d="M48 80H52C56 96 82 110 82 146H18C18 110 44 96 48 80Z"/></clipPath><linearGradient id="cnsg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3d9a0"/><stop offset="1" stop-color="#b98a3e"/></linearGradient></defs><g clip-path="url(#cnht)"><rect class="hg-top" x="0" y="30" width="100" height="50" fill="url(#cnsg)"/></g><g clip-path="url(#cnhb)"><rect class="hg-bot" x="0" y="96" width="100" height="50" fill="url(#cnsg)"/></g><line class="hg-str" x1="50" y1="78" x2="50" y2="146" stroke="#e7c98a" stroke-width="1.4" stroke-dasharray="2 3" opacity="0"><animate attributeName="stroke-dashoffset" from="0" to="-10" dur=".4s" repeatCount="indefinite"/></line><path d="M18 14H82C82 50 56 64 52 80C56 96 82 110 82 146H18C18 110 44 96 48 80C44 64 18 50 18 14Z" fill="#ffffff0d" stroke="#ffffff77" stroke-width="1"/><rect x="8" y="4" width="84" height="10" rx="3" fill="#7a5730"/><rect x="8" y="146" width="84" height="10" rx="3" fill="#7a5730"/><rect x="11" y="14" width="3" height="132" fill="#4a331b"/><rect x="86" y="14" width="3" height="132" fill="#4a331b"/></svg>`;
SC.hourglass=()=>{
 bg('hourglass.webp');fx('dust',{z:2,col:'240,210,150',n:34});
 const ds=api.designs(),left=api.dropLeft(),showN=api.showLeft(left)||ds.some(d=>api.showLeft(Number(d.remaining)||0));
 const w=el('div','hg-wrap',HG);const k=kick(L('TIME IS TEMPORARY','الوقت مؤقت'),'70%');
 const figs=group(looks(2),'');figs.forEach(f=>{f.style.top='42%'});
 const go=()=>{k.style.opacity=0;w.classList.add('flip');T(1250,()=>{w.style.transition='none';w.classList.remove('flip');w.classList.add('hg-run');w.querySelector('.hg-str').setAttribute('opacity','1');raf2(()=>w.style.transition='')});
  const cnt=el('div','hg-count',showN?`<b>0</b><span>${esc(L('PIECES LEFT','قطعة متبقية'))} · ${drop()}</span>`:`<b style="font-size:9cqw">${esc(api.t('limitedRun'))}</b><span>${drop()}</span>`);
  if(showN){const b=cnt.querySelector('b'),t0=performance.now()+1300;loop(()=>{const p=Math.min(1,Math.max(0,(performance.now()-t0)/1800));b.textContent=Math.round(left*(1-Math.pow(1-p,3)))})}
  T(4300,()=>{w.classList.add('small');cnt.classList.add('small');if(showN){const mx=Math.max(1,...ds.map(d=>Number(d.remaining)||0));const rows=el('div','hg-rows',ds.slice(0,4).map(d=>`<div><span>${esc(api.dName(d).toUpperCase())} · ${d.soldOut?esc(api.t('soldOut').toUpperCase()):esc(api.t('piecesLeftCard',{n:Number(d.remaining)||0}).toUpperCase())}</span><i style="--w:0%"></i></div>`).join(''));raf2(()=>{on(rows);[...rows.querySelectorAll('i')].forEach((b,j)=>b.style.setProperty('--w',(ds[j].soldOut?0:Math.round(100*(Number(ds[j].remaining)||0)/mx))+'%'))})}reveal(figs,350)});
  T(5600,()=>store(figs))};
 w.style.cursor='pointer';w.onclick=()=>{const c=root.querySelector('.cn-cta');if(c)c.click()};cta(L('FLIP THE HOURGLASS','اقلب الساعة'),go,3200);
};
SC.metro=()=>{
 const ls=looks(4);const car=bg('metro.webp','mt-shake');const sign=el('div','mt-sign',L('TEMPORARY LINE','خط مؤقت'));
 const lay=LAY[Math.min(ls.length,4)];const figs=ls.slice(0,4).map((l,i)=>{const f=fig(l,'refl mt-in'+(i%2?'':' l'));place(f,lay[i],10+i);return f});
 const doors=el('div','cn-L mt-doors','<div></div><div></div>');const k=kick(L('PLATFORM 01','رصيف ٠١')+' · '+drop(),'80%');k.style.zIndex=51;k.style.color='#0a1a2e';k.style.textShadow='none';
 cta(L('BOARD','اركب'),()=>{k.remove();doors.classList.add('open');figs.forEach((f,i)=>T(1500+i*1500,()=>{sign.textContent=L('NEXT STOP ▸ ','المحطة التالية ▸ ')+api.pName(ls[i].p).toUpperCase();f.classList.add('on')}));const end=1500+figs.length*1500;T(end,()=>{sign.textContent=L('ARRIVED ▸ ','وصلنا ▸ ')+(api.dropLabel()||'DROP 01').toUpperCase();car.classList.remove('mt-shake')});T(end+300,()=>store(figs))},2600);
};
SC.darkroom=()=>{
 bg('darkroom.webp');const red=el('div','cn-L dk-red');const ls=looks(6);const logo=api.logoUrl();
 const k=kick(L('DARKROOM · DEVELOPING','غرفة التحميض'));k.style.color='#ff9a9a';
 cta(L('DEVELOP','حمّض'),()=>{k.style.opacity=0;const tray=el('div','dk-tray','<div class="dk-print"><div class="dev dk-word">'+(logo?`<img src="${esc(logo)}" alt="TEMPORARY" style="width:62%;margin:0 auto;display:block;filter:brightness(0)">`:'TEMPORARY™')+`<small>${drop()}</small></div></div>`);
  T(3900,()=>{tray.style.opacity=0;tray.style.transform='translateY(-8%)';const prs=ls.map((l,i)=>{const p=el('div','dk-pr'+(i>2?' row2':''),'<span class="peg"></span><div class="dk-print"></div>');p.style.left=(3+(i%3)*32)+'%';p.style.animationDelay=(-i*.7)+'s';const f=fig(l,'dev',p.querySelector('.dk-print'));f.onclick=null;p._l=l;p.onclick=e=>{e.stopPropagation();root.querySelectorAll('.dk-pr').forEach(x=>x.style.outline='');p.style.outline='2px solid #d8b46a';showCard(l)};T(400+i*450,()=>on(p));return p});
   T(400+ls.length*450+2200,()=>{red.style.opacity=.25;store([],null);if(prs[0])prs[0].onclick({stopPropagation(){}})})})},2600);
};
SC.fitting=()=>{
 bg('fitting.webp','ft-bg');const P=api.products().slice(0,6),all=api.designs(),D=all.filter(d=>!d.soldOut).length?all.filter(d=>!d.soldOut):all;let pi=0,di=0;
 const holder=el('div','cn-L');let f=null;const tag=el('div','ft-tag');
 const prods=el('div','ft-prods');const chips=el('div','ft-chips');
 const draw=()=>{const l={p:P[pi],d:D[di]||null};holder.innerHTML='';f=fig(l,'ft-fig',holder);f.classList.add('on');tag.textContent=((l.d?api.dName(l.d)+' · ':'')+api.pName(l.p)).toUpperCase();[...prods.children].forEach((b,j)=>b.classList.toggle('on',j===pi));[...chips.children].forEach((b,j)=>b.classList.toggle('on',j===di));if(cardEl)select(f)};
 P.forEach((p,j)=>{const b=el('button','',esc(api.pName(p).replace(/oversized/i,'').trim().toUpperCase()),prods);b.type='button';b.onclick=e=>{e.stopPropagation();auto=false;pi=j;draw()}});
 D.slice(0,6).forEach((d,j)=>{const u=api.art(d,'FRONT')||api.art(d,'BACK');const b=el('button','',(u?`<img src="${esc(u)}" alt="">`:'<em></em>')+esc(api.dName(d).toUpperCase()),chips);b.type='button';b.onclick=e=>{e.stopPropagation();auto=false;di=j;draw()}});
 let auto=true;if(P.length<2)prods.style.display='none';draw();
 const cur=el('div','cn-L ft-cur','<div></div><div></div>');const k=kick(L('THE FITTING ROOM','غرفة القياس')+' · '+drop());k.style.zIndex=51;
 cta(L('TRY IT ON','جرّبها'),()=>{k.style.opacity=0;cur.classList.add('open');T(1500,()=>store([],null));T(1700,()=>select(f));if(D.length>1){T(3200,()=>{if(auto){di=1;draw()}});T(5200,()=>{if(auto){di=0;draw()}})}},2600);
};
SC.credits=()=>{
 const ls=looks(4);el('div','cn-L').style.background='#000';
 const sc=[bg('credits-a.webp','cr-scene'),bg('credits-b.webp','cr-scene')];
 const cut=ls.slice(0,2).map((l,i)=>{const f=fig(l,'cr-fig');f.onclick=null;f.style.zIndex=20;const lo=el('div','cr-lower',`<small>${esc(l.d?api.dName(l.d).toUpperCase():drop())}</small><b>${esc(api.pName(l.p))}</b>`);return[sc[i%2],f,lo]});
 const fin=bg('credits.webp','cn-fade cn-hide');fin.style.filter='brightness(.5)';const line=el('div','cn-L');line.style.zIndex=22;const figs=group(ls,'',line);
 const t1=el('div','cr-title',`<small>TEMPORARY™ ${esc(L('PRESENTS','تقدّم'))}</small>`),t2=el('div','cr-title',`<b>${esc(api.dropLabel()||'Drop 01')}</b>`),t3=el('div','cr-title',`<small>${esc(api.t('madeToOrder')).replace(' · ','<br>')}</small>`);
 el('div','cn-L cr-vig');const gc=el('canvas','cn-cv cr-grain');gc.width=90;gc.height=185;const gx=gc.getContext('2d'),im=gx.createImageData(90,185);let fr=0;
 loop(()=>{if(fr++%3)return;for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}gx.putImageData(im,0,0)});
 el('div','cr-bar t');el('div','cr-bar b');
 cta(L('PLAY','شغّل'),()=>{R.classList.add('cr-on');T(700,()=>on(t1));T(2300,()=>off(t1));T(2800,()=>on(t2));T(4500,()=>off(t2));let t=5000;cut.forEach(c=>{T(t,()=>on(...c));T(t+2700,()=>off(...c));t+=3100});T(t,()=>on(t3));T(t+2200,()=>off(t3));T(t+2600,()=>{R.classList.remove('cr-on');fin.classList.remove('cn-hide');reveal(figs,300)});T(t+3600,()=>store(figs))},2000);
};

/* ================= shell ================= */
function ensureAssets(){if(!document.getElementById('cineCss')){const l=document.createElement('link');l.id='cineCss';l.rel='stylesheet';l.href=A('cine.css?v=1');document.head.appendChild(l)}if(!document.getElementById('cineFont')){const l=document.createElement('link');l.id='cineFont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Reem+Kufi:wght@700&display=swap';document.head.appendChild(l)}}
function teardown(){pend.forEach(clearTimeout);pend=[];cleans.forEach(f=>{try{f()}catch(_){}});cleans=[];cardEl=enterEl=hintEl=curSel=null;if(root){root.remove();root=null}document.documentElement.classList.remove('cine-on')}
function finish(){if(closed)return;closed=true;const r=root;if(r)r.classList.add('cn-out');document.documentElement.classList.remove('cine-on');const cb=opts&&opts.onDone;setTimeout(()=>{if(root===r)teardown()},950);if(cb)try{cb()}catch(_){}}
function play(id,a,o){if(!SC[id]||!a)return false;if(!closed||root)teardown();api=a;opts=o||{};if(!api.products().length)return false;ensureAssets();closed=false;
 root=document.createElement('div');root.id='cine';root.setAttribute('role','dialog');root.setAttribute('aria-label','TEMPORARY');
 const amb=document.createElement('div');amb.className='cn-amb';root.appendChild(amb);const st=document.createElement('div');st.className='cn-stage';root.appendChild(st);R=st;
 const sk=document.createElement('button');sk.type='button';sk.className='cn-skip';sk.textContent=L('SKIP','تخطي')+' ▸';sk.onclick=e=>{e.stopPropagation();finish()};
 document.body.appendChild(root);document.documentElement.classList.add('cine-on');
 try{SC[id]();const first=st.querySelector('.cn-bg,.cn-vid');if(first){const u=first.poster||(first.style.backgroundImage.match(/url\("?(.*?)"?\)/)||[])[1];if(u)amb.style.backgroundImage=`url("${u}")`}}catch(e){console.error('cine',e);closed=true;teardown();return false}
 st.appendChild(sk);return true}
window.TemporaryCine={play,close:finish,has:id=>!!SC[id],ids:Object.keys(SC),active:()=>!closed};
})();
