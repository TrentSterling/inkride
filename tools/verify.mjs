// Headless smoke test for INKRIDE. Zero deps: node tools/verify.mjs [file-or-url]
// Boots the real page in headless Chrome (solo playground), checks the bench is up, rides the
// starter track, respawns, reloads, and checks nothing threw. A regression gate, not a playtest.
import {launch, sleep, until} from './cdp.mjs';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const arg = process.argv.slice(2).find(a => !a.startsWith('--')) || 'index.html';
const target = /^https?:/.test(arg) ? arg : pathToFileURL(resolve(arg)).href;
const out = resolve('tools/out'); mkdirSync(out, {recursive: true});
const page = await launch({port: +(process.env.PORT || 9433), width: 1280, height: 800});
const results = [];
const check = (name, ok, detail = '') => { results.push({name, ok: !!ok, detail}); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); };
try {
  await page.goto(target + '#solo');
  await until(() => page.eval('!!window.INKRIDE && !!document.getElementById("rideBtn")'), {timeout: 60000, label: 'boot'});
  check('boot: INKRIDE hook present', true, 'version ' + await page.eval('INKRIDE.version'));
  check('boot: solo playground', await page.eval('INKRIDE.session.room===null || INKRIDE.session.room===undefined || document.body.innerText.includes("Solo playground")'), await page.eval('document.body.innerText.includes("Solo playground")') ? 'Solo playground' : '');
  check('menu: pen tools present', (await page.eval('document.querySelectorAll("button.tool").length')) >= 5, 'tools ' + await page.eval('document.querySelectorAll("button.tool").length'));
  check('menu: tront.xyz link', await page.eval('[...document.querySelectorAll("a[href^=\'https://tront.xyz\']")].length>=1'));
  check('menu: no root-relative asset paths', await page.eval('![...document.querySelectorAll("[src],[href]")].some(e=>/^\\/[^\\/]/.test(e.getAttribute("src")||e.getAttribute("href")||""))'));
  check('menu: no external scripts or fonts', await page.eval('[...document.querySelectorAll("script[src],link[rel=stylesheet]")].length===0'));
  await sleep(1000);
  check('world: starter track has ink', await page.eval('(INKRIDE.world.strokes||INKRIDE.world.tracks||[]).length>0 || JSON.stringify(INKRIDE.world).length>200'), 'world bytes ' + await page.eval('JSON.stringify(INKRIDE.world).length'));
  await page.shot(`${out}/bench.png`);
  const t0 = await page.eval('INKRIDE.physicsTime');
  const before = await page.eval('(()=>{const r=INKRIDE.riders[0];const p=r.points[0];return {x:p.x,y:p.y,state:r.state}})()');
  await page.eval('document.getElementById("rideBtn").click()');
  await sleep(2500);
  const after = await page.eval('(()=>{const r=INKRIDE.riders[0];const p=r.points[0];return {x:p.x,y:p.y,state:r.state}})()');
  check('ride: physics time advances', (await page.eval('INKRIDE.physicsTime')) > t0, `${t0.toFixed(2)} -> ${(await page.eval('INKRIDE.physicsTime')).toFixed(2)}`);
  check('ride: rider moves down the track', Math.hypot(after.x - before.x, after.y - before.y) > 50, `${before.state} (${before.x | 0},${before.y | 0}) -> ${after.state} (${after.x | 0},${after.y | 0})`);
  await page.shot(`${out}/ride.png`);
  await page.eval('document.getElementById("respawnBtn").click()');
  await sleep(600);
  const back = await page.eval('(()=>{const r=INKRIDE.riders[0];const p=r.points[0];return {x:p.x,y:p.y,state:r.state}})()');
  check('respawn: rider returns to the start', back.x < after.x - 300 && Math.hypot(back.x - before.x, back.y - before.y) < 200, `${back.state} (${back.x | 0},${back.y | 0})`);
  check('storage: origin storage usable (sketches can persist)', await page.eval('INKRIDE.nativeStorage'));
  await page.goto(target + '#solo');
  await until(() => page.eval('!!window.INKRIDE && !!document.getElementById("rideBtn")'), {timeout: 60000, label: 'reload boot'});
  check('reload: bench boots again', true);
  const bad = page.logs.filter(l => l.startsWith('EXCEPTION') || l.startsWith('error'));
  check('console: no exceptions or errors', bad.length === 0, bad.slice(0, 3).join(' | '));
} catch (e) {
  check('harness', false, e.message);
} finally {
  const passed = results.filter(r => r.ok).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  writeFileSync(`${out}/verify.json`, JSON.stringify({target, results, logs: page.logs}, null, 2));
  page.kill();
  process.exitCode = passed === results.length ? 0 : 1;
}
