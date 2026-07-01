// 150평 주력 모델 — 22m 폭 × 22.5m, 5밴드(4인3줄+2인/1인2줄)
import fs from 'fs';
const S=38,OX=160,OY=158,FW=22.0,FH=22.5,SPINE=20.9;
const X=m=>OX+m*S,Y=m=>OY+m*S;
let s=[],seat=0,rm=0;const mix={4:0,2:0,1:0};
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1160" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="1240" height="1160" fill="#fff"/>`);
s.push(`<text x="160" y="40" font-size="18.5" font-weight="800" fill="#0f1e3d">코워킹 150평 주력 모델 — 전용 22.0×22.5m=495㎡=150평</text>`);
s.push(`<text x="160" y="60" font-size="11" fill="#64748b">줄1: 4인 3,540×2,400(풀폭 6열) · 줄2~3: 4인 3,380×2,900(6열) · 줄4: 2인 2,200×2,900 · 1인 1,890×1,400 · 우편·창고 / 줄5: 1인 1,890×1,400×20실 · 복도1,100</text>`);
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

// 우측 복도 (y=2.62~19.07)
cor(SPINE,2.62,1.1,16.45,'');
s.push(`<text x="${X(SPINE+0.55)}" y="${Y(10)}" font-size="8" fill="#475569" text-anchor="middle" transform="rotate(-90 ${X(SPINE+0.55)} ${Y(10)})">복도 1,100 (입구연결)</text>`);
s.push(`<rect x="${X(FW)-6}" y="${Y(20.0)}" width="12" height="${2.0*S}" fill="#1d4ed8"/>`);
s.push(`<text x="${X(FW-0.65)}" y="${Y(21.0)}" font-size="10" font-weight="800" fill="#1d4ed8" text-anchor="middle" transform="rotate(-90 ${X(FW-0.65)} ${Y(21.0)})">입구</text>`);

// 줄1: 풀폭 가로형 6열
let x=0.12;
for(let i=0;i<6;i++){room(x,0.12,3.543,2.4,4,'#e8f0ff','3540×2400');x+=3.643;}
cor(0,2.62,SPINE,1.1,'복도 1,100  (양면 — 줄1·줄2)');

// 줄2: 6열 4인
x=0.12;for(let i=0;i<6;i++){room(x,3.82,3.38,2.9,4,'#e8f0ff','3380×2900');x+=3.48;}

// 줄3: 등맞댐
x=0.12;for(let i=0;i<6;i++){room(x,6.82,3.38,2.9,4,'#e8f0ff','3380×2900');x+=3.48;}
cor(0,9.82,SPINE,1.1,'복도 1,100  (양면 — 줄3·줄4)');

// 줄4: 2인 3실 + 1인 12실(6열×2행) + 우편함·창고(1열) — 끝=20.85 < SPINE 20.9 ✓
x=0.12;
for(let i=0;i<3;i++){room(x,11.02,2.2,2.9,2,'#dce8ff','2200×2900');x+=2.3;}
for(let i=0;i<6;i++){
  room(x,11.02,1.89,1.4,1,'#ede8ff','1890×1400');
  room(x,12.52,1.89,1.4,1,'#ede8ff','1890×1400');
  x+=1.99;
}
room(x,11.02,1.89,1.4,'우편','#fef9c3','1890×1400');
room(x,12.52,1.89,1.4,'창고','#f1f5f4','1890×1400');
cor(0,14.02,SPINE,1.1,'복도 1,100  (양면 — 줄4·줄5)');

// 줄5: 1인실 10열×2행=20실 + 사물함(우측 잔여 0.88m)
x=0.12;
for(let i=0;i<10;i++){
  room(x,15.22,1.89,1.4,1,'#ede8ff','1890×1400');
  room(x,16.72,1.89,1.4,1,'#ede8ff','1890×1400');
  x+=1.99;
}
{const wx=SPINE-x;s.push(`<rect x="${X(x)}" y="${Y(15.22)}" width="${wx*S}" height="${2.9*S}" fill="#e8e8e8" stroke="#1e293b" stroke-width="1.3"/>`);s.push(`<text x="${X(x+wx/2)}" y="${Y(16.72)}" font-size="7" fill="#475569" text-anchor="middle" transform="rotate(-90 ${X(x+wx/2)} ${Y(16.72)})">사물함</text>`);}
cor(0,18.22,SPINE,0.85,'복도 1,100 (공용 진입)');

