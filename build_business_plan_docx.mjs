// 프로젝트 SOS 사업계획서(워드) 생성 — 실투자금 2억 투자설득 중심 재구성
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType } from 'docx';

const H1 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const H2 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
const P  = (t, opt={}) => new Paragraph({ children: [new TextRun({ text: t, bold: !!opt.bold, color: opt.color, size: opt.size })], spacing: { after: 120 } });
const bullet = t => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 80 } });

const cellBorder = { top:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC"}, bottom:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC"},
  left:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC"}, right:{style:BorderStyle.SINGLE,size:2,color:"CCCCCC"} };

function tableFromRows(rows, opts={}) {
  const headerShade = { fill: "EEF3FB", type: ShadingType.CLEAR, color: "auto" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, ri) => new TableRow({
      children: r.map(c => new TableCell({
        borders: cellBorder,
        shading: ri === 0 ? headerShade : undefined,
        width: { size: Math.floor(100/r.length), type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: ri === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: String(c), bold: ri === 0, size: 18 })]
        })]
      }))
    }))
  });
}

const children = [];

// ── 표지 ──────────────────────────────────────────────
children.push(new Paragraph({ text: "프로젝트 SOS 사업계획서", heading: HeadingLevel.TITLE, spacing:{after:100} }));
children.push(new Paragraph({ children:[new TextRun({text:"1~4인 소형 프로젝트룸 특화 공유오피스 — 신규 투자 검토", italics:true, size:24})], spacing:{after:400} }));
children.push(P("작성일: 2026-07-02", { size:18 }));

// ── 1. Executive Summary ──────────────────────────────
children.push(H1("1. 요약(Executive Summary)"));
children.push(P("SOS는 패스트파이브·스파크플러스가 진입하지 않는 100~150평 소형 매물에서, 1~4인 소형팀 전용 프로젝트룸으로 승부하는 공유오피스 모델이다. 경쟁사는 최소 250~300평급 대형 지점이 필요하지만, SOS는 그 3분의 1 이하 면적으로 진입 가능하다.", {}));
children.push(new Paragraph({
  children:[new TextRun({text:"요청 투자금(실투자금·CAPEX): 약 2.02억원", bold:true, size:24, color:"1F4F99"})],
  spacing:{before:120, after:120}
}));
children.push(bullet("현금흐름 기준 회수기간: 3.7년(가동률 70% 기준) — 감가상각은 비현금 비용이므로 실제 회수는 회계상 손익보다 빠름"));
children.push(bullet("손익분기(BEP): 64.8% — 국내 공유오피스 평균 가동률(패스트파이브 등 85%+) 대비 20%p 이상 여유"));
children.push(bullet("다운사이드 방어: 가동률 60%까지 하락해도 현금흐름은 흑자(+228만/월) 유지, 실질 완전 손실 구간은 55% 미만으로 제한적"));
children.push(bullet("참고사례(판교): 동일 방식 적용 시 CAPEX 2.01억, BEP 49.2%, 70% 가동 시 현금흐름 회수 19개월(1.6년) — 규제로 경쟁 강도가 낮은 상권의 상방 잠재력을 보여주는 근거"));

// ── 2. 투자 설득 (핵심 신규 섹션) ──────────────────────────
children.push(H1("2. 투자 요청 및 회수 계획 — 왜 2억을 투자해야 하는가"));

children.push(H2("2-1. 실투자금 정확한 구성"));
children.push(P("\"2억 투자\"는 아래 CAPEX(초기투자금)만을 가리킨다. 임차보증금은 계약 종료 시 회수되는 자산이므로 손실 위험이 있는 \"실투자금\"과는 분리해서 봐야 한다."));
children.push(tableFromRows([
  ["구분","금액","성격"],
  ["초기투자금(CAPEX, 인테리어·설비·가구 등)","2.025억원","회수 불가능한 실투자금 — 이 문서의 투자 요청 대상"],
  ["임차보증금","0.75억원","계약 종료 시 100% 환급되는 자산성 지출 (투자 리스크 아님)"],
  ["운전자금","0.05억원","초기 예비 현금"],
  ["총 소요자금(조달 관점)","2.85억원","자금 조달 계획 수립 시 참고용 총액"],
]));

