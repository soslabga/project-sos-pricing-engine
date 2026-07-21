import "./globals.css";
import "./policy.css";
import "./booking-v2.css";
import "./guide.css";
import "./codes.css";
import "./my-bookings.css";

export const metadata = {
  title: "Project SOS | 판교 무인 업무공간",
  description: "필요한 시간만큼, 온전히 집중하는 판교 업무공간",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}




