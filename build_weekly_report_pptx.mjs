// 주간보고 PPT 생성 — 폴더 내 "타부서 주간보고" 샘플 양식(진행사항|예정사항 2단 표) 그대로 따름
import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';

const slide = pptx.addSlide();

const HEADER_FILL = 'D9E2F3';
const FONT = 'Malgun Gothic';

// 제목
slide.addText('프로젝트 SOS 주간보고', {
  x: 0.3, y: 0.1, w: 12.7, h: 0.4, fontSize: 20, bold: true, fontFace: FONT, color: '1F2937'
});

// 이번 주 산출물 하이라이트(작업량 요약)
const stats = [
  ['5종', '문서 산출물\n(HTML·Excel·Word·PPT×2)'],
  ['20개', '보고서 표·계산식\n전면 재검증'],
  ['4개', '모델 전체 재계산\n(100·120·150평·판교)'],
  ['3건', '실측 견적서 확보\n(전기·냉난방·소방)'],
];
const statW = 3.1, statGap = 0.1;
stats.forEach((st, i) => {
  const x = 0.3 + i * (statW + statGap);
  slide.addShape('roundRect', { x, y: 0.55, w: statW, h: 0.85, fill:{color:'1F4F99'}, line:{type:'none'}, rectRadius:0.06 });
  slide.addText(st[0], { x, y:0.58, w: statW, h:0.4, fontSize:18, bold:true, color:'FFFFFF', align:'center', fontFace:FONT });
  slide.addText(st[1], { x, y:0.95, w: statW, h:0.42, fontSize:8.5, color:'D9E2F3', align:'center', fontFace:FONT });
});

const colW = 6.35, tableY = 1.55, tableH = 5.7;

// 헤더 행
slide.addTable(
  [[
    { text: '진행사항(6/28~7/4)', options: { fill: { color: HEADER_FILL }, bold: true, align: 'center', fontSize: 15, fontFace: FONT, color: '1F2937' } },
    { text: '예정사항(7/5~7/11)', options: { fill: { color: HEADER_FILL }, bold: true, align: 'center', fontSize: 15, fontFace: FONT, color: '1F2937' } },
  ]],
  { x: 0.3, y: tableY, w: 12.7, h: 0.5, colW: [colW, colW], border: { type: 'solid', color: 'BFBFBF', pt: 0.75 } }
);

const bullet = (text, sub=false) => ({
  text,
  options: { bullet: sub ? { code: '25B8' } : { code: '25CF' }, indentLevel: sub ? 1 : 0, fontSize: sub ? 10.5 : 11.5, bold: !sub, fontFace: FONT, color: '1F2937', breakLine: true, paraSpaceAfter: 3 }
});

const progress = [
  bullet('회원보증금 신규 도입 (SP 실계약 5건 검증)'),
  bullet('부가세포함 표준요금×2개월 공식을 SP 실계약서 5건 대조로 검증', true),
  bullet('SOS 단기계약 특성 반영: 1주=0 / 1~5개월=1개월치 / 6~11개월=1.5개월치 / 1년이상=2개월치', true),
  bullet('초기투자금 조달과는 무관함을 명확화(반환의무 부채로 재정의, 보고서 표현 오류 수정)', true),

  bullet('CAPEX 단가 실측 재검증 및 전체 재계산'),
  bullet('전기·통신 7만→4만/평 (네트워크공사·전기 견적서 근거 확인)', true),
  bullet('보안·CCTV·출입통제 200만→86만 (ADT캡스 실견적서 확인)', true),
  bullet('라운지가구 100만→150만 상향(면적 대비 현실화)', true),
  bullet('4개 모델(100평형·120평·150평·판교) BEP·손익·투자금 전체 재계산', true),

  bullet('보고서 투명성·가독성 개선'),
  bullet('월별 손익 흐름(현금흐름 워터폴) 표 신설, 전 항목 계산식 노출', true),
  bullet('가구배치도 책상 규격 1200×700mm 실측 반영', true),
  bullet('저근거 섹션(전용평당 손익) 삭제 및 섹션 재정비', true),

  bullet('1~4인실 수요 근거 리서치'),
  bullet('통계청 사업체 규모 분포, 스타트업 팀 규모 등 정황 데이터 확보', true),
  bullet('SP 분당2호점 실제 제안서 확인 — 경쟁사 1~4인실 공급 부재 확인(추가 검증 필요)', true),

  bullet('산출물 다각화'),
  bullet('전체 보고서 표 Excel 워크북 추출(20개 시트)', true),
  bullet('워드 사업계획서 작성 — 실투자금 2억 현금흐름 기준 회수기간(3.7년) 중심 설득 논리', true),
];

const plan = [
  bullet('1~4인실 수요 데이터 보강'),
  bullet('SP·FF 추가 지점 도면·제안서 확보하여 룸타입별 분포 비교', true),

  bullet('CAPEX 미검증 항목 정식 견적 전환'),
  bullet('도어락·가구·라운지가구 등 가견적 항목 실측 견적 확보', true),

  bullet('후보 매물 실사'),
  bullet('근생 용도·전대 허용·권리금 여부 확인', true),
  bullet('소방·공조 가견적 확보(스프링클러 설치대상 여부 포함)', true),

  bullet('문서 마감'),
  bullet('워드 사업계획서 최종 검토', true),
  bullet('부사장 보고용 발표 PPT 요약본 제작', true),
];

