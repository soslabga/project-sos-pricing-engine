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
  x: 0.3, y: 0.15, w: 12.7, h: 0.5, fontSize: 20, bold: true, fontFace: FONT, color: '1F2937'
});

const colW = 6.35, tableY = 0.75, tableH = 6.5;

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

await pptx.writeFile({ fileName: 'C:/Users/User/Documents/프로젝트/프로젝트_SOS_주간보고.pptx' });
console.log('저장 완료: 프로젝트_SOS_주간보고.pptx');
