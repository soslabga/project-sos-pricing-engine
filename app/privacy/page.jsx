import PolicyLayout from "../../components/PolicyLayout";

export const metadata = { title: "개인정보처리방침 | Project SOS" };

export default function PrivacyPage() {
  return (
    <PolicyLayout eyebrow="PRIVACY POLICY" title="개인정보처리방침">
      <section><h2>1. 처리하는 정보와 목적</h2><div className="policy-table"><div><b>예약 및 이용계약</b><span>예약자 이름, 휴대폰 번호, 예약 공간·일시, 결제금액</span></div><div><b>출입·예약 조회</b><span>휴대폰 번호로 출입코드와 내 예약 조회용 6자리 인증번호 발송</span></div><div><b>고객 응대</b><span>문의·취소·환불·분쟁 처리 기록</span></div></div></section>
      <section><h2>2. 보유기간</h2><p>예약 서비스 제공이 끝나면 개인정보를 지체 없이 파기합니다. 다만 전자상거래법에 따라 계약 및 청약철회 기록과 대금결제·서비스 공급 기록은 5년, 소비자 불만·분쟁 처리 기록은 3년, 표시·광고 기록은 6개월 동안 분리 보관합니다.</p></section>
      <section><h2>3. 처리업무 위탁</h2><div className="policy-table"><div><b>SOLAPI</b><span>예약 안내와 출입코드 문자 발송 · 전송 처리에 필요한 기간</span></div><div><b>Render</b><span>웹사이트와 예약 서버 운영 · 서비스 계약 종료 시까지</span></div></div><p>수탁사가 목적 밖으로 개인정보를 사용하지 않도록 계약과 기술적 보호조치를 적용합니다.</p></section>
      <section><h2>4. 이용자의 권리</h2><p>예약자는 자신의 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 법령에 따라 보존해야 하는 거래기록은 해당 기간 동안 별도로 보관합니다.</p></section>
      <section><h2>5. 안전성 확보조치</h2><p>접근권한 제한, 전송구간 암호화, API 키의 서버 환경변수 보관, 예약 데이터 접근기록 관리, 5분 만료 인증번호, 오입력·재발송 제한과 30분 조회 세션을 적용합니다. 출입코드는 예약마다 다르게 발급하고 이용기간이 끝나면 출입 권한을 종료합니다.</p></section>
      <section><h2>6. 개인정보 보호책임자</h2><p>Project SOS 운영책임자 · 원격관제 고객센터</p></section>
    </PolicyLayout>
  );
}