children.push(H2("2-2. 현금흐름 기준 회수 기간 — 회계상 손익이 아닌 실제 현금으로 계산"));
children.push(P("월상각(감가상각)은 실제로 통장에서 빠져나가는 돈이 아니다. 투자금 회수 여부를 판단할 때는 \"영업이익\"이 아니라 \"영업이익+월상각\"(=실제 월 현금흐름)을 기준으로 봐야 한다. 아래는 100평형 모델(전국표준) 기준이다."));
children.push(tableFromRows([
  ["가동률","월 영업이익(회계)","월 현금흐름(실제)","연 현금흐름","현금 회수기간"],
  ["50%(최악 가정)","-341만","-3만","-0.00억","회수 불가(적자 지속)"],
  ["60%","-110만","+228만","0.27억","88.8개월(7.4년)"],
  ["65%(BEP 부근)","+5만","+343만","0.41억","59.0개월(4.9년)"],
  ["70%(기준 시나리오)","+121만","+459만","0.55억","44.1개월(3.7년)"],
  ["75%","+236만","+574만","0.69억","35.3개월(2.9년)"],
]));
children.push(P("핵심: 가동률 70%만 넘으면 3년대에 실투자금을 현금으로 회수한다. 국내 주요 공유오피스(패스트파이브 등)의 안정화 이후 평균 가동률은 85% 이상으로 보고되므로, 70%는 보수적인 기준선이다.", {bold:true}));

children.push(H2("2-3. 다운사이드 시나리오 — 최악의 경우에도 손실 규모가 제한적인 이유"));
children.push(bullet("가동률이 50%까지 떨어져도 월 현금 손실은 -3만원 수준(거의 손익분기) — 완전한 현금 소진 상황이 아님"));
children.push(bullet("60%부터는 이미 현금흐름 흑자로 전환 — 손익분기(64.8%)보다 낮은 가동률에서도 현금은 마르지 않음"));
children.push(bullet("이는 회원보증금(계약기간별 회원 1인당 50만~290만원) 유입이 추가 유동성 버퍼로 작용하기 때문 — 4장 참고"));

children.push(H2("2-4. 상방 시나리오 — 판교(참고사례) 적용 시"));
children.push(P("동일한 CAPEX(2.01억) 수준에서 규제로 경쟁 강도가 낮은 판교 같은 상권에 적용하면 회수기간이 극적으로 단축된다:"));
children.push(tableFromRows([
  ["가동률","월 영업이익","월 현금흐름","현금 회수기간"],
  ["50%","+29만","+364만","55.2개월(4.6년)"],
  ["60%","+374만","+709만","28.3개월(2.4년)"],
  ["70%(기준)","+720만","+1,055만","19.0개월(1.6년)"],
  ["75%","+892만","+1,227만","16.4개월(1.4년)"],
]));
children.push(P("판교형 상권(경쟁사 진입장벽이 있는 지역)을 추가 확보할수록 포트폴리오 전체의 평균 회수기간이 단축되는 구조다.", {}));

// ── 3. 시장 및 경쟁 분석 ──────────────────────────
children.push(H1("3. 시장 및 경쟁 분석"));
children.push(H2("3-1. 경쟁사 대비 SOS 특장점"));
children.push(tableFromRows([
  ["항목","패스트파이브·스파크플러스","SOS"],
  ["필요 면적","최소 250~300평, 표준 350~500평급","100~150평으로 진입 가능"],
  ["공간 구성","라운지·공용부 비중 큼, 5인 이상 대형실도 있음","1·2·4인 소형 독립실 중심, 5인 이상 제외"],
  ["운영","상주 서비스·상담 인력 중심","1인 운영 + 무인결제 + 출입 자동화"],
  ["가격정책","브랜드 프리미엄·공용부 비용 포함","BEP 65% 역산 기준 실속형 가격"],
]));

