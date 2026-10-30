// Copy of Grok Bot's qa.mjs with per-level budgets in GAME time (120 s / 20 s idle) so box-wide freezes (lagmon.log) do not read as game stalls. Logic otherwise unchanged.
import { chromium } from '/workspace/fizby-sports/node_modules/playwright-core/index.mjs';
const URL='https://nhigh723.github.io/fizby-sports/', DEV=process.env.DEV||'iphone';
const VP = DEV==='ipad'?{width:820,height:1180}:{width:390,height:844};
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:VP,deviceScaleFactor:2,hasTouch:true,isMobile:true}); const page=await ctx.newPage();
const errs=[],fails=[],cons=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')cons.push(m.type()+': '+m.text())});
page.on('requestfailed',r=>fails.push(r.url()+' '+r.failure()?.errorText)); page.on('response',r=>{if(r.status()>=400)fails.push(r.status()+' '+r.url())});
const S=(f,a)=>page.evaluate(f,a),wait=ms=>page.waitForTimeout(ms),log=(...a)=>console.log(...a);
const shot=n=>page.screenshot({timeout:600000,path:`shots/${DEV}-${n}.png`});
const pt=(x,y)=>S(([x,y])=>window.__snap.toScreen(x,y),[x,y]);
async function tapBtn(id){const bt=await S(id=>window.__snap.buttons().find(b=>b.id===id),id);if(!bt){log('BUG no button',id, JSON.stringify(await S(()=>window.__snap.buttons().map(b=>b.id))));return false}const p=await pt(bt.x+bt.w/2,bt.y+bt.h/2);await page.touchscreen.tap(p.x,p.y);await wait(400);return true}
async function run(a){if(a.type==='wait')return wait(a.ms);if(a.type==='tap'){const p=await pt(a.x,a.y);await page.mouse.move(p.x,p.y);await page.mouse.down();await wait(40);await page.mouse.up();return wait(150)}
 const ps=[];for(const[x,y]of a.path)ps.push(await pt(x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();await wait(30);for(const q of ps.slice(1))await page.mouse.move(q.x,q.y,{steps:6});await page.mouse.up();await wait(250)}
await page.goto(URL);await S(()=>localStorage.clear());await page.reload();await wait(1500);await shot('01-title');
log('screen',await S(()=>window.__snap.screen),'onboard',JSON.stringify(await S(()=>window.__snap.onboard)));
// touch target audit
const small=async tag=>{const bs=await S(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return window.__snap.buttons().map(b=>{const a=window.__snap.toScreen(b.x,b.y),c=window.__snap.toScreen(b.x+b.w,b.y+b.h);return{id:b.id,w:c.x-a.x,h:c.y-a.y,x:a.x,y:a.y,off:a.x<0||a.y<0||c.x>r.width+1||c.y>r.height+1}})});for(const x of bs)if(x.w<44||x.h<44||x.off)log('TOUCH',tag,JSON.stringify(x))};
await small('title');
// walk real UI: tap play, onboarding/profile
await tapBtn('play');await wait(800);await shot('02-afterplay');log('after play screen',await S(()=>window.__snap.screen),'modal',await S(()=>window.__snap.modal),'btns',JSON.stringify(await S(()=>window.__snap.buttons().map(b=>b.id))));
for(let k=0;k<8&&await S(()=>window.__snap.screen)!=='hub';k++){const ids=await S(()=>window.__snap.buttons().map(b=>b.id));log('nonhub step',await S(()=>window.__snap.screen),JSON.stringify(ids));await shot('03-onb'+k);const pick=ids.find(i=>/next|ok|go|start|done|age|kid|name|play|continue/i.test(i))||ids[0];if(!pick)break;await tapBtn(pick);await wait(600)}
await shot('04-hub');await small('hub');log('kid',JSON.stringify(await S(()=>window.__snap.kid)));
log('audio',JSON.stringify(await S(()=>window.__snap.audio)));
const LV=await S(()=>window.__snap.levels);log('levels',JSON.stringify(LV));
const res=[];
for(let i=0;i<LV.length;i++)for(let l=0;l<LV[i]+2;l++){
 await S(([i,l])=>window.__snap.start(i,l),[i,l]);await wait(400);
 const t0=Date.now(),g0=await S(()=>window.__snap.T);let gl=g0,last=Date.now(),steps=0,won=false,shotDone=false;
 while((await S(()=>window.__snap.T))-g0<120){ if(await S(()=>window.__snap.winT)>=0){won=true;break}
  if((await S(()=>window.__snap.T))-gl>20){log('STUCK',i,l,JSON.stringify(await S(()=>({m:window.__snap.modal,busy:window.__snap.busy(),next:window.__snap.next()}))));await shot(`stuck-${i}-${l}`);break}
  const a=await S(()=>window.__snap.busy()?null:window.__snap.next()); if(!a){await wait(200);continue}
  if(l===1&&!shotDone&&steps===1){await shot(`game${i}-l${l}-play`);shotDone=true;await small('game'+i)}
  await run(a);if(a.type!=='wait'){steps++;last=Date.now();gl=await S(()=>window.__snap.T)} if(steps>300)break;}
 const dt=((Date.now()-t0)/1000).toFixed(1)+' real, game '+((await S(()=>window.__snap.T))-g0).toFixed(1);res.push([i,l,won,steps,dt]);log(won?'ok  ':'FAIL',`act ${i} lvl ${l} steps ${steps} ${dt}s`);
 if(won&&l===LV[i]-1){await wait(1500);await shot(`game${i}-win`)}
 if(await S(()=>window.__snap.modal)){await wait(2500);await S(()=>window.__snap.closeModal())}
}
const sv=await S(()=>window.__snap.save());log('save wins',sv.wins,'stickers',sv.stickers?.length,'trophies',JSON.stringify(sv.trophies));
await S(()=>window.__snap.go('hub'));await wait(500);await tapBtn('town');await wait(800);await shot('05-trophy');log('town screen',await S(()=>window.__snap.screen),JSON.stringify(await S(()=>window.__snap.buttons().map(b=>b.id))));
for(const id of await S(()=>window.__snap.buttons().map(b=>b.id).filter(i=>/stick|book|page|next/i.test(i)))){await tapBtn(id);await shot('06-'+id)}
await S(()=>window.__snap.go('hub'));await wait(400);
// gate + paywall with sim store
await page.goto(URL+'?store=sim');await wait(1000);await S(()=>window.__snap.storeTest.reset());await S(()=>window.__snap.go('hub'));await wait(400);
await tapBtn('gear');await shot('07-gate');log('gate modal',await S(()=>window.__snap.modal));
// wrong answer path
{const bt=await S(()=>window.__snap.buttons().find(b=>b.id==='gateHold'));if(bt){const p=await pt(bt.x+bt.w/2,bt.y+bt.h/2);await page.mouse.move(p.x,p.y);await page.mouse.down();await wait(3400);await page.mouse.up();await wait(300);await shot('08-gateq');
 const g=await S(()=>window.__snap.gate);const ans=g.q[0]+g.q[1],k=g.opts.indexOf(ans);await tapBtn('gateA'+((k+1)%g.opts.length));log('after wrong',await S(()=>window.__snap.screen),await S(()=>window.__snap.modal));
 if(await S(()=>window.__snap.screen)!=='parents'){await shot('08b-wrong');await S(()=>window.__snap.go('hub'));await tapBtn('gear');const bt2=await S(()=>window.__snap.buttons().find(b=>b.id==='gateHold'));const p2=await pt(bt2.x+bt2.w/2,bt2.y+bt2.h/2);await page.mouse.move(p2.x,p2.y);await page.mouse.down();await wait(3400);await page.mouse.up();await wait(300);const g2=await S(()=>window.__snap.gate);await tapBtn('gateA'+g2.opts.indexOf(g2.q[0]+g2.q[1]))}
}}
log('parents screen',await S(()=>window.__snap.screen),JSON.stringify(await S(()=>window.__snap.buttons().map(b=>b.id))));await shot('09-parents');await small('parents');
// paywall from locked level
await S(()=>window.__snap.go('hub'));await wait(300);await S(()=>window.__snap.start(0,3));await wait(800);log('freeRemix',await S(()=>window.__snap.freeRemix),'modal',await S(()=>window.__snap.modal));await shot('10-locked');
// offline reload
await S(()=>window.__snap.go('hub'));await page.goto(URL);await wait(3000);await ctx.setOffline(true);const nf=fails.length;await page.reload();await wait(2500);log('offline screen',await S(()=>window.__snap?.screen),'newfails',fails.length-nf);await shot('11-offline');await S(()=>window.__snap.start(3,0));await wait(1500);await shot('12-offline-play');await ctx.setOffline(false);
log('RESULTS fails',res.filter(r=>!r[2]).length,'of',res.length);
log('PAGEERRORS',JSON.stringify(errs));log('CONSOLE',JSON.stringify(cons.slice(0,30)));log('NETFAIL',JSON.stringify(fails.slice(0,30)));
await b.close();
