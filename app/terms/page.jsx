import PolicyLayout from "../../components/PolicyLayout";

export const metadata = { title: "이용약관 | Project SOS" };

export default function TermsPage() {
  return (
    <PolicyLayout eyebrow="TERMS OF SERVICE" title="Project SOS 이용약관">
      <section><h2>1. 서비스</h2><p>Project SOS는 판교점 1인실과 멀티룸을 날짜·시간 단위로 예약하고 비대면 출입코드를 받아 이용하는 업무공간 서비스입니다.</p></section>
      <section><h2>2. 예약 성립</h2><p>고객이 공간, 이용일시, 예약자 정보를 입력하고 결제를 마친 뒤 예약 완료 화면과 안내 문자를 받으면 예약이 성립합니다. 같은 공간과 시간이 겹치면 먼저 완료된 예약이 우선합니다.</p></section>
      <section><h2>3. 이용자 의무</h2><ul><li>출입코드를 다른 사람에게 양도하거나 공개하지 않습니다.</li><li>예약 인원과 이용시간을 지키고 퇴실할 때 출입문을 닫습니다.</li><li>스피커폰 대신 이어폰을 사용하고 음료 외 음식물을 반입하지 않습니다.</li><li>주차등록은 1일 2시간까지 가능하며 라운지 태블릿에서 직접 등록합니다.</li><li>흡연, 숙박, 위험물 반입, 불법행위, 다른 이용자의 업무를 방해하는 행위를 금지합니다.</li></ul></section>
      <section><h2>4. 이용 제한과 손해</h2><p>운영자는 안전과 시설 보호를 위해 이용수칙 위반자의 이용을 중단할 수 있습니다. 고의 또는 과실로 시설·비품을 훼손하거나 다른 이용자에게 손해를 입힌 경우 실제 발생한 손해를 부담합니다.</p></section>
      <section><h2>5. 취소와 환불</h2><p>예약 취소와 환불은 별도 게시한 취소·환불 기준을 따릅니다. 운영자 사정으로 공간을 제공하지 못하면 결제금액 전액을 환불합니다.</p></section>
      <section><h2>6. 서비스 변경</h2><p>시설 점검, 안전사고, 통신·도어락 장애 등으로 운영이 어려운 경우 이용자에게 알리고 대체 공간 제공, 일정 변경 또는 환불 중 가능한 방법으로 처리합니다.</p></section>
      <section><h2>7. 분쟁 처리</h2><p>고객센터 접수 내용을 기준으로 사실관계를 확인하고 상호 협의합니다. 해결되지 않은 분쟁은 관계 법령과 소비자분쟁해결기준에 따릅니다.</p></section>
    </PolicyLayout>
  );
}