slide.addTable(
  [[
    { text: progress, options: { valign: 'top', fill: { color: 'FFFFFF' } } },
    { text: plan, options: { valign: 'top', fill: { color: 'FFFFFF' } } },
  ]],
  { x: 0.3, y: tableY + 0.5, w: 12.7, h: tableH - 0.5, colW: [colW, colW], border: { type: 'solid', color: 'BFBFBF', pt: 0.75 }, margin: [10,10,10,10] }
);

// ── 슬라이드 2: 연간 로드맵(러프, 참고용) ──────────────────────────────
{
  const s2 = pptx.addSlide();
  const NAVY = '0F1E3D', BLUE = '1F4F99', LIGHT='EEF3FB';

  s2.addText('연간 로드맵(2026년) — SOS 코워킹 신규 출점', { x:0.3, y:0.15, w:12.7, h:0.5, fontSize:20, bold:true, fontFace:FONT, color:NAVY });
  s2.addText('러프 스케치 — 확정 일정 아님, 매물 실사 결과에 따라 변동 가능', { x:0.3, y:0.62, w:12.7, h:0.35, fontSize:11, italic:true, fontFace:FONT, color:'667085' });

  // 분기 헤더
  const qX = [1.9, 5.5, 9.1, 12.0], qW = [3.5, 3.5, 2.8, 1.33];
  const qLabel = ['Q3 (7~9월)', 'Q4 (10~12월)', "'27 Q1", ''];
  for (let i=0;i<3;i++) {
    s2.addText(qLabel[i], { x:qX[i], y:1.05, w:qW[i], h:0.4, fontSize:14, bold:true, align:'center', fontFace:FONT, color:NAVY });
  }
  s2.addShape('line', { x:0.3, y:1.5, w:12.7, h:0, line:{color:BLUE, width:1.5} });

  const rowLabelX = 0.3, rowLabelW = 1.5;
  const bar = (x, w, y, h, text, color, done=false) => {
    s2.addShape('roundRect', { x, y, w, h, fill:{color}, line:{type:'none'}, rectRadius:0.06 });
    s2.addText(text, { x, y, w, h, fontSize:11, bold:true, color:'FFFFFF', align:'center', valign:'middle', fontFace:FONT });
    if (done) {
      s2.addText('완료', { x:x+w-0.55, y:y-0.28, w:0.7, h:0.35, fontSize:9, bold:true, color:'16834A', align:'center',
        fill:{color:'D7F2E1'}, line:{color:'16834A',width:0.75}, rotate:-8, fontFace:FONT });
    }
  };

  let y = 1.7;
  const rowH = 0.6, rowGap = 0.95;

  s2.addText('사업성 검증・투자승인', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(1.9, 1.6, y, rowH, '모델링·CAPEX검증(7월)', '1F4F99', true);
  bar(3.6, 1.7, y, rowH, '부사장 투자승인(7월말)', '3B6FC4');
  y += rowGap;

  s2.addText('매물 확보・계약', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(3.4, 1.9, y, rowH, '실사·정식견적(8월)', '2E5FA8');
  bar(5.4, 1.6, y, rowH, '임대차 계약(9월)', '3B6FC4');
  y += rowGap;

  s2.addText('인테리어・시스템 구축', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(5.5, 2.2, y, rowH, '인테리어 시공(10~11월)', '2E5FA8');
  bar(7.8, 1.6, y, rowH, '가구·무인시스템(11월)', '3B6FC4');
  y += rowGap;

  s2.addText('오픈 준비・오픈', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(9.5, 1.6, y, rowH, '마케팅·회원모집(12월)', '2E5FA8');
  bar(11.2, 1.2, y, rowH, '오픈(목표)', 'B45309');
  y += rowGap;

  s2.addText('가동률 안정화', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(11.2, 1.8, y, rowH, "50→65%+ 가동('27 Q1)", '667085');

  // 분기 구분선
  s2.addShape('line', { x:5.5, y:1.55, w:0, h:4.6, line:{color:'D9E1EC', width:1, dashType:'dash'} });
  s2.addShape('line', { x:9.1, y:1.55, w:0, h:4.6, line:{color:'D9E1EC', width:1, dashType:'dash'} });

  s2.addText('※ 12월 오픈은 상반기 매물 확정·계약이 예정대로 진행될 때의 목표치. 매물 실사 결과에 따라 1~2개월 지연 가능.',
    { x:0.3, y:6.5, w:12.7, h:0.5, fontSize:11, italic:true, color:'B42318', fontFace:FONT });
}

await pptx.writeFile({ fileName: 'C:/Users/User/Documents/프로젝트/프로젝트_SOS_주간보고.pptx' });
console.log('저장 완료: 프로젝트_SOS_주간보고.pptx');
