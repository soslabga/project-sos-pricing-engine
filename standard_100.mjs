// 100평 전국 표준 모델 — 분당 표준가 적용, Row4 1인실 최대화(2인 0실)로 BEP 최소화
// 판교1(pangyo11.mjs)은 판교 프리미엄가 전용 별도 모델. 이 파일은 120·150평과 동일한 "전국형" 트랙.
import fs from 'fs';
const S=38,OX=160,OY=158,FW=19.0,FH=17.4,SPINE=17.8;
const X=m=>OX+m*S,Y=m=>OY+m*S;
let s=[],seat=0,rm=0;const mix={4:0,2:0,1:0};
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1140" height="920" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="1140" height="920" fill="#fff"/>`);
s.push(`<text x="160" y="40" font-size="18.5" font-weight="800" fill="#0f1e3d">100평 전국 표준 모델 — 분당 표준가 · 줄4 1인실 최대화</text>`);
s.push(`<text x="160" y="60" font-size="11" fill="#64748b">줄1: 4인 3,670×2,400(풀폭·가로형) · 줄2~3: 4인 3,440×2,900 · 줄4: 1인 1,890×1,400×16실 · 복도1,100</text>`);
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

// 우측 복도
cor(SPINE,2.62,1.1,14.73,'');
s.push(`<text x="${X(SPINE+0.55)}" y="${Y(9.5)}" font-size="8" fill="#475569" text-anchor="middle" transform="rotate(-90 ${X(SPINE+0.55)} ${Y(9.5)})">복도 1,100 (입구연결)</text>`);
s.push(`<rect x="${X(19)-6}" y="${Y(15.2)}" width="12" height="${2.1*S}" fill="#1d4ed8"/>`);
s.push(`<text x="${X(18.35)}" y="${Y(16.2)}" font-size="10" font-weight="800" fill="#1d4ed8" text-anchor="middle" transform="rotate(-90 ${X(18.35)} ${Y(16.2)})">입구</text>`);

// 줄1: 풀폭 가로형 5x4인
let x=0.12;
for(let i=0;i<5;i++){room(x,0.12,3.67,2.4,4,'#e8f0ff','3670×2400');x+=3.77;}
cor(0,2.62,SPINE,1.1,'복도 1,100  (양면 — 줄1·줄2)');

// 줄2,3: 4인 5실씩 (등맞댐)
x=0.12;for(let i=0;i<5;i++){room(x,3.82,3.44,2.9,4,'#e8f0ff','3440×2900');x+=3.54;}
x=0.12;for(let i=0;i<5;i++){room(x,6.82,3.44,2.9,4,'#e8f0ff','3440×2900');x+=3.54;}
cor(0,9.82,SPINE,1.1,'복도 1,100  (양면 — 줄3·줄4)');

// 줄4: 1인실 최대화 — 8열×2행=16실 (2인 없음, BEP 최소화 확인됨. 8열 끝=15.94m<SPINE17.8, 잔여 1.86m)
x=0.12;
for(let i=0;i<8;i++){
  room(x,11.02,1.89,1.4,1,'#ede8ff','1890×1400');
  room(x,12.52,1.89,1.4,1,'#ede8ff','1890×1400');
  x+=1.99;
}

cor(0,14.02,SPINE,0.85,'복도 1,100 (공용 진입)');

