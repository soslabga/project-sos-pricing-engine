// 100평형 다년 손익추정 — 입주율 램프업 가정(신규 지점 안정화 곡선)
// 근거 상수는 standard_100.mjs와 동일: 만실 2,608 / 고정비 1,495 / 상각 338 / 공헌율 0.885 / CAPEX 20,250
const FULL=2608, FIX=1495, DEP=338, CONT=0.885, CAPEX=20250, LAUNCH=200;
// Year1 월별 입주율(보수적 램프업): M1 20% → M10 70% 도달 → 안정화
const occ=[0.20,0.30,0.40,0.48,0.55,0.60,0.64,0.67,0.69,0.70,0.71,0.72];
const fk=n=>Math.round(n).toLocaleString();
let cumCF=-CAPEX, y1op=0, y1cf=0, bepMonth=null, paybackMonth=null;
console.log('=== Year1 월별 (런칭기 M1~6 마케팅비 +200 반영) ===');
console.log('월 | 입주율 | 매출 | 영업손익 | 현금흐름 | 누적현금흐름(투자회수)');
occ.forEach((g,i)=>{
  const m=i+1;
  const fix=FIX+(m<=6?LAUNCH:0);
  const rev=FULL*g;
  const op=rev*CONT-fix;
  const cf=op+DEP;
  cumCF+=cf;
  y1op+=op; y1cf+=cf;
  if(op>=0 && bepMonth===null) bepMonth=m;
  if(cumCF>=0 && paybackMonth===null) paybackMonth=m;
  console.log(`M${m} | ${(g*100).toFixed(0)}% | ${fk(rev)} | ${op>=0?'+':''}${fk(op)} | ${cf>=0?'+':''}${fk(cf)} | ${fk(cumCF)}`);
});
console.log(`\nYear1 합계: 영업손익 ${fk(y1op)}만 · 현금흐름 ${fk(y1cf)}만`);
console.log(`영업 흑자전환(월) = M${bepMonth}`);

// Year2 안정화 72%, Year3 75%
const yearOP=g=>Math.round((FULL*g*CONT-FIX)*12);
const yearCF=g=>Math.round((FULL*g*CONT-FIX+DEP)*12);
const y2op=yearOP(0.72), y2cf=yearCF(0.72);
const y3op=yearOP(0.75), y3cf=yearCF(0.75);
console.log(`Year2 (평균72%): 영업손익 ${fk(y2op)}만 · 현금흐름 ${fk(y2cf)}만`);
console.log(`Year3 (평균75%): 영업손익 ${fk(y3op)}만 · 현금흐름 ${fk(y3cf)}만`);

// 누적 현금흐름으로 CAPEX 회수 시점
let cc=-CAPEX; let mm=0; const stream=[...occ.map(g=>FULL*g*CONT-(FIX)+DEP)];
// Year1은 위 계산 그대로(런칭비 포함) 재구성
cc=-CAPEX; mm=0; let done=null;
occ.forEach((g,i)=>{const m=i+1;const fix=FIX+(m<=6?LAUNCH:0);cc+=FULL*g*CONT-fix+DEP;mm=m;if(cc>=0&&!done)done=`Y1 M${m}`;});
// 이후 72% 고정
let month=12;
while(cc<0 && month<120){month++;cc+=FULL*0.72*CONT-FIX+DEP;if(cc>=0&&!done)done=`M${month} (약 ${(month/12).toFixed(1)}년)`;}
console.log(`\nCAPEX(${fk(CAPEX)}만) 누적 현금흐름 회수 시점 = ${done}`);
console.log(`3년 누적 현금흐름(회수 반영 전) = ${fk(y1cf+y2cf+y3cf)}만`);
