import fs from 'fs';
const S=38,OX=160,OY=158,FW=19.0,FH=17.4,SPINE=17.8;
const X=m=>OX+m*S,Y=m=>OY+m*S;
let s=[],seat=0,rm=0;const mix={4:0,2:0,1:0};
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1140" height="920" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="1140" height="920" fill="#fff"/>`);
s.push(`<text x="160" y="40" font-size="22" font-weight="800" fill="#0f1e3d">100평 — 전용 100평 · 줄1 풀폭 가로형 · 줄4 2인+1인 전용</text>`);
s.push(`<text x="160" y="60" font-size="11" fill="#64748b">줄1: 4인 3,670×2,400(풀폭·가로형) · 줄2~3: 4인 3,440×2,900 · 줄4: 2인 2,200×3,600 · 1인 1,890×1,750 · 복도1,100</text>`);
s.push(`<rect x="${X(0)}" y="${Y(0)}" width="${FW*S}" height="${FH*S}" fill="#3a4a63"/>`);
s.push(`<rect x="${X(0.05)}" y="${Y(0.05)}" width="${(FW-0.1)*S}" height="${(FH-0.1)*S}" fill="#f8fafc" stroke="#0f1e3d" stroke-width="3"/>`);
const cor=(x,y,w,h,t)=>{
  s.push(`<rect x="${X(x)}" y="${Y(y)}" width="${w*S}" height="${h*S}" fill="#e2e8f0"/>`);
  if(t)s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+3}" font-size="8" fill="#475569" text-anchor="middle">${t}</text>`);
};
const room=(x,y,w,h,c,fill,dim,doorSide)=>{
  s.push(`<rect x="${X(x)}" y="${Y(y)}" width="${w*S}" height="${h*S}" fill="${fill||'#e8f0ff'}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+1}" font-size="12" font-weight="700" fill="#0f1e3d" text-anchor="middle">${c}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+12}" font-size="8.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
  const ds=doorSide||'top';
  const doorW=Math.min(0.7,w*0.45);
  let dx1,dy1,dx2,dy2;
  if(ds==='top'){dx1=X(x+w/2-doorW/2);dy1=Y(y);dx2=X(x+w/2+doorW/2);dy2=Y(y);}
  else if(ds==='bottom'){dx1=X(x+w/2-doorW/2);dy1=Y(y+h);dx2=X(x+w/2+doorW/2);dy2=Y(y+h);}
  else if(ds==='left'){dx1=X(x);dy1=Y(y+h/2-doorW/2);dx2=X(x);dy2=Y(y+h/2+doorW/2);}
  else{dx1=X(x+w);dy1=Y(y+h/2-doorW/2);dx2=X(x+w);dy2=Y(y+h/2+doorW/2);}
  s.push(`<line x1="${dx1}" y1="${dy1}" x2="${dx2}" y2="${dy2}" stroke="#fff" stroke-width="9"/>`);
  s.push(`<line x1="${dx1}" y1="${dy1}" x2="${dx2}" y2="${dy2}" stroke="#dc2626" stroke-width="6"/>`);
  if(typeof c==='number'){seat+=c;rm++;mix[c]++;}
};

// 우측 복도: 줄1(y=0~2.52) 이후부터 시작
cor(SPINE,2.62,1.1,14.73,'');
s.push(`<text x="${X(SPINE+0.55)}" y="${Y(9.5)}" font-size="8" fill="#475569" text-anchor="middle" transform="rotate(-90 ${X(SPINE+0.55)} ${Y(9.5)})">복도 1,100 (입구연결)</text>`);
s.push(`<rect x="${X(19)-10}" y="${Y(15.2)}" width="20" height="${2.1*S}" fill="#1d4ed8" stroke="#fff" stroke-width="2"/>`);
s.push(`<polygon points="${X(19)+22},${Y(16.25)} ${X(19)+2},${Y(16.05)} ${X(19)+2},${Y(16.45)}" fill="#1d4ed8"/>`);
s.push(`<rect x="${X(19)+24}" y="${Y(16.25)-14}" width="46" height="28" rx="4" fill="#1d4ed8"/>`);
s.push(`<text x="${X(19)+47}" y="${Y(16.25)+5}" font-size="14" font-weight="900" fill="#fff" text-anchor="middle">입구</text>`);

// 줄1: 풀폭 가로형, y=0.12, h=2.4 — 실제 매물은 완전 직사각형이 아니므로 마지막 1칸은 비정형 손실 구간으로 반영(4인실 1개분 면적 차감)
let x=0.12;
for(let i=0;i<4;i++){room(x,0.12,3.67,2.4,4,'#e8f0ff','3670×2400','bottom');x+=3.77;}
s.push(`<rect x="${X(x)}" y="${Y(0.12)}" width="${3.67*S}" height="${2.4*S}" fill="#f1f1f1" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="6,4"/>`);
s.push(`<text x="${X(x+1.835)}" y="${Y(1.32)}" font-size="10" fill="#64748b" text-anchor="middle">비정형 손실 구간</text>`);
s.push(`<text x="${X(x+1.835)}" y="${Y(1.32)+13}" font-size="8.5" fill="#94a3b8" text-anchor="middle">(기둥·경사벽 등 비직사각형 실측 반영, 4인실 1개분 의도적 차감)</text>`);

// 복도1 (양면 — 줄1·줄2): y=2.62
cor(0,2.62,SPINE,1.1,'복도 1,100  (양면 — 줄1·줄2)');

// 줄2: y=3.82, h=2.9, 5x4인 — 문은 복도1(위) 방향
x=0.12;for(let i=0;i<5;i++){room(x,3.82,3.44,2.9,4,'#e8f0ff','3440×2900','top');x+=3.54;}

// 줄3 (등맞댐): y=6.82, h=2.9, 5x4인 — 문은 복도2(아래) 방향
x=0.12;for(let i=0;i<5;i++){room(x,6.82,3.44,2.9,4,'#e8f0ff','3440×2900','bottom');x+=3.54;}

// 복도2 (양면 — 줄3·줄4): y=9.82
cor(0,9.82,SPINE,1.1,'복도 1,100  (양면 — 줄3·줄4)');

// 줄4: 2인 4실(깊이3.6) + 1인 8실(4열×2행, 각 깊이1.75m=1.00평/인) — 문은 각자 가까운 복도쪽
x=0.12;
for(let i=0;i<4;i++){room(x,11.02,2.2,3.6,2,'#dce8ff','2200×3600','top');x+=2.3;}
for(let i=0;i<4;i++){
  room(x,11.02,1.89,1.75,1,'#ede8ff','1890×1750','top');
  room(x,12.87,1.89,1.75,1,'#ede8ff','1890×1750','bottom');
  x+=1.99;
}

// 복도3 (공용진입): y=14.72(줄4 깊이 증가분만큼 뒤로 밀림)
cor(0,14.72,SPINE,0.85,'복도 1,100 (공용 진입)');

// 공용 (y=15.57, h=1.78 — 1인실 깊이 확장분 0.7m을 여기서 빌려옴, 총 FH는 불변)
const cm=(x,w,n,fl,dim)=>{
  s.push(`<rect x="${X(x)}" y="${Y(15.57)}" width="${w*S}" height="${1.78*S}" fill="${fl}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(16.46)}" font-size="12" font-weight="700" fill="#0f1e3d" text-anchor="middle">${n}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(16.46)+12}" font-size="8.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
};
cm(0.05,3.4,'회의실 6인','#eef3fb','3400×1780');
cm(3.55,2.9,'회의실 4인','#eef3fb','2900×1780');
cm(6.55,1.8,'OA','#f1f5f9','1800×1780');
cm(8.45,1.5,'우편·소포','#fff7ed','1500×1780');
cm(10.05,1.5,'창고','#f1f5f4','1500×1780');
cm(11.65,6.15,'라운지 + 탕비 + 리셉션 (입구 동선)','#f0fdf4','6150×1780');

