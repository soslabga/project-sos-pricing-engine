import PolicyLayout from "../../components/PolicyLayout";

export const metadata = { title: "취소·환불 기준 | Project SOS" };

export default function RefundPage() {
  return (
    <PolicyLayout eyebrow="CANCELLATION & REFUND" title="취소·환불 기준">
      <section><h2>결제 후 2시간 안에는 전액 환불</h2><p>이용 시작 전이라면 결제 후 2시간 안에 취소할 경우 100% 환불합니다. 당일 예약은 이용 시작 전까지만 적용됩니다.</p></section>
      <section><h2>이용 시작일까지 남은 기간</h2><div className="refund-grid"><div><b>8일 전까지</b><strong>100%</strong></div><div><b>7~4일 전</b><strong>80%</strong></div><div><b>3~2일 전</b><strong>50%</strong></div><div><b>1일 전</b><strong>30%</strong></div><div><b>당일·미이용</b><strong>0%</strong></div></div></section>
      <section><h2>주·월 예약</h2><p>이용 시작 전에는 위 기준을 적용합니다. 이용 시작 후 고객 사정으로 중도 퇴실하는 경우 이미 이용한 기간의 정상 단가와 취소 수수료를 공제한 잔액을 환불합니다.</p></section>
      <section><h2>전액 환불되는 경우</h2><ul><li>Project SOS의 시설 문제로 예약한 공간을 제공하지 못한 경우</li><li>운영자가 예약을 취소한 경우</li><li>재난·행정명령 등 당사자가 통제할 수 없는 사유로 이용할 수 없는 경우</li></ul></section>
      <section><h2>환불 처리</h2><p>취소 접수 후 원결제 수단으로 환불합니다. 카드사와 결제기관 처리기간에 따라 실제 입금일까지 영업일 기준 시간이 걸릴 수 있습니다.</p></section>
    </PolicyLayout>
  );
}
