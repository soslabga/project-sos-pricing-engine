// SOS_최종보고서.html의 모든 표를 엑셀(xlsx)로 추출. 표 하나당 시트 하나, 시트명은 섹션 제목 기반.
import fs from 'fs';
import XLSX from 'xlsx';

const html = fs.readFileSync('C:/Users/User/Documents/프로젝트/SOS_최종보고서.html', 'utf8');

const stripTags = s => s
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&times;/g, '×')
  .replace(/\s+/g, ' ')
  .trim();

// 본문(main) 안의 블록만 대상
const bodyMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/);
const body = bodyMatch ? bodyMatch[1] : html;

// h2 섹션 단위로 분리 (제목 + 그 다음 h2 전까지의 내용)
const sectionRe = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/g;
const wb = XLSX.utils.book_new();
const usedNames = new Set();

function sheetName(base) {
  let name = base.replace(/[\\/*?:\[\]]/g, ' ').trim().slice(0, 28) || 'Sheet';
  let final = name, i = 2;
  while (usedNames.has(final)) { final = `${name.slice(0,25)}_${i++}`; }
  usedNames.add(final);
  return final;
}

let sectionMatch;
let tableCount = 0;
while ((sectionMatch = sectionRe.exec(body)) !== null) {
  const h2title = stripTags(sectionMatch[1]);
  const sectionBody = sectionMatch[2];

  // 섹션 내 h3 제목들을 위치 기준으로 수집 (표 앞에 어떤 h3가 있었는지 매칭용)
  const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>/g;
  const h3Marks = [];
  let h3m;
  while ((h3m = h3Re.exec(sectionBody)) !== null) {
    h3Marks.push({ idx: h3m.index, title: stripTags(h3m[1]) });
  }
  function h3Before(idx) {
    let cur = null;
    for (const m of h3Marks) { if (m.idx < idx) cur = m.title; else break; }
    return cur;
  }

  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/g;
  let tm;
  while ((tm = tableRe.exec(sectionBody)) !== null) {
    const tableHtml = tm[1];
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const rows = [];
    let rm;
    while ((rm = rowRe.exec(tableHtml)) !== null) {
      const rowHtml = rm[1];
      const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g;
      const cells = [];
      let cm;
      while ((cm = cellRe.exec(rowHtml)) !== null) {
        cells.push(stripTags(cm[1]));
      }
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) continue;
    tableCount++;
    const h3 = h3Before(tm.index);
    const label = h3 ? `${h2title} ${h3}` : h2title;
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName(label));
  }
}

XLSX.writeFile(wb, 'C:/Users/User/Documents/프로젝트/SOS_최종보고서_전체표.xlsx');
console.log(`완료: ${tableCount}개 표 → SOS_최종보고서_전체표.xlsx (${wb.SheetNames.length}개 시트)`);
console.log(wb.SheetNames.join(' | '));
