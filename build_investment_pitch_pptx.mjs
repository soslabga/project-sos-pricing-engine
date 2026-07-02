// 프로젝트 SOS 투자 설득 PPT — 실투자금 2억 승인 요청용 핵심 요약 덱
import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';

const FONT = 'Malgun Gothic';
const NAVY = '1F2937', BLUE = '1F4F99', GREEN = '16834A', RED = 'B42318', LIGHT = 'EEF3FB', GRAY = '667085';

function titleSlide(title, sub) {
  const s = pptx.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x:0, y:0, w:13.33, h:1.3, fill:{color:BLUE} });
  s.addText(title, { x:0.5, y:0.25, w:12.3, h:0.8, fontSize:26, bold:true, color:'FFFFFF', fontFace:FONT });
  if (sub) s.addText(sub, { x:0.5, y:1.5, w:12.3, h:0.5, fontSize:14, color:GRAY, fontFace:FONT });
  return s;
}

// ── 슬라이드 1: 표지 ──────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: BLUE };
  s.addText('프로젝트 SOS', { x:0.8, y:2.3, w:11.7, h:1.0, fontSize:40, bold:true, color:'FFFFFF', fontFace:FONT });
  s.addText('1~4인 소형 프로젝트룸 공유오피스 — 신규 투자 승인 요청', { x:0.8, y:3.25, w:11.7, h:0.6, fontSize:18, color:'D9E2F3', fontFace:FONT });
  s.addText('실투자금 2.02억원 · 현금흐름 기준 회수기간 3.7년(70% 가동 기준)', { x:0.8, y:4.0, w:11.7, h:0.5, fontSize:16, bold:true, color:'FFFFFF', fontFace:FONT });
  s.addText('2026-07-02', { x:0.8, y:6.8, w:5, h:0.4, fontSize:12, color:'AEC2E8', fontFace:FONT });
}

// ── 슬라이드 2: 핵심 요약 ──────────────────────────────
{
  const s = titleSlide('핵심 요약', '패스트파이브·스파크플러스가 진입하지 않는 100~150평 소형 매물 시장');
  const items = [
    ['필요 면적', '경쟁사 250~300평급 대비 1/3 이하(100~150평)로 진입'],
    ['실투자금', '2.02억원 (임차보증금 0.75억은 회수 가능 자산, 별도)'],
    ['현금 회수기간', '3.7년 (가동률 70% 기준, 현금흐름 기준)'],
    ['손익분기(BEP)', '64.8% — 업계 평균 가동률(85%+) 대비 20%p 여유'],
    ['다운사이드', '가동률 50%까지 하락해도 월 현금손실 -3만원 수준(사실상 손익분기)'],
  ];
  let y = 1.9;
  for (const [k,v] of items) {
    s.addShape('rect', { x:0.6, y, w:12.1, h:0.85, fill:{color:LIGHT}, line:{color:'D9E1EC',width:0.75} });
    s.addText(k, { x:0.9, y, w:3.0, h:0.85, fontSize:15, bold:true, color:BLUE, fontFace:FONT, valign:'middle' });
    s.addText(v, { x:4.0, y, w:8.5, h:0.85, fontSize:14, color:NAVY, fontFace:FONT, valign:'middle' });
    y += 1.0;
  }
}

// ── 슬라이드 3: 1~4인실 수요 근거 ──────────────────────────────
{
  const s = titleSlide('1~4인실 수요 근거', '정황 증거 조합 — 직접 소진율 데이터는 아니며 추가 검증 필요');
  const rows = [
    [{text:'근거',options:{bold:true,fill:{color:LIGHT}}}, {text:'내용',options:{bold:true,fill:{color:LIGHT}}}],
    ['사업체 규모 분포\n(통계청 전국사업체조사)', '전체 635만개 사업체 중 5인 미만이 압도적 다수, 2024년 한 해 15만2천개 증가·나홀로사장 증가세'],
    ['스타트업 팀 규모', '초기 팀 규모는 평균 4~8명 수준 — SOS 타깃(1~4인)과 인접'],
    ['경쟁사 공급 현황\n(SP 분당2호점 실제 제안서)', '개별 1인실 없음(공용 좌석 4석뿐), 제안 호실도 5·6·8인실만 — 경쟁사가 1~4인실을 거의 짓지 않는 시장 공백 확인'],
    ['수요 정황(온라인 후기)', '1인실은 매물 자체가 희소해 대기 후 계약하는 사례 다수 확인'],
  ];
  s.addTable(rows, { x:0.6, y:1.9, w:12.1, h:4.3, fontSize:13, fontFace:FONT, border:{type:'solid',color:'BFBFBF',pt:0.75}, autoPage:false,
    colW:[3.6,8.5] });
  s.addText('한계: 경쟁사가 1~4인실을 안 짓는 이유가 "공백 기회"인지 "수요 부족 검증 결과"인지는 이 자료만으로 판단 불가 — 다음 단계로 추가 지점 도면 확보 예정.',
    { x:0.6, y:6.35, w:12.1, h:0.6, fontSize:12, italic:true, color:RED, fontFace:FONT });
}

