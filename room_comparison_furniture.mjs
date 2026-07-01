// 1인실/2인실/4인실 가구배치 비교 — 책상1200mm 고정모듈 때문에 2인실이 비효율적인 이유를 시각화
import fs from 'fs';
const S=120; // px/m, 세 방을 같은 축척으로 비교
const GAP=80, PADX=60, PADY=140;

const desk=(x,y,w,h,ox,oy)=>`<g><rect x="${ox+x*S}" y="${oy+y*S}" width="${w*S}" height="${h*S}" fill="#d9c9a3" stroke="#8a6d3b" stroke-width="2" rx="3"/><text x="${ox+(x+w/2)*S}" y="${oy+(y+h/2)*S+4}" font-size="10" fill="#5c4a2a" text-anchor="middle">책상 1200</text></g>`;
const chair=(cx,cy,ox,oy,rot)=>`<g transform="rotate(${rot} ${ox+cx*S} ${oy+cy*S})"><circle cx="${ox+cx*S}" cy="${oy+cy*S}" r="${0.22*S}" fill="#8fb8de" stroke="#2c5c8a" stroke-width="2"/></g>`;
const room=(w,h,ox,oy,label)=>{
  let s=`<rect x="${ox}" y="${oy}" width="${w*S}" height="${h*S}" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>`;
  return s;
};
const dimLabel=(w,h,ox,oy,text)=>`<text x="${ox+w*S/2}" y="${oy-14}" font-size="16" font-weight="800" fill="#0f1e3d" text-anchor="middle">${text}</text><text x="${ox+w*S/2}" y="${oy+h*S+26}" font-size="12" fill="#64748b" text-anchor="middle">${(w*1000).toFixed(0)}×${(h*1000).toFixed(0)}mm</text>`;

let s=[];
const totalW = PADX*2 + 1.89*S + GAP + 2.2*S + GAP + 3.44*S;
const totalH = PADY + 2.9*S + 160;
s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" font-family="Malgun Gothic,Pretendard,sans-serif">`);
s.push(`<rect width="${totalW}" height="${totalH}" fill="#fff"/>`);
s.push(`<text x="${totalW/2}" y="40" font-size="20" font-weight="800" fill="#0f1e3d" text-anchor="middle">1인실 vs 2인실 vs 4인실 — 책상 1200mm 고정모듈 기준 가구배치 비교</text>`);
s.push(`<text x="${totalW/2}" y="64" font-size="12" fill="#64748b" text-anchor="middle">같은 축척(1m=${S}px). 책상이 고정크기라 인원이 늘어도 통행·의자공간이 정비례로 줄지 않음</text>`);

// 1인실 1.89 x 1.4
let ox=PADX, oy=PADY;
s.push(room(1.89,1.4,ox,oy));
s.push(dimLabel(1.89,1.4,ox,oy,'1인실 · 인당 0.80평'));
s.push(desk(0.345,0.15,1.2,0.6,ox,oy));
s.push(chair(0.945,0.95,ox,oy,0));
s.push(`<text x="${ox+1.89*S/2}" y="${oy+1.4*S+50}" font-size="12" fill="#16834a" font-weight="700" text-anchor="middle">면적=2.65㎡(0.80평) → 방음벽으로 최소화, 여유 없음</text>`);

// 2인실 2.2 x 2.9
ox=PADX+1.89*S+GAP; oy=PADY;
s.push(room(2.2,2.9,ox,oy));
s.push(dimLabel(2.2,2.9,ox,oy,'2인실 · 인당 0.97평'));
s.push(desk(0.5,0.15,1.2,0.6,ox,oy));
s.push(chair(1.1,0.95,ox,oy,180));
s.push(chair(1.1,1.95,ox,oy,0));
s.push(desk(0.5,2.15,1.2,0.6,ox,oy));
s.push(`<rect x="${ox+0.15*S}" y="${oy+1.3*S}" width="${1.9*S}" height="${0.3*S}" fill="#fff7ed" stroke="#f0d39d" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+2.2*S/2}" y="${oy+1.3*S+20}" font-size="9" fill="#a15c07" text-anchor="middle">중앙 통행공간(사람수 늘어도 안 줄어듦)</text>`);
s.push(`<text x="${ox+2.2*S/2}" y="${oy+2.9*S+50}" font-size="12" fill="#b42318" font-weight="700" text-anchor="middle">면적=6.38㎡(1.93평) → 책상2개+통로, 1인실의 2배보다 큼</text>`);

// 4인실 3.44 x 2.9
ox=PADX+1.89*S+GAP+2.2*S+GAP; oy=PADY;
s.push(room(3.44,2.9,ox,oy));
s.push(dimLabel(3.44,2.9,ox,oy,'4인실 · 인당 0.75평'));
s.push(desk(0.2,0.15,1.2,0.6,ox,oy));
s.push(desk(1.6,0.15,1.2,0.6,ox,oy));
s.push(chair(0.8,0.95,ox,oy,180));
s.push(chair(2.2,0.95,ox,oy,180));
s.push(chair(0.8,1.95,ox,oy,0));
s.push(chair(2.2,1.95,ox,oy,0));
s.push(desk(0.2,2.15,1.2,0.6,ox,oy));
s.push(desk(1.6,2.15,1.2,0.6,ox,oy));
s.push(`<rect x="${ox+0.15*S}" y="${oy+1.3*S}" width="${3.14*S}" height="${0.3*S}" fill="#fff7ed" stroke="#f0d39d" stroke-dasharray="4,3"/>`);
s.push(`<text x="${ox+3.44*S/2}" y="${oy+1.3*S+20}" font-size="9" fill="#a15c07" text-anchor="middle">통행공간을 4명이 공유(1인당 분담 面積 감소)</text>`);
s.push(`<text x="${ox+3.44*S/2}" y="${oy+2.9*S+50}" font-size="12" fill="#16834a" font-weight="700" text-anchor="middle">면적=9.98㎡(3.02평) → 통로를 4명이 나눠써서 인당은 오히려 줄어듦</text>`);

s.push('</svg>');
fs.writeFileSync('C:/Users/User/Documents/프로젝트/room_comparison_furniture.svg', s.join('\n'), 'utf8');
console.log('저장 완료: room_comparison_furniture.svg');
