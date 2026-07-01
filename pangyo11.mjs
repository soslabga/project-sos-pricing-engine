import fs from 'fs';
const S=38,OX=160,OY=158,FW=19.0,FH=17.4,SPINE=17.8;
const X=m=>OX+m*S,Y=m=>OY+m*S;
let s=[],seat=0,rm=0;const mix={4:0,2:0,1:0};
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1140" height="920" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="1140" height="920" fill="#fff"/>`);
s.push(`<text x="160" y="40" font-size="18.5" font-weight="800" fill="#0f1e3d">판교1 — 전용 100평 · 줄1 풀폭 가로형 · 줄4 2인+1인 전용</text>`);
s.push(`<text x="160" y="60" font-size="11" fill="#64748b">줄1: 4인 3,670×2,400(풀폭·가로형) · 줄2~3: 4인 3,440×2,900 · 줄4: 2인 2,200×2,900 · 1인 1,890×1,400 · 복도1,100</text>`);
s.push(`<rect x="${X(0)}" y="${Y(0)}" width="${FW*S}" height="${FH*S}" fill="#3a4a63"/>`);
s.push(`<rect x="${X(0.05)}" y="${Y(0.05)}" width="${(FW-0.1)*S}" height="${(FH-0.1)*S}" fill="#f8fafc" stroke="#0f1e3d" stroke-width="3"/>`);
const cor=(x,y,w,h,t)=>{
  s.push(`<rect x="${X(x)}" y="${Y(y)}" width="${w*S}" height="${h*S}" fill="#e2e8f0"/>`);
  if(t)s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+3}" font-size="8" fill="#475569" text-anchor="middle">${t}</text>`);
};
const room=(x,y,w,h,c,fill,dim)=>{
  s.push(`<rect x="${X(x)}" y="${Y(y)}" width="${w*S}" height="${h*S}" fill="${fill||'#e8f0ff'}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+1}" font-size="9" font-weight="700" fill="#0f1e3d" text-anchor="middle">${c}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(y+h/2)+12}" font-size="6.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
  if(typeof c==='number'){seat+=c;rm++;mix[c]++;}
};

// 우측 복도: 줄1(y=0~2.52) 이후부터 시작
cor(SPINE,2.62,1.1,14.73,'');
s.push(`<text x="${X(SPINE+0.55)}" y="${Y(9.5)}" font-size="8" fill="#475569" text-anchor="middle" transform="rotate(-90 ${X(SPINE+0.55)} ${Y(9.5)})">복도 1,100 (입구연결)</text>`);
s.push(`<rect x="${X(19)-6}" y="${Y(15.2)}" width="12" height="${2.1*S}" fill="#1d4ed8"/>`);
s.push(`<text x="${X(18.35)}" y="${Y(16.2)}" font-size="10" font-weight="800" fill="#1d4ed8" text-anchor="middle" transform="rotate(-90 ${X(18.35)} ${Y(16.2)})">입구</text>`);

// 줄1: 풀폭 가로형, y=0.12, h=2.4, 5x4인 (w=3.67, step=3.77)
let x=0.12;
for(let i=0;i<5;i++){room(x,0.12,3.67,2.4,4,'#e8f0ff','3670×2400');x+=3.77;}

// 복도1 (양면 — 줄1·줄2): y=2.62
cor(0,2.62,SPINE,1.1,'복도 1,100  (양면 — 줄1·줄2)');

// 줄2: y=3.82, h=2.9, 5x4인
x=0.12;for(let i=0;i<5;i++){room(x,3.82,3.44,2.9,4,'#e8f0ff','3440×2900');x+=3.54;}

// 줄3 (등맞댐): y=6.82, h=2.9, 5x4인
x=0.12;for(let i=0;i<5;i++){room(x,6.82,3.44,2.9,4,'#e8f0ff','3440×2900');x+=3.54;}

// 복도2 (양면 — 줄3·줄4): y=9.82
cor(0,9.82,SPINE,1.1,'복도 1,100  (양면 — 줄3·줄4)');

// 줄4: 2인 4실 + 1인 8실(4열×2행) — 4×2.3+4×1.99-0.1=17.18m < SPINE 17.8 ✓
x=0.12;
for(let i=0;i<4;i++){room(x,11.02,2.2,2.9,2,'#dce8ff','2200×2900');x+=2.3;}
for(let i=0;i<4;i++){
  room(x,11.02,1.89,1.4,1,'#ede8ff','1890×1400');
  room(x,12.52,1.89,1.4,1,'#ede8ff','1890×1400');
  x+=1.99;
}

// 복도3 (공용진입): y=14.02
cor(0,14.02,SPINE,0.85,'복도 1,100 (공용 진입)');

// 공용 (y=14.87, h=2.48)
const cm=(x,w,n,fl,dim)=>{
  s.push(`<rect x="${X(x)}" y="${Y(14.87)}" width="${w*S}" height="${2.48*S}" fill="${fl}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(16.1)}" font-size="9" font-weight="700" fill="#0f1e3d" text-anchor="middle">${n}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(16.1)+12}" font-size="6.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
};
cm(0.05,3.4,'회의실 6인','#eef3fb','3400×2480');
cm(3.55,2.9,'회의실 4인','#eef3fb','2900×2480');
cm(6.55,1.8,'OA','#f1f5f9','1800×2480');
cm(8.45,1.5,'우편·소포','#fff7ed','1500×2480');
cm(10.05,1.5,'창고','#f1f5f4','1500×2480');
cm(11.65,6.15,'라운지 + 탕비 + 리셉션 (입구 동선)','#f0fdf4','6150×2480');

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
const full_rev=mix[4]*180+mix[2]*120+mix[1]*70;
// 인테리어 130→150만/평(냉난방 포함 시세 하단, 웹검증) 반영
// 소방시설(스프링클러 등) 추가비용 미반영 — 다중이용업소법 시행령 제2조 목록에 공유오피스·코워킹·사무실임대업 불포함(법령 확인, 2026-07-01) → 별도 의무 아님
const capex=Math.round((py*150+py*7+py*20+py*9+rm*7+200+seat*23.65+50+100)*1.05); // 냉난방20만/평+소방9만/평 신규(판교4층 인테리어 실제견적: 소방2,729만=9.05만/평, 냉난방5,939만=19.70만/평, 소방4층.png+냉난방.png+냉난방2.png) // 라운지가구(아웃도어풍) 100만 정액 추가 // 전기통신11→7만/평 확정검증(평촌임대차계약서 37평×전기및네트워크.png 247.5만원=6.69만/평, 판교 통신전용4.05만/평과 역산 정합) + 도어락7만/룸 + 보안200만
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
const capex200=Math.round(py*200*1.0); // 200만/평 보수 민감도
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

