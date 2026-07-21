import Link from "next/link";

export default function PolicyLayout({ eyebrow, title, effective = "2026년 7월 21일", children }) {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link className="brand" href="/"><span className="brand-mark">S</span><span>PROJECT <b>SOS</b></span></Link>
        <Link href="/">예약 화면으로 돌아가기 →</Link>
      </header>
      <article className="policy-document">
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="policy-effective">시행일 {effective}</p>
        {children}
      </article>
    </main>
  );
}