// ── 슬라이드 4: 실투자금 구성 ──────────────────────────────
{
  const s = titleSlide('실투자금 정확한 구성', '"2억 투자"는 초기투자금(CAPEX)만을 가리킵니다');
  const rows = [
    [{text:'구분',options:{bold:true,fill:{color:LIGHT},align:'center'}}, {text:'금액',options:{bold:true,fill:{color:LIGHT},align:'center'}}, {text:'성격',options:{bold:true,fill:{color:LIGHT},align:'center'}}],
    ['초기투자금(CAPEX)', '2.02억원', '회수 불가능한 실투자금 — 이번 승인 요청 대상'],
    ['임차보증금', '0.75억원', '계약 종료 시 100% 환급되는 자산성 지출'],
    ['운전자금', '0.05억원', '초기 예비 현금'],
    ['총 소요자금(참고)', '2.85억원', '자금 조달 계획 수립 시 참고용'],
  ];
  s.addTable(rows, { x:0.8, y:2.0, w:11.7, h:3.0, fontSize:14, fontFace:FONT, border:{type:'solid',color:'BFBFBF',pt:0.75}, autoPage:false,
    colW:[3.5,2.7,5.5] });
  s.addText('※ 임차보증금은 투자 리스크가 아닌 자산성 지출이므로 실투자금 판단 시 분리해서 봐야 합니다.', { x:0.8, y:5.3, w:11.7, h:0.5, fontSize:12, italic:true, color:GRAY, fontFace:FONT });
}

// ── 슬라이드 4: 현금흐름 기준 회수기간 ──────────────────────────────
{
  const s = titleSlide('현금흐름 기준 회수 기간', '감가상각은 비현금 비용 — 영업이익이 아닌 실제 현금흐름으로 계산');
  const rows = [
    [{text:'가동률',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'월 영업이익(회계)',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'월 현금흐름(실제)',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'현금 회수기간',options:{bold:true,fill:{color:LIGHT},align:'center'}}],
    ['50%(최악 가정)', '-341만', '-3만', '회수 불가(적자 지속)'],
    ['60%', '-110만', '+228만', '88.8개월(7.4년)'],
    ['65%(BEP 부근)', '+5만', '+343만', '59.0개월(4.9년)'],
    [{text:'70%(기준 시나리오)',options:{bold:true}}, {text:'+121만',options:{bold:true}}, {text:'+459만',options:{bold:true,color:GREEN}}, {text:'44.1개월(3.7년)',options:{bold:true,color:GREEN}}],
    ['75%', '+236만', '+574만', '35.3개월(2.9년)'],
  ];
  s.addTable(rows, { x:0.6, y:1.9, w:12.1, h:3.3, fontSize:13.5, fontFace:FONT, border:{type:'solid',color:'BFBFBF',pt:0.75}, autoPage:false,
    colW:[3.2,3.0,3.0,2.9] });
  s.addText('가동률 70%만 넘으면 3년대에 실투자금을 현금으로 회수합니다. 국내 주요 공유오피스 안정화 이후 평균 가동률(85%+) 대비 70%는 보수적인 기준선입니다.',
    { x:0.6, y:5.5, w:12.1, h:0.7, fontSize:13, bold:true, color:BLUE, fontFace:FONT });
}

// ── 슬라이드 5: 다운사이드 방어 ──────────────────────────────
{
  const s = titleSlide('다운사이드 방어', '최악의 경우에도 손실 규모가 제한적인 이유');
  const points = [
    '가동률 50%까지 떨어져도 월 현금손실은 -3만원 수준 — 완전한 현금 소진 상황이 아님',
    '가동률 60%부터는 이미 현금흐름 흑자로 전환 — 손익분기(64.8%)보다 낮은 가동률에서도 현금은 마르지 않음',
    '회원보증금(계약기간별 회원 1인당 50만~290만원) 유입이 추가 유동성 버퍼로 작용',
    'CAPEX 항목 중 소방(9.05만/평)·냉난방(19.70만/평)·전기통신(4.00만/평)·보안(86만)은 실제 견적서 기반 — 예산 초과 리스크 최소화',
  ];
  let y = 2.1;
  for (const p of points) {
    s.addShape('rect', { x:0.7, y, w:0.15, h:0.15, fill:{color:BLUE}, line:{type:'none'} });
    s.addText(p, { x:1.0, y:y-0.15, w:11.6, h:0.85, fontSize:15, color:NAVY, fontFace:FONT, valign:'middle' });
    y += 1.05;
  }
}

