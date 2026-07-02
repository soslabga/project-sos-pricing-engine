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
  ['3곳', '경쟁사 현장 방문·상담\n(분당SP·판교FF·여의도SP)'],
  ['5종', '문서 산출물\n(HTML·Excel·Word·PPT×2)'],
  ['20개', '보고서 표·계산식\n전면 재검증'],
  ['4개', '모델 전체 재계산\n(100·120·150평·판교)'],
  ['3건', '실측 견적서 확보\n(전기·냉난방·소방)'],
];
const statW = 2.46, statGap = 0.1;
stats.forEach((st, i) => {
  const x = 0.3 + i * (statW + statGap);
  slide.addShape('roundRect', { x, y: 0.55, w: statW, h: 0.85, fill:{color:'1F4F99'}, line:{type:'none'}, rectRadius:0.06 });
  slide.addText(st[0], { x, y:0.58, w: statW, h:0.4, fontSize:17, bold:true, color:'FFFFFF', align:'center', fontFace:FONT });
  slide.addText(st[1], { x, y:0.95, w: statW, h:0.42, fontSize:8, color:'D9E2F3', align:'center', fontFace:FONT });
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
  bullet('SOS 수익성 모델 전체 설계·구축'),
  bullet('배치도(룸 배치·문·복도) 기준으로 좌석·룸수·매출이 자동 산출되는 계산 엔진 구축(4개 모델)', true),
  bullet('가격정책을 "BEP 65% 역산가 + 경쟁사 상한 체크" 방식으로 확정', true),

  bullet('경쟁사 현장 상담·방문 및 실자료 확보'),
  bullet('분당 스파크플러스, 판교 패스트파이브 상담 및 견적 확인', true),
  bullet('여의도 스파크플러스 현장 방문 및 수치·견적 확인', true),
  bullet('확보한 실계약서·입주제안서로 실거래가·크레딧 조건 대조 검증(분당2호점·여의도 등)', true),
  bullet('회원보증금 산정식도 SP 실계약 5건 대조로 검증 후 신규 반영', true),

  bullet('후보 매물 실측 확정'),
  bullet('판교(에이치스퀘어 S동 B1)·분당 100/120/150평 매물 임대조건(월세·보증금) 실측 확정', true),

  bullet('CAPEX 항목 실제 견적서 기반 검증'),
  bullet('소방·냉난방·인테리어·도어락·보안 등 실제 견적서/계약서로 단가 검증', true),
  bullet('금주 후반: 전기통신 7→4만/평, 보안 200→86만 추가 실측 보정 및 4개 모델 전체 재계산', true),

  bullet('배치도·가구배치 반복 설계'),
  bullet('문 위치·책상 배치·비정형 손실 구간 등 실측 렌더링 검증 반복(책상 1200×700mm 최종 반영)', true),

  bullet('보고서 통합 및 산출물 확장'),
  bullet('개별 보고서를 SOS_최종보고서.html 하나로 통합, 현금흐름 워터폴 표 등 투명성 개선', true),
  bullet('Excel(표 20개 시트)·워드 사업계획서·투자설득 PPT·주간보고 PPT까지 산출물 다각화(금주 후반)', true),
];

const plan = [
  bullet('1~4인실 수요 데이터 보강'),
  bullet('SP·FF 추가 지점 도면·제안서 확보하여 룸타입별 분포 비교', true),

  bullet('CAPEX 미검증 항목 정식 견적 전환'),
  bullet('도어락·가구·라운지가구 등 가견적 항목 실측 견적 확보', true),
  bullet('※ 매물 실사(근생 용도·전대·소방)는 내부 투자승인 이후 착수 예정', true),

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
  bar(1.9, 0.9, y, rowH, '모델링·검증', '1F4F99', true);
  bar(2.8, 1.1, y, rowH, '내부 투자승인(7월 중순)', '3B6FC4');
  y += rowGap;

  s2.addText('마케팅 계획・실무 논의', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(3.9, 2.4, y, rowH, '마케팅 계획 구체화·실무 협의(7월말~8월)', '5B7FBF');
  y += rowGap;

  s2.addText('매물 확보・계약', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(3.9, 1.3, y, rowH, '실사·정식견적(7월말~8월)', '2E5FA8');
  bar(5.2, 1.1, y, rowH, '임대차 계약(8월말)', '3B6FC4');
  y += rowGap;

  s2.addText('인테리어・시스템 구축', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(6.3, 1.6, y, rowH, '인테리어 시공(9~10월)', '2E5FA8');
  bar(7.9, 1.1, y, rowH, '가구·무인시스템(10월)', '3B6FC4');
  y += rowGap;

  s2.addText('오픈 준비・오픈', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(9.0, 1.3, y, rowH, '마케팅·회원모집(11월)', '2E5FA8');
  bar(10.3, 1.1, y, rowH, '오픈(목표, 11월말)', 'B45309');
  y += rowGap;

  s2.addText('가동률 안정화', { x:rowLabelX, y, w:rowLabelW, h:rowH, fontSize:11.5, bold:true, valign:'middle', fontFace:FONT, color:NAVY });
  bar(11.4, 1.6, y, rowH, "50→65%+ 가동('27 Q1)", '667085');

  // 분기 구분선
  s2.addShape('line', { x:5.5, y:1.55, w:0, h:5.55, line:{color:'D9E1EC', width:1, dashType:'dash'} });
  s2.addShape('line', { x:9.1, y:1.55, w:0, h:5.55, line:{color:'D9E1EC', width:1, dashType:'dash'} });
}

await pptx.writeFile({ fileName: 'C:/Users/User/Documents/프로젝트/프로젝트_SOS_주간보고.pptx' });
console.log('저장 완료: 프로젝트_SOS_주간보고.pptx');
