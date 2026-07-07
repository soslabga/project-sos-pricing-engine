// 평당가 기반 일반화 모델 — 판매 평당가(만원/방 전용평/월) × 방 면적 = 방 가격. 지역별 (임차 평당가·판매 평당가) 대입.
// 방 면적(전용평): 1인 1.1 · 2인 2.0 · 4인 3.0. Mix 4인14·2인4·1인8. 전용 105평(공용·복도 포함).
const AREA={4:3.0,2:2.0,1:1.1}, MIX={4:14,2:4,1:8};
const ROOM_AREA = MIX[4]*AREA[4]+MIX[2]*AREA[2]+MIX[1]*AREA[1];  // 방 총 전용면적
const PY=105, NONRENT=1055, CONT=0.885;   // 비월세 고정원가 1,055만(인건비350+상각338+관리비158+전기63+청소114+잡비32)
const f=n=>n.toFixed(1);

console.log(`■ 방 총면적 = ${f(ROOM_AREA)}평 / 전용 ${PY}평 (방 비중 ${f(ROOM_AREA/PY*100)}%, 나머지 공용·복도)`);
console.log(`■ 만실매출 = 방면적 ${f(ROOM_AREA)}평 × 판매평당가`);
console.log(`■ 고정비 = 월세(전용 ${PY}평 × 임차평당가) + 비월세 ${NONRENT}만\n`);

// ── ① 경쟁사·우리 판매 평당가 (월가격 ÷ 방면적) ──
console.log('① 판매 평당가 실측 (월 이용료 ÷ 방 전용면적)');
const rows=[
  ['슈가맨워크(야탑) 4인',85,3.0],['슈가맨워크(야탑) 2인',55,1.8],
  ['이든비즈(야탑) 1인',30,1.1],['여의도SP 2인(할인)',130,1.75],
  ['우리 4인',134,3.0],['우리 2인',87,2.0],['우리 1인',48,1.1],
];
rows.forEach(([n,p,a])=>console.log(`   ${n}: ${p}만 ÷ ${a}평 = ${f(p/a)}만/평`));
console.log('   → 야탑 로컬 ≈ 27~31만/평 · 여의도SP ≈ 74만/평 · 우리(현재) ≈ 44만/평\n');

// ── ② 일반화: (임차평당가, 판매평당가) → 만실·BEP ──
function model(rentPy, sellPy){
  const full = ROOM_AREA*sellPy;
  const fixed = PY*rentPy + NONRENT;
  const bep = fixed/(full*CONT)*100;
  const op70 = full*0.7*CONT - fixed;
  return {full, fixed, bep, op70};
}
// BEP 70% 되는 최소 판매평당가
const minSell70 = rentPy => (PY*rentPy+NONRENT)/(ROOM_AREA*CONT*0.70);

console.log('② 지역 시나리오 [임차평당가 → BEP70% 되는 최소 판매평당가]');
[3.0,3.5,4.19,5.0,6.0].forEach(r=>{
  console.log(`   임차 ${f(r)}만/평(월세 ${Math.round(PY*r)}만) → 판매 최소 ${f(minSell70(r))}만/평 필요`);
});
console.log('   ※ 즉 판매평당가는 임차와 세트. 야탑 판매(29)로 하려면 임차가 매우 낮아야 함.\n');

console.log('③ 대표 케이스');
[['분당 현행(임차4.19·판매44)',4.19,44],['야탑판매 분당임차(임차4.19·판매30)',4.19,30],
 ['저가매물+야탑판매(임차2.5·판매30)',2.5,30]].forEach(([n,r,s])=>{
  const m=model(r,s);
  console.log(`   ${n}: 만실 ${Math.round(m.full)}만 · BEP ${f(m.bep)}% · 70%손익 ${m.op70>=0?'+':''}${Math.round(m.op70)}만`);
});
console.log(`\n핵심: 비월세 고정원가 ${NONRENT}만만으로도 방면적 ${f(ROOM_AREA)}평에서 판매 ${f(NONRENT/(ROOM_AREA*CONT*0.70))}만/평(70%기준)이 필요.`);
console.log(`이는 야탑 로컬 판매평당가(~29)와 맞먹음 → 임대료 0이어도 로컬가로는 본전. 우리 원가구조가 로컬가와 양립 불가한 근본 이유.\n`);

// ── ④ 지역별 실매물 임차 평당가 → 필요 판매평당가 vs 그 지역 경쟁사 판매평당가 ──
console.log('④ 지역별 평단가 (실매물 기준)');
console.log('   지역(실매물) | 임차평당가 | BEP70 최소판매 | 그지역 경쟁사판매 | 판정');
const regions=[
  ['분당 소형상가(100평)', 440/105, '서현로컬 ~27~30'],
  ['분당 오피스(120평,수내)', 432/120, '서현로컬 ~27~30'],
  ['분당 큰상가(150평)', 560/150, '서현로컬 ~27~30'],
  ['판교 B1상가(104평)', 650/104, 'FF 판교 高(222만/4인)'],
  ['여의도(참고)', 6.0, 'SP ~74'],
];
regions.forEach(([n,r,comp])=>{
  const need=minSell70(r);
  console.log(`   ${n} | ${f(r)}만/평 | ${f(need)}만/평 | ${comp} | 판매 ${f(need)}↑ 받아야 흑자`);
});
console.log('\n결론: 우리 최소 판매평당가(37~46)는 야탑·서현 로컬가(27~30)보다 높음 → 로컬 저가지역엔 부적합.');
console.log('      FF/SP가 비싼 지역(판교·여의도)에서 그들보다 싸게(판매 46~60/평) 받으면 흑자 → 이런 지역이 타깃.');