// 공용
const cm=(x,w,n,fl,dim)=>{
  s.push(`<rect x="${X(x)}" y="${Y(14.87)}" width="${w*S}" height="${2.48*S}" fill="${fl}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(16.1)}" font-size="9" font-weight="700" fill="#0f1e3d" text-anchor="middle">${n}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(16.1)+12}" font-size="6.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
};
cm(0.05,3.4,'회의실 6인','#eef3fb','3400×2480');
cm(3.55,2.9,'회의실 4인','#eef3fb','2900×2480');
cm(6.55,2.3,'탕비·OA','#f1f5f9','2300×2480');
cm(8.95,1.9,'우편·소포·창고','#fff7ed','1900×2480');
cm(10.95,6.85,'라운지 + 리셉션 (입구 동선)','#f0fdf4','6850×2480');

s.push(`<text x="${X(9.3)}" y="${OY+FH*S+40}" font-size="13" font-weight="800" fill="#15803d" text-anchor="middle">독립실 ${rm}호실 / ${seat}석 (4인 ${mix[4]}·1인 ${mix[1]}) + 회의실 6/4인 + 라운지·리셉션 + 탕비</text>`);

s.push(`<defs><marker id="a" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M2,2 L8,5 L2,8" fill="none" stroke="#b91c1c" stroke-width="1.3"/></marker></defs>`);
const dl=(x1,y1,x2,y2,t,v)=>{
  s.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b91c1c" stroke-width="1.2" marker-start="url(#a)" marker-end="url(#a)"/>`);
  s.push(v?`<text x="${x1-9}" y="${(y1+y2)/2}" font-size="11" fill="#b91c1c" text-anchor="middle" transform="rotate(-90 ${x1-9} ${(y1+y2)/2})">${t}</text>`:`<text x="${(x1+x2)/2}" y="${y1-6}" font-size="11" fill="#b91c1c" text-anchor="middle">${t}</text>`);
};
dl(X(0),OY-32,X(19),OY-32,'19,000');
dl(OX-50,Y(0),OX-50,Y(17.4),'17,400',true);

s.push(`<text x="160" y="80" font-size="12" font-weight="700" fill="#15803d">독립실 ${rm}호실 / ${seat}석 — 4인 ${mix[4]}실 · 1인 ${mix[1]}실 (2인 없음, 1인 최대화)</text>`);
fs.writeFileSync('C:/Users/User/Documents/프로젝트/코워킹_평면도_100평_전국형.svg',s.join('\n')+'</svg>','utf8');

// CAPEX/고정비 산식 = 부사장_보고용_지역별_SOS_경쟁력_분석.html 8·9장 동일. 배치도(rm/seat/mix) 기준값.
// rent는 실매물 아님 — 120·150평 분당 실매물 rent/py 평균(3.667만/평)을 표준가정으로 사용. 실사 시 교체 필요.
const py=100, rentRate=(432/120+560/150)/2, rent=Math.round(py*rentRate), mgmtRate=2.8, partTime=0, sales=100;
const full_rev=mix[4]*128+mix[2]*75+mix[1]*45;
const capex=Math.round((py*130+py*11+rm*25+800+seat*23.65+50)*1.05);
const dep=Math.round(capex/60);
const mgmt=Math.round(py*mgmtRate), elec=Math.round(py*0.8);
const fixed=rent+mgmt+elec+370+partTime+sales+dep+112;
const op=g=>full_rev*g*0.885-fixed;
const bep=fixed/(full_rev*0.885)*100;
const fk=n=>Math.round(n).toLocaleString();
console.log(`100평 전국형(도면 기준, 분당표준가): ${rm}호실 ${seat}석 (4인${mix[4]} 2인${mix[2]} 1인${mix[1]})`);
console.log(`[가정치] 월세 ${rent}만 = 120·150평 rent/py 평균 ${rentRate.toFixed(3)}만/평 적용 — 실매물 아님`);
console.log(`만실 ${fk(full_rev)}만원 | CAPEX ${fk(capex)}만 | 상각 ${fk(dep)}만/월`);
console.log(`고정비 ${fk(fixed)}만 = 월세${rent}+관리비${mgmt}+전기${elec}+공통370+세일즈${sales}+상각${dep}+기타112`);
console.log(`BEP ${bep.toFixed(1)}% | 50%${op(0.5)>=0?'+':''}${fk(op(0.5))} 60%${op(0.6)>=0?'+':''}${fk(op(0.6))} 70%${op(0.7)>=0?'+':''}${fk(op(0.7))}`);

console.log('');
console.log('=== 3개 전국모델 BEP 비교(분당표준가 공통) ===');
console.log(`100평: ${rm}실/${seat}석 · BEP ${bep.toFixed(1)}%`);
console.log('120평: 33실/90석 · BEP 62.9% (참고: pangyo_120.mjs)');
console.log('150평: 53실/110석 · BEP 61.4% (참고: pangyo_150.mjs)');
console.log('※ 100평이 구조적으로 더 높은 이유: 보안800만·기타112만 등 정액 CAPEX/고정비가 작은 면적일수록 평당 부담이 커짐(희석효과). 룸믹스 최적화(2인→1인)로 66.3%→64.9%까지는 개선했으나, 그 이상(Row2·3 그리드화)은 복도 추가비용이 수익증가분을 상쇄해 역효과(BEP 81.9%로 악화, 검증 완료).');

// 비정형 평면 보정
const avgRevPerRoom=full_rev/rm;
[1,2,3,5].forEach(loss=>{
  const rev2=full_rev-avgRevPerRoom*loss;
  const op65=Math.round(rev2*0.65*0.885-fixed);
  const bep2=fixed/(rev2*0.885)*100;
  console.log(`  [보정 -${loss}실→${rm-loss}실] 65%손익 ${op65>=0?'+':''}${fk(op65)}만 · BEP ${bep2.toFixed(1)}%`);
});
