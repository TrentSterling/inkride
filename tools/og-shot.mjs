// Renders og-image.png (1200x630) from the real game: the solo playground with the chrome hidden,
// the rider launched down the starter track, best frame picked by speed and air.
// Zero deps: node tools/og-shot.mjs [file-or-url]   (SHOTS=12 GAP=350 OUT=og-image.png)
import {launch, sleep, until} from './cdp.mjs';
import {mkdirSync, copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const arg = process.argv.slice(2).find(a => !a.startsWith('--')) || 'index.html';
const target = /^https?:/.test(arg) ? arg : pathToFileURL(resolve(arg)).href;
const out = resolve('tools/out'); mkdirSync(out, {recursive: true});
const page = await launch({port: +(process.env.PORT || 9431), width: 1200, height: 630});
try {
  await page.goto(target + '#solo');
  await until(() => page.eval('!!window.INKRIDE && document.getElementById("rideBtn")'), {timeout: 60000, label: 'boot'});
  await sleep(1500);
  // Hide every control; keep the brand, the hero copy and the drawing.
  await page.eval(`(()=>{const s=document.createElement('style');s.id='og';s.textContent='.tool-panel,.social-panel,.bottom-wrap,.corner-right,.view-row,.zoom-row,.help-row,.session-pill,.top-actions,#hint,#perf,#inspector,#crashPrompt,#friendIndicators,.topbar button,.run-stats{display:none !important}.topbar{background:transparent !important;border:0 !important}';document.head.append(s);})()`);
  // Pull the camera in so the rider and the ink are big enough to survive a card thumbnail, and follow the rider.
  await page.eval('(()=>{const hint=[...document.querySelectorAll("div,span,p")].find(e=>e.children.length===0&&/Drag to draw/.test(e.textContent));if(hint)hint.style.display="none";})()');
  for (let i = 0; i < +(process.env.ZOOM || 3); i++) { await page.eval('(()=>{const plus=[...document.querySelectorAll("button")].find(b=>/[+][ ]*Zoom|Zoom[ ]*[+]/.test(b.textContent));plus&&plus.click();})()'); await sleep(120); }
  await page.eval('(()=>{const f=document.getElementById("followBtn");if(f&&!/on/i.test(f.textContent))f.click();})()');
  // Bigger brand and the game's own tagline so the card thumbnail says what this is.
  await page.eval(`(()=>{const s=document.createElement('style');s.textContent='.brand-logo{font-size:54px !important}.brand{transform:translateY(6px)}';document.head.append(s);const d=document.createElement('div');d.id='ogTag';d.style.cssText='position:absolute;right:30px;top:86px;font:italic 30px Georgia,serif;color:#28363d;z-index:9;text-align:right;line-height:1.15';d.innerHTML='<div style="font:800 13px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.14em;color:#ed6340;margin-bottom:8px">SHARED INK. BAD LANDINGS.</div>Make something worth crashing.';document.body.append(d);})()`);
  console.log('zoom readout', await page.eval('document.querySelector(".zoom-readout")?.textContent'));
  await sleep(300);
  await page.eval('document.getElementById("rideBtn").click()');
  const shots = [];
  for (let i = 0; i < +(process.env.SHOTS || 12); i++) {
    await sleep(+(process.env.GAP || 350));
    const f = `${out}/og-candidate-${i}.png`;
    await page.shot(f);
    const r = await page.eval('(()=>{const r=(INKRIDE.riders||[])[0];if(!r)return{speed:0,air:0,state:"none"};const p=r.points[0]||{vx:0,vy:0};return {speed:Math.hypot(p.vx,p.vy),air:r.air||0,state:r.state,x:p.x,y:p.y}})()');
    // Prefer the rider carving the ink at speed (track and boost dashes in frame); airborne frames are mostly empty paper.
    const score = r.state === 'crashed' ? -1 : r.speed * (r.air > 0 ? 0.55 : 1);
    shots.push({f, score, ...r});
    console.log('candidate', i, JSON.stringify({score: Math.round(score), speed: Math.round(r.speed), air: r.air, state: r.state}));
  }
  const best = shots.slice().sort((a, b) => b.score - a.score)[0];
  const dest = process.env.OUT || 'og-image.png';
  copyFileSync(best.f, resolve(dest));
  console.log('wrote', dest, 'from', best.f);
} finally { page.kill(); }
