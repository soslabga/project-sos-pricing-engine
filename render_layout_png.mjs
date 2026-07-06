// 100평형 배치도 SVG → PNG (사업계획서 삽입용)
import { chromium } from 'playwright';
import fs from 'fs';
const svg = fs.readFileSync('C:/Users/User/Documents/프로젝트/코워킹_평면도_100평_전국형.svg','utf8');
const b = await chromium.launch();
const p = await b.newPage({ viewport:{ width:1140, height:920 }, deviceScaleFactor:2 });
await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
// 내부용 제목줄(분당/판교/가격 노출) 제거 — 사업계획서엔 중립 배치도만
await p.evaluate(() => {
  document.querySelectorAll('text').forEach(t => {
    const s = t.textContent || '';
    if (s.includes('분당 100평형') || s.includes('판교와 동일') || s.includes('동일가')) t.remove();
  });
});
await p.screenshot({ path:'C:/Users/User/Documents/프로젝트/배치도_100평.png', clip:{ x:0, y:52, width:1140, height:868 } });
await b.close();
console.log('saved 배치도_100평.png');
