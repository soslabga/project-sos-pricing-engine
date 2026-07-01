// 1인실/2인실/4인실 가구배치 비교 — 책상1200mm 고정모듈 때문에 2인실이 비효율적인 이유를 시각화
// 원칙: 문은 항상 위쪽(복도 방향) · 책상은 문을 막지 않게 배치 · 안쪽 책상 쓰는 사람이 바깥쪽 책상을 가로지르지 않도록 통로 확보
import fs from 'fs';
const S=120; // px/m, 세 방을 같은 축척으로 비교
const GAP=80, PADX=60, PADY=140;

const desk=(x,y,w,h,ox,oy)=>`<g><rect x="${ox+x*S}" y="${oy+y*S}" width="${w*S}" height="${h*S}" fill="#d9c9a3" stroke="#8a6d3b" stroke-width="2" rx="3"/><text x="${ox+(x+w/2)*S}" y="${oy+(y+h/2)*S+4}" font-size="10" fill="#5c4a2a" text-anchor="middle">책상 1200</text></g>`;
const chair=(cx,cy,ox,oy)=>`<circle cx="${ox+cx*S}" cy="${oy+cy*S}" r="${0.22*S}" fill="#8fb8de" stroke="#2c5c8a" stroke-width="2"/>`;
const room=(w,h,ox,oy)=>`<rect x="${ox}" y="${oy}" width="${w*S}" height="${h*S}" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>`;
const doorMark=(w,ox,oy,doorW)=>{
  const dw=doorW||0.8;
  const x1=ox+(w/2-dw/2)*S, x2=ox+(w/2+dw/2)*S;
  return `<line x1="${x1}" y1="${oy}" x2="${x2}" y2="${oy}" stroke="#fff" stroke-width="9"/><line x1="${x1}" y1="${oy}" x2="${x2}" y2="${oy}" stroke="#dc2626" stroke-width="6"/><text x="${ox+w*S/2}" y="${oy-8}" font-size="11" font-weight="800" fill="#dc2626" text-anchor="middle">문(복도)</text>`;
};
const dimLabel=(w,h,ox,oy,text)=>`<text x="${ox+w*S/2}" y="${oy-32}" font-size="16" font-weight="800" fill="#0f1e3d" text-anchor="middle">${text}</text><text x="${ox+w*S/2}" y="${oy+h*S+26}" font-size="12" fill="#64748b" text-anchor="middle">${(w*1000).toFixed(0)}×${(h*1000).toFixed(0)}mm</text>`;

let s=[];
const totalW = PADX*2 + 1.89*S + GAP + 2.2*S + GAP + 3.44*S;
const totalH = PADY + 3.6*S + 160;
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="${totalW}" height="${totalH}" fill="#fff"/>`);
s.push(`<text x="${totalW/2}" y="40" font-size="20" font-weight="800" fill="#0f1e3d" text-anchor="middle">1인실 vs 2인실 vs 4인실 — 책상 1200mm 고정모듈 기준 가구배치 비교</text>`);
s.push(`<text x="${totalW/2}" y="64" font-size="12" fill="#64748b" text-anchor="middle">문은 항상 복도쪽(위) · 책상은 문을 막지 않게 배치 · 안쪽 자리 진입 통로 확보</text>`);

// 1인실 1.89 x 1.75 — 문(위)→여유공간→의자→책상(안쪽 벽). 1인이라 통로 간섭 없음
let ox=PADX, oy=PADY;
s.push(room(1.89,1.75,ox,oy));
s.push(dimLabel(1.89,1.75,ox,oy,'1인실 · 인당 1.00평'));
s.push(doorMark(1.89,ox,oy));
s.push(`<rect x="${ox+0.15*S}" y="${oy+0.1*S}" width="${1.59*S}" height="${0.55*S}" fill="#eef7f0" stroke="#9cc9a8" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+1.89*S/2}" y="${oy+0.1*S+18}" font-size="9" fill="#16834a" text-anchor="middle">여유공간(통행)</text>`);
s.push(chair(0.945,0.95,ox,oy));
s.push(desk(0.345,1.15,1.2,0.6,ox,oy));
s.push(`<text x="${ox+1.89*S/2}" y="${oy+1.75*S+50}" font-size="12" fill="#16834a" font-weight="700" text-anchor="middle">면적=3.31㎡(1.00평) → 1인이라 통로 간섭 없음</text>`);