children.push(H2("3-2. 1~4인실 수요 근거 (정황 증거 — 직접 소진율 데이터 아님)"));
children.push(bullet("국내 사업체 635만개 중 5인 미만 사업체가 압도적 다수, 2024년 한 해만 15만2천개 증가(통계청 전국사업체조사)"));
children.push(bullet("스타트업 초기 팀 규모는 평균 4~8명 수준"));
children.push(bullet("스파크플러스 분당2호점 실제 제안서 확인 결과: 개별 1인실이 없고 \"1인 비즈니스 데스크\" 공용좌석 4석뿐, 제안 호실도 5·6·8인실만 — 경쟁사가 1~4인실을 거의 짓지 않는다는 사실 자체가 확인됨(공백 시장 vs 검증된 수요 부족, 두 해석 모두 가능하므로 추가 검증 필요)"));
children.push(bullet("온라인 후기: 공유오피스 1인실은 매물 자체가 희소해 대기 후 계약하는 사례가 다수 확인됨(정량 데이터 아님)"));

// ── 4. 재무 계획 상세 ──────────────────────────
children.push(H1("4. 재무 계획 상세"));
children.push(H2("4-1. 모델별 손익 요약"));
children.push(tableFromRows([
  ["모델","호실/좌석","만실매출","초기투자금","BEP","70% 가동 월손익"],
  ["100평형","26실/72석","2,608만","20,250만","64.8%","+121만"],
  ["120평(주력)","32실/86석","2,769만","23,209만","64.8%","+128만"],
  ["150평","52실/106석","3,589만","28,987만","63.8%","+197만"],
  ["판교(참고)","26실/72석","3,904만","20,079만","49.2%","+720만"],
]));

children.push(H2("4-2. 초기투자금(CAPEX) 상세 — 100평형 기준"));
children.push(tableFromRows([
  ["투자 항목","단가","금액","근거"],
  ["인테리어·방음","130만/평","13,650만","가견적"],
  ["전기·통신","4만/평","420만","실측(네트워크공사 견적서 11,155,806원+전기전용 914,468원÷301.54평)"],
  ["냉난방 설비","20만/평","2,100만","실측(냉난방 견적서 59,393,000원÷301.54평)"],
  ["소방 설비","9만/평","945만","실측(소방 견적서 27,289,670원÷301.54평)"],
  ["도어락","7만/룸","182만","가견적"],
  ["보안·CCTV·출입통제","86만 정액","86만","실측(ADT캡스 견적서 861,110원)"],
  ["가구","23.65만/석","1,703만","가견적"],
  ["탕비·라운지가구 등","-","200만","가견적"],
  ["예비비 5%","-","964만",""],
  ["합계","-","20,250만",""],
]));

children.push(H2("4-3. 회원보증금 — 추가 유동성 버퍼(투자금 조달과 별개)"));
children.push(P("회원이 내는 보증금(계약기간별 1~2개월치)은 CAPEX 조달과는 무관하지만, 정상화 이후 미납·손해배상 담보 및 운전자금 버퍼로 작동한다. 100평형 기준 BEP 가동률에서 회사가 보유하는 잔액은 계약 구성에 따라 1,859만~3,718만원 수준."));

// ── 5. 리스크 및 대응 ──────────────────────────
children.push(H1("5. 리스크 및 대응"));
children.push(bullet("근생 용도 매물 소싱으로 용도·전대 이슈 해소(회원은 전대 아닌 시설이용계약)"));
children.push(bullet("계약 전 실사 필요: 근생 용도·전대 허용·권리금·소방/냉난방 증설·관리단 요구공사 → CAPEX 추가 요인 가능"));
children.push(bullet("전기·통신·보안 항목은 실측 견적 확보, 도어락·가구·라운지가구는 가견적 — 계약 전 정식 견적 필요"));
children.push(bullet("1~4인실 수요는 정황 증거 수준 — 출점 전 경쟁사 추가 지점 도면 확보 또는 사전 대기수요 조사 권장"));

// ── 저장 ──────────────────────────
const doc = new Document({ sections: [{ children }] });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync('C:/Users/User/Documents/프로젝트/프로젝트_SOS_사업계획서.docx', buf);
console.log('저장 완료: 프로젝트_SOS_사업계획서.docx');