// ── 슬라이드 6: 상방 시나리오 (판교) ──────────────────────────────
{
  const s = titleSlide('상방 시나리오 — 판교 참고사례', '동일 CAPEX 수준(2.01억)에서 경쟁 강도가 낮은 상권 적용 시');
  const rows = [
    [{text:'가동률',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'월 영업이익',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'월 현금흐름',options:{bold:true,fill:{color:LIGHT},align:'center'}},{text:'현금 회수기간',options:{bold:true,fill:{color:LIGHT},align:'center'}}],
    ['50%', '+29만', '+364만', '55.2개월(4.6년)'],
    ['60%', '+374만', '+709만', '28.3개월(2.4년)'],
    [{text:'70%(기준)',options:{bold:true}}, {text:'+720만',options:{bold:true,color:GREEN}}, {text:'+1,055만',options:{bold:true,color:GREEN}}, {text:'19.0개월(1.6년)',options:{bold:true,color:GREEN}}],
    ['75%', '+892만', '+1,227만', '16.4개월(1.4년)'],
  ];
  s.addTable(rows, { x:0.6, y:1.9, w:12.1, h:2.8, fontSize:14, fontFace:FONT, border:{type:'solid',color:'BFBFBF',pt:0.75}, autoPage:false,
    colW:[3.2,3.0,3.0,2.9] });
  s.addText('판교형 상권(규제로 경쟁사 진입장벽이 있는 지역)을 추가 확보할수록 포트폴리오 전체의 평균 회수기간이 단축됩니다.',
    { x:0.6, y:5.1, w:12.1, h:0.6, fontSize:13, color:GRAY, italic:true, fontFace:FONT });
}

// ── 슬라이드 7: 리스크 및 대응 ──────────────────────────────
{
  const s = titleSlide('리스크 및 대응');
  const rows = [
    [{text:'리스크',options:{bold:true,fill:{color:LIGHT}}}, {text:'대응',options:{bold:true,fill:{color:LIGHT}}}],
    ['용도·전대 이슈', '근생 용도 매물로 소싱, 회원은 전대 아닌 시설이용계약으로 해소'],
    ['CAPEX 예산 초과', '소방·냉난방·전기통신·보안은 실측 완료, 도어락·가구는 계약 전 정식 견적 확보 예정'],
    ['1~4인실 수요 불확실성', '정황 증거(사업체 규모 분포·SP 매물 부재) 확보, 추가 지점 도면으로 검증 진행 중'],
    ['건물 소방 등급', '스프링클러 설치대상 여부 등 계약 전 소방·공조 가견적 필수 확인'],
  ];
  s.addTable(rows, { x:0.6, y:1.9, w:12.1, h:4.2, fontSize:14, fontFace:FONT, border:{type:'solid',color:'BFBFBF',pt:0.75}, autoPage:false,
    colW:[3.8,8.3] });
}

// ── 슬라이드 8: 결론/요청 ──────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: BLUE };
  s.addText('요청 사항', { x:0.8, y:1.0, w:11.7, h:0.7, fontSize:24, bold:true, color:'FFFFFF', fontFace:FONT });
  s.addText('실투자금 2.02억원 승인', { x:0.8, y:2.0, w:11.7, h:0.8, fontSize:32, bold:true, color:'FFFFFF', fontFace:FONT });
  const lines = [
    '가동률 70% 기준 현금 회수기간 3.7년',
    '가동률 60%부터 현금흐름 흑자 — 하방 리스크 제한적',
    '판교형 상권 확장 시 회수기간 1.6년까지 단축 가능(업사이드)',
  ];
  let y = 3.2;
  for (const l of lines) {
    s.addText('•  ' + l, { x:0.8, y, w:11.7, h:0.55, fontSize:16, color:'D9E2F3', fontFace:FONT });
    y += 0.6;
  }
}

await pptx.writeFile({ fileName: 'C:/Users/User/Documents/프로젝트/프로젝트_SOS_투자설득.pptx' });
console.log('저장 완료: 프로젝트_SOS_투자설득.pptx');
