/**
 * Project SOS — 코워킹 수익성 계산 엔진 (확정판 2026-06-29)
 * 사용법: node coworking_engine.mjs
 * 새 매물 추가: REGIONS 객체에 한 줄 추가하면 끝.
 *
 * 확정 전제 (부사장 보고 기준):
 *  - 좌석 = 전용평 ÷ 0.80  (※0.80 = 실도면 방 면적 가중평균: 4인0.742·2인0.966·1인0.805평/인
 *                            FF현장값 0.89 → 0.80으로 조정. 공용부 별도 제외 X = 이중계상 금지)
 *  - CAPEX(실속): 인테리어 120만/평 + 방음 22만/평 + 전기통신 13만/평
 *                 + 출입·CCTV(룸당 23만 + 보안 550만) + 가구(신품) 좌석당 15만 + 예비 5%
 *  - 월상각 = CAPEX ÷ 60개월
 *  - 월 고정비 = 월세 + 관리비(전용×관리비단가) + 전기냉난방(전용×0.8만) + 공통기타 370만 + 상각
 *      · 공통기타 370만 = 무인운영 280만 + 보험·렌탈·원복충당 90만
 *  - 변동비율 11.5% = 마케팅 7% + PG·플랫폼·환불 4.5%  → 공헌율 88.5%
 *  - 손익(가동률 g) = 만실매출 × g × 0.885 − 고정비
 *  - BEP 점유율 = 고정비 ÷ (만실매출 × 0.885)
 *  - 현금회수(보수) = CAPEX ÷ 70%영업손익   (상각 가산하지 않음)
 *  - 총 소요자금 = CAPEX + 보증금 + 운전자금
 *  - 세전. 법인세 10% 별도. VAT 중립.
 */

// ── 상수 (확정) ──────────────────────────────────────────────
const DENSITY   = 0.80;        // 유효밀도(평/석) — 실도면 가중평균(4인0.742·2인0.966·1인0.805→0.80)
const COMMON    = 3_700_000;   // 공통기타 고정비/월
const ELEC_RATE = 8_000;       // 전기·냉난방 원/전용평·월
const VAR       = 0.045;       // PG·환불
const MKT       = 0.07;        // 마케팅
const CONT      = 1 - VAR - MKT;// 공헌율 0.885
const DEP_MONTHS= 60;          // 상각기간
const CAPEX = {                // CAPEX 단가
  interiorPerPy: 1_200_000,   // 인테리어·칸막이 (오픈천장 X·깔끔 표준마감)
  soundPerPy:      220_000,   // 방음 (적당 차음)
  elecCommPerPy:   110_000,   // 전기·통신 초기설비 (콘센트·랜·AP·분전 보강)
  lockPerRoom:     250_000,   // 스마트 도어락 (앱 연동·원격발급, 무인 필수)
  securityFixed: 8_000_000,   // 공용 CCTV(NVR+카메라) 500만 + 출입 통합시스템·키오스크 300만
  furniturePerSeat:200_000,   // 가구 신품 (책상10+의자7+수납3)
  reserveRate:        0.05,   // 사인·예비비
};
const SEATS_PER_ROOM = 2.83;   // 1·2·4인 믹스 평균 좌석/룸

// ── 입력 (새 매물은 여기 추가) ───────────────────────────────
// rent/depo/wc 단위 = 원, mgmtPerPy = 관리비 원/전용평, blendSeat = 블렌드 좌석가(원/월)
const REGIONS = {
  '판교':  { py:104,   rent:6_500_000, depo:65_000_000, mgmtPerPy:27_000, blendSeat:434_483, wc:5_000_000 },
  '분당':  { py:121,   rent:4_330_000, depo:43_300_000, mgmtPerPy:28_000, blendSeat:324_638, wc:5_000_000 },
  '여의도':{ py:130.4, rent:7_610_000, depo:76_000_000, mgmtPerPy:36_000, blendSeat:383_784, wc:5_000_000 },
};

// ── 엔진 ────────────────────────────────────────────────────
function run(p) {
  const seats = Math.round(p.py / DENSITY);
  const rooms = Math.round(seats / SEATS_PER_ROOM);
  const sub = p.py*CAPEX.interiorPerPy + p.py*CAPEX.soundPerPy + p.py*CAPEX.elecCommPerPy
            + rooms*CAPEX.lockPerRoom + CAPEX.securityFixed + seats*CAPEX.furniturePerSeat;
  const capex = Math.round(sub * (1 + CAPEX.reserveRate));
  const dep   = Math.round(capex / DEP_MONTHS);
  const mgmt  = Math.round(p.py * p.mgmtPerPy);
  const elec  = Math.round(p.py * ELEC_RATE);
  const fixed = p.rent + mgmt + elec + COMMON + dep;
  const full  = seats * p.blendSeat;                       // 만실 월매출
  const op    = g => Math.round(full*g*CONT - fixed);      // 가동률 g 손익
  const op70  = op(0.70);
  const bep   = fixed / (full * CONT);                     // 손익분기 점유율
  const roi   = op70 * 12 / capex;                         // 연 ROI
  const payback = capex / op70;                            // 현금회수(개월, 보수)
  const totalCash = capex + p.depo + p.wc;                 // 총 소요자금
  return { seats, rooms, capex, dep, mgmt, elec, fixed, full,
           op50:op(0.50), op60:op(0.60), op70, bep, roi, payback, totalCash };
}

// ── 출력 ────────────────────────────────────────────────────
const won  = n => Math.round(n).toLocaleString();
const eok  = n => (n/100_000_000).toFixed(2)+'억';
const man  = n => Math.round(n/10_000).toLocaleString()+'만';
const pct  = n => (n*100).toFixed(1)+'%';

console.log('Project SOS 수익성 엔진 (확정판) — 좌석=전용÷0.89·CAPEX 실속·세전\n');
for (const [name, p] of Object.entries(REGIONS)) {
  const r = run(p);
  console.log(`■ ${name}  전용 ${p.py}평 → ${r.seats}석 · ${r.rooms}룸`);
  console.log(`  CAPEX ${eok(r.capex)} (${won(r.capex/p.py/10000)}만/평) | 월상각 ${man(r.dep)}`);
  console.log(`  고정비 ${man(r.fixed)} = 월세 ${man(p.rent)} + 관리비 ${man(r.mgmt)} + 전기 ${man(r.elec)} + 공통 ${man(COMMON)} + 상각 ${man(r.dep)}`);
  console.log(`  만실 ${man(r.full)} → 손익 50% ${man(r.op50)} / 60% ${man(r.op60)} / 70% ${man(r.op70)}`);
  console.log(`  BEP ${pct(r.bep)} | ROI ${pct(r.roi)} | 현금회수 ${r.payback.toFixed(0)}개월`);
  console.log(`  총 소요자금 ${eok(r.totalCash)} = CAPEX ${eok(r.capex)} + 보증금 ${eok(p.depo)} + 운전 ${eok(p.wc)}\n`);
}
