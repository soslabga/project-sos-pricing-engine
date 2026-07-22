import "./globals.css";
import "./policy.css";
import "./booking-v2.css";
import "./guide.css";
import "./codes.css";
import "./my-bookings.css";

export const metadata = {
  title: "Project SOS | 비대면 예약 업무공간",
  description: "필요한 시간만큼 이용하는 1인·소규모 업무공간",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}




