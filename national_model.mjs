// 전국 파라메트릭 모델 — 100평 표준(26실/72석). 월세·가격만 지역별로 대입하면 BEP/손익 산출.
// 고정 전제(standard_100.mjs와 동일): 비(非)월세 고정원가 = 관리비158+전기63+청소114+운영잡비32+인건비350+상각338 = 1,055만/월
// 좌석 mix 4인14·2인4·1인8. 공헌율 0.885(변동 11.5%).
const NONRENT = 158+63+114+32+350+338;   // 1,055만 (판교11/standard_100 원가구조)
const MIX = { p4:14, p2:4, p1:8 };
const CONT = 0.885;
const fk = n => Math.round(n).toLocaleString();

function model(rent, p4, p2, p1){
  const full = MIX.p4*p4 + MIX.p2*p2 + MIX.p1*p1;      // 만실 매출
  const fixed = rent + NONRENT;
  const bep = fixed/(full*CONT)*100;
  const op = g => full*g*CONT - fixed;
  const maxRent70 = full*0.70*CONT - NONRENT;          // BEP 70% 되는 최대 월세
  return { full, fixed, bep, op, maxRent70 };
}

console.log(`■ 비월세 고정원가 = ${fk(NONRENT)}만/월 (전국 공통, 100평 표준)`);
console.log(`  BEP(%) = (월세 + ${NONRENT}) / (만실 × 0.885)\n`);

// ── ① 월세 민감도 (현 분당가 134/87/48, 만실 2,608) ──
console.log('① 월세 민감도  [현 분당가 4인134·2인87·1인48, 만실 2,608만]');
console.log('   월세 | 전용평당(105평) | 고정비 | BEP | 50%손익 | 70%손익');
[300,350,400,440,500,560,600,650].forEach(rent=>{
  const m = model(rent,134,87,48);
  console.log(`   ${rent}만 | ${(rent/105).toFixed(2)}만/평 | ${fk(m.fixed)}만 | ${m.bep.toFixed(1)}% | ${m.op(0.5)>=0?'+':''}${fk(m.op(0.5))} | ${m.op(0.7)>=0?'+':''}${fk(m.op(0.7))}`);
});
const cur = model(440,134,87,48);
console.log(`   → 현 분당가 기준, 70% 가동 흑자 유지 최대 월세 = ${fk(cur.maxRent70)}만 (전용평당 ${(cur.maxRent70/105).toFixed(1)}만/평)\n`);

// ── ② 지역별 (월세·가격) 세트 대입 예시 ──
console.log('② 지역별 대입 예시  [월세·가격 세트로]');
console.log('   지역(가격대) | 월세 | 만실 | BEP | 70%손익 | BEP70 최대월세');
const regions = [
  ['판교 (160/100/60)', 650, 160,100,60],
  ['분당 (134/87/48)',  440, 134, 87,48],
  ['저가지역 로컬가 (90/60/40)', 300, 90,60,40],
  ['야탑 로컬가 (80/55/30)',     0,  80,55,30],  // 무월세여도?
];
regions.forEach(([name,rent,p4,p2,p1])=>{
  const m = model(rent,p4,p2,p1);
  console.log(`   ${name} | ${rent}만 | ${fk(m.full)}만 | ${m.bep.toFixed(1)}% | ${m.op(0.7)>=0?'+':''}${fk(m.op(0.7))} | ${fk(m.maxRent70)}만`);
});
console.log('\n※ 핵심: 월세는 지역 싼매물로 "대입"만 하면 되나, 만실매출(=가격)이 낮은 지역은 비월세 고정원가(1,055만)를 못 덮음.');
console.log('  야탑 로컬가(만실 1,580)는 월세 0이어도 BEP 75% → 우리 원가구조엔 부적합. 분당+ 가격대라야 성립.');