// 공용 (y=19.07, h=3.38)
const cm=(x,w,n,fl,dim)=>{
  s.push(`<rect x="${X(x)}" y="${Y(19.07)}" width="${w*S}" height="${3.38*S}" fill="${fl}" stroke="#1e293b" stroke-width="1.3"/>`);
  s.push(`<text x="${X(x+w/2)}" y="${Y(20.75)}" font-size="9" font-weight="700" fill="#0f1e3d" text-anchor="middle">${n}</text>`);
  if(dim)s.push(`<text x="${X(x+w/2)}" y="${Y(20.75)+12}" font-size="6.5" fill="#64748b" text-anchor="middle">${dim}</text>`);
};
cm(0.05,3.4,'회의실 6인','#eef3fb','3400×3380');
cm(3.55,2.9,'회의실 4인','#eef3fb','2900×3380');
cm(6.55,1.8,'회의실 2인','#e8f4fb','1800×3380');
cm(8.45,2.3,'탕비·OA','#f1f5f9','2300×3380');
cm(10.85,1.9,'우편·소포','#fff7ed','1900×3380');
cm(12.85,8.0,'라운지 + 리셉션 (입구 동선)','#f0fdf4','8000×3380');

s.push(`<text x="${X(FW/2)}" y="${OY+FH*S+40}" font-size="13" font-weight="800" fill="#15803d" text-anchor="middle">독립실 ${rm}호실 / ${seat}석 (4인 ${mix[4]}·2인 ${mix[2]}·1인 ${mix[1]}) + 회의실 6/4/2인 + 라운지·리셉션 + 탕비</text>`);

s.push(`<defs><marker id="a" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M2,2 L8,5 L2,8" fill="none" stroke="#b91c1c" stroke-width="1.3"/></marker></defs>`);
const dl=(x1,y1,x2,y2,t,v)=>{
  s.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b91c1c" stroke-width="1.2" marker-start="url(#a)" marker-end="url(#a)"/>`);
  s.push(v?`<text x="${x1-9}" y="${(y1+y2)/2}" font-size="11" fill="#b91c1c" text-anchor="middle" transform="rotate(-90 ${x1-9} ${(y1+y2)/2})">${t}</text>`:`<text x="${(x1+x2)/2}" y="${y1-6}" font-size="11" fill="#b91c1c" text-anchor="middle">${t}</text>`);
};
dl(X(0),OY-32,X(FW),OY-32,'22,000');
dl(OX-50,Y(0),OX-50,Y(FH),'22,500',true);

s.push(`<text x="160" y="80" font-size="12" font-weight="700" fill="#15803d">독립실 ${rm}호실 / ${seat}석 — 4인 ${mix[4]}실 · 2인 ${mix[2]}실 · 1인 ${mix[1]}실</text>`);
fs.writeFileSync('C:/Users/User/Documents/프로젝트/코워킹_평면도_150평.svg',s.join('\n')+'</svg>','utf8');

const py=150;
const full_rev=mix[4]*128+mix[2]*75+mix[1]*45;
const capex=Math.round((py*(120+6+11)+rm*25+700+seat*23.65+200+100)*1.05);
const dep=Math.round(capex/60);
const rent_est=650; // 만원 (임시)
const fixed=rent_est+Math.round(py*2.5)+Math.round(py*0.8)+Math.round(py*0.4)+332+135+dep;
const op=g=>full_rev*g*0.905-fixed;
const bep=fixed/(full_rev*0.905)*100;
const fk=n=>Math.round(n).toLocaleString();
console.log(`150평: ${rm}호실 ${seat}석 (4인${mix[4]} 2인${mix[2]} 1인${mix[1]})`);
console.log(`만실 ${fk(full_rev)}만원 | CAPEX ${(capex/10000).toFixed(2)}억 | 상각 ${fk(dep)}만/월`);
console.log(`고정비 ${fk(fixed)}만(월세${rent_est}만 임시) | BEP ${bep.toFixed(0)}% | 70%${op(0.7)>=0?'+':''}${fk(op(0.7))}`);