s.push(`<text x="${X(9.3)}" y="${OY+FH*S+40}" font-size="13" font-weight="800" fill="#15803d" text-anchor="middle">독립실 ${rm}호실 / ${seat}석 (4인 ${mix[4]}·2인 ${mix[2]}·1인 ${mix[1]}) + 회의실 6/4인 + OA + 우편·소포 + 창고 + 라운지·탕비·리셉션</text>`);

s.push(`<defs><marker id="a" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M2,2 L8,5 L2,8" fill="none" stroke="#b91c1c" stroke-width="1.3"/></marker></defs>`);
const dl=(x1,y1,x2,y2,t,v)=>{
  s.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b91c1c" stroke-width="1.2" marker-start="url(#a)" marker-end="url(#a)"/>`);
  s.push(v?`<text x="${x1-9}" y="${(y1+y2)/2}" font-size="11" fill="#b91c1c" text-anchor="middle" transform="rotate(-90 ${x1-9} ${(y1+y2)/2})">${t}</text>`:`<text x="${(x1+x2)/2}" y="${y1-6}" font-size="11" fill="#b91c1c" text-anchor="middle">${t}</text>`);
};
dl(X(0),OY-32,X(19),OY-32,'19,000');
dl(OX-50,Y(0),OX-50,Y(17.4),'17,400',true);

s.push(`<text x="160" y="80" font-size="12" font-weight="700" fill="#15803d">독립실 ${rm}호실 / ${seat}석 — 4인 ${mix[4]}실 · 2인 ${mix[2]}실 · 1인 ${mix[1]}실</text>`);
fs.writeFileSync('C:/Users/User/Documents/프로젝트/코워킹_평면도_판교1_정밀.svg',s.join('\n')+'</svg>','utf8');

// CAPEX/고정비 산식 = 부사장_보고용_지역별_SOS_경쟁력_분석.html 8·9장 그대로
// 실매물 확정(판교1.png): 에이치스퀘어 S동 B1, 전용344㎡=104평, 보증금7,500만·월세650만(복합상가·체육시설), 확인매물 26.06.26
const py=104, rent=650, depo=7500, mgmtRate=1.5, partTime=0, labor=350; // 관리비 1.5만/평=실측판교관리비고지서(0.75만/평) 보수적 중간값 // 현장담당 1인운영 인건비(지점손익 기준). 유사직무(오피스텔 시설관리) 연봉3600~3800만=월300~317만 기본급 + 4대보험11%+퇴직충당금8.3%(법정부담 약20%) 웹검증. 마케팅7%는 CONT 0.885에 이미 반영
// [가격정책 최종 2026-07-01] 판교=규제로 인한 독과점 상권(SP 지점 없음, FF만 있음, 확인된 사실) — 전국표준모델(분당기준 cost-plus 25%)과 분리해 "참고용" 별도 취급.
// "FF판교 4인실거래222.48만(-28%)"은 미검증 가정(판교_코워킹_입지수익성_보고.md 98행: "실제 프로모션율 미확인, 28%는 SP 기준 추정")이라 폐기.
// 대신 정가309만 대비 가정 할인가 250만(참고용 추정)에서 -20% = 200만(50.0만/석)으로 책정. 원가하한(36.2만/석)보다 충분히 높음.
const full_rev=mix[4]*200+mix[2]*130+mix[1]*73;
// 인테리어 150만/평 = 순수 마감재/칸막이/조명만(냉난방·소방은 아래 별도 항목으로 분리계상, 이중계상 아님)
// 소방·냉난방은 실제 견적 기준으로 별도 반영함
const capex=Math.round((py*130+py*7+py*20+py*9+rm*7+200+seat*23.65+50+100)*1.05); // [원복 2026-07-01] 소방·냉난방은 이미지에 명시된 "소계" 합계로 재확정: 소방설비공사 소계=12,369,010+14,920,660=27,289,670원(소방4층.png 화면의 소계란 직접 확인)÷301.54평=9.05만/평. 냉난방 장비33,263,000+설치26,130,000=59,393,000원(냉난방.png+냉난방2.png 항목별 전체합산)÷301.54평=19.70만/평. 무선AP(Cisco1,999만)는 SOS 본사용 과사양이라 제외(검증표 판단 유지) + 라운지가구100만 + 전기통신7만/평 + 도어락7만/룸 + 보안200만
const dep=Math.round(capex/60);
const mgmt=Math.round(py*mgmtRate), elec=Math.round(py*0.6); // 실측 판교1103호 관리비고지서 반영(보수적 중간값)
const clean=Math.round(py*0.4+seat*1), opexFlat=32; // 청소용역비산출표 기준: 전용평×0.4만 + 좌석×1만. 인터넷4+복합기10+정수기3+CCTV보안12+화재보험3
const fixed=rent+mgmt+elec+clean+opexFlat+labor+partTime+dep;
const op=g=>full_rev*g*0.885-fixed;
const bep=fixed/(full_rev*0.885)*100;
const fk=n=>Math.round(n).toLocaleString();
console.log(`판교1: ${rm}호실 ${seat}석 (4인${mix[4]} 2인${mix[2]} 1인${mix[1]})`);
console.log(`만실 ${fk(full_rev)}만원 | CAPEX ${fk(capex)}만 | 상각 ${fk(dep)}만/월`);
console.log(`고정비 ${fk(fixed)}만 = 월세${rent}+관리비${mgmt}+전기${elec}+청소${clean}+운영잡비${opexFlat}+인건비${labor}+상각${dep}`);
console.log(`BEP ${bep.toFixed(1)}% | 50%${op(0.5)>=0?'+':''}${fk(op(0.5))} 60%${op(0.6)>=0?'+':''}${fk(op(0.6))} 70%${op(0.7)>=0?'+':''}${fk(op(0.7))}`);

// 회원보증금(SOS가 입주 회원에게서 수취). SP 실계약 5건(여의도424호·432호·분당2호점 5/6/8인) 전부 "표준요금×1.1×2개월"(연간계약 기준)과 정확히 일치 검증됨(계약서 원본 대조).
// SOS는 단기계약(1주·1개월)도 취급하므로 SP식 2개월 일괄적용은 과도 — "계약기간만큼만" 차등: 1주=0, 1개월=1개월치, 1년(SP 상당)=2개월치. 참고용(총 투자금 조달액에는 영향 없음, 정상화 후 부채로만 보유)
const memberDepo1moFull=Math.round(full_rev*1.1*1), memberDepoFull=Math.round(full_rev*1.1*2);
const memberDepo1moBEP=Math.round(memberDepo1moFull*bep/100), memberDepoBEP=Math.round(memberDepoFull*bep/100);
console.log(`회원보증금(참고, 계약별 차등×VAT포함): BEP가동률(${bep.toFixed(1)}%) 기준 1개월계약 ${fk(memberDepo1moBEP)}만 ~ 1년계약 ${fk(memberDepoBEP)}만`);

// 마케팅: 정상화 이후는 CONT 0.885(매출7%)에 이미 반영. 초기(1~6개월)는 인지도0이라 정액 추가 지출 필요 — 참고용 민감도만(정식 BEP에는 미반영)
const launchMkt=200, fixedLaunch=fixed+launchMkt, bepLaunch=fixedLaunch/(full_rev*0.885)*100;
console.log(`[런칭기 참고, 1~6개월] 정액 마케팅비 +${launchMkt}만 가정 시: 고정비${fk(fixedLaunch)}만 · BEP ${bepLaunch.toFixed(1)}% (정상 BEP 아님, 초기 한시적. 이후 매출7% 변동비로 자연 감소)`);const capex200=Math.round(py*200*1.0); // 200만/평 보수 민감도
const dep200=Math.round(capex200/60);
const fixed200=fixed-dep+dep200;
const bep200=fixed200/(full_rev*0.885)*100;
console.log(`[민감도] CAPEX 200만/평 가정 시: CAPEX ${fk(capex200)}만·상각${fk(dep200)}만 → 고정비${fk(fixed200)}만 · BEP ${bep200.toFixed(1)}%`);

// 비정형 평면 보정 — 배치도 기준 평균 호실매출로 손실 호실 민감도 계산
const avgRevPerRoom=full_rev/rm;
[1,2,3,5].forEach(loss=>{
  const rev2=full_rev-avgRevPerRoom*loss;
  const op65=Math.round(rev2*0.65*0.885-fixed);
  const bep2=fixed/(rev2*0.885)*100;
  console.log(`  [보정 -${loss}실→${rm-loss}실] 65%손익 ${op65>=0?'+':''}${fk(op65)}만 · BEP ${bep2.toFixed(1)}%`);
});