// 2인실 2.2 x 3.6 — 책상 2개를 왼쪽 벽에 세로(90도)로 붙여 위·아래 배치, 오른쪽을 통로로 비워 안쪽 자리도 앞자리를 안 지나감
ox=PADX+1.89*S+GAP; oy=PADY;
s.push(room(2.2,3.6,ox,oy));
s.push(dimLabel(2.2,3.6,ox,oy,'2인실 · 인당 1.20평'));
s.push(doorMark(2.2,ox,oy));
s.push(`<rect x="${ox+0.05*S}" y="${oy+0.1*S}" width="${2.1*S}" height="${0.3*S}" fill="#fff7ed" stroke="#f0d39d" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+2.2*S/2}" y="${oy+0.1*S+20}" font-size="9" fill="#a15c07" text-anchor="middle">여유공간(통행, 문 앞)</text>`);
s.push(desk(0.1,0.5,0.6,1.2,ox,oy));
s.push(chair(0.85,1.1,ox,oy));
s.push(desk(0.1,1.7,0.6,1.2,ox,oy));
s.push(chair(0.85,2.3,ox,oy));
s.push(`<rect x="${ox+1.1*S}" y="${oy+0.5*S}" width="${1.05*S}" height="${2.9*S}" fill="#f0f9ff" stroke="#bcd9ef" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+1.625*S}" y="${oy+1.95*S}" font-size="8.5" fill="#1c6ea4" text-anchor="middle" transform="rotate(-90 ${ox+1.625*S} ${oy+1.95*S})">오른쪽 통로(안쪽 책상도 앞 책상 안 지나고 바로 진입)</text>`);
s.push(`<text x="${ox+2.2*S/2}" y="${oy+3.6*S+50}" font-size="12" fill="#b42318" font-weight="700" text-anchor="middle">면적=7.92㎡(2.40평) → 책상 좌측벽 세로배치 + 우측 전용통로, 그래도 1인실의 2배 이상</text>`);

// 4인실 3.44 x 2.9 — 책상 4개를 왼쪽·오른쪽 벽에 세로(90도)로 2개씩 붙이고, 가운데를 공유통로로
ox=PADX+1.89*S+GAP+2.2*S+GAP; oy=PADY;
s.push(room(3.44,2.9,ox,oy));
s.push(dimLabel(3.44,2.9,ox,oy,'4인실 · 인당 0.75평'));
s.push(doorMark(3.44,ox,oy,0.9));
s.push(desk(0.1,0.45,0.6,1.2,ox,oy));
s.push(chair(0.85,1.05,ox,oy));
s.push(desk(0.1,1.7,0.6,1.2,ox,oy));
s.push(chair(0.85,2.3,ox,oy));
s.push(desk(2.74,0.45,0.6,1.2,ox,oy));
s.push(chair(2.59,1.05,ox,oy));
s.push(desk(2.74,1.7,0.6,1.2,ox,oy));
s.push(chair(2.59,2.3,ox,oy));
s.push(`<rect x="${ox+1.25*S}" y="${oy+0.1*S}" width="${0.94*S}" height="${2.7*S}" fill="#fff7ed" stroke="#f0d39d" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+1.72*S}" y="${oy+1.45*S}" font-size="9" fill="#a15c07" text-anchor="middle">가운데 공유통로(4명이 나눠씀, 문과 바로 연결)</text>`);
s.push(`<text x="${ox+3.44*S/2}" y="${oy+2.9*S+50}" font-size="12" fill="#16834a" font-weight="700" text-anchor="middle">면적=9.98㎡(3.02평) → 좌우 벽에 책상, 가운데 통로를 4명이 나눠써서 인당면적 가장 작음</text>`);

s.push('</svg>');
fs.writeFileSync('C:/Users/User/Documents/프로젝트/room_comparison_furniture.svg', s.join('\n'), 'utf8');
console.log('저장 완료: room_comparison_furniture.svg');
