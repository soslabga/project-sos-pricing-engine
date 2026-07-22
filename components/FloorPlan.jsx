"use client";

import { useEffect, useMemo, useState } from "react";

const BOOTHS = [
  { number: 1, x: 166, y: 24 }, { number: 2, x: 245, y: 24 },
  { number: 3, x: 324, y: 24 }, { number: 4, x: 403, y: 24 },
  { number: 5, x: 482, y: 24 }, { number: 6, x: 166, y: 264 },
  { number: 7, x: 245, y: 264 }, { number: 8, x: 324, y: 264 },
  { number: 9, x: 403, y: 264 }, { number: 10, x: 482, y: 264 },
];

function boothNumber(room) {
  const numbers = room?.name?.match(/\d+/g);
  return numbers?.length ? Number(numbers.at(-1)) : Number(room?.id);
}

function PlanGraphic({ rooms, selectedRoomId, onSelect }) {
  const roomByNumber = useMemo(() => new Map(rooms.map((room) => [boothNumber(room), room])), [rooms]);
  const selectedNumber = boothNumber(rooms.find((room) => Number(room.id) === Number(selectedRoomId)));

  function choose(number) {
    const room = roomByNumber.get(number);
    if (room) onSelect(room.id);
  }

  return (
    <svg className="floor-plan-svg" viewBox="0 0 895 464" role="img" aria-labelledby="floor-plan-title floor-plan-desc">
      <title id="floor-plan-title">Project SOS 판교점 배치도</title>
      <desc id="floor-plan-desc">왼쪽에 출입구와 라운지, 중앙 복도 위쪽에 1번부터 5번 부스, 아래쪽에 6번부터 10번 부스, 오른쪽에 멀티룸 A와 B가 있습니다.</desc>
      <defs>
        <filter id="selected-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0967ff" floodOpacity=".26" />
        </filter>
        <linearGradient id="lounge-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8f8ef" /><stop offset="1" stopColor="#d9f2e4" />
        </linearGradient>
        <linearGradient id="hall-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#f7fafe" /><stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect x="22" y="14" width="803" height="436" rx="5" fill="#f9fbfe" stroke="#d7e2ed" strokeWidth="2" />
      <rect x="34" y="25" width="132" height="414" fill="url(#lounge-fill)" stroke="#53a66a" strokeWidth="3" />
      <path d="M34 224H166" stroke="#ffffff" strokeWidth="10" />
      <text x="100" y="190" textAnchor="middle" className="plan-zone-title"><tspan x="100">출입구</tspan><tspan x="100" dy="28">라운지</tspan></text>
      <text x="100" y="246" textAnchor="middle" className="plan-zone-note">커피머신 · 정수기</text>
      <path d="M14 232H72" className="entry-arrow" /><path d="M14 232l15-10v20z" fill="#0967ff" />
      <text x="12" y="212" className="plan-entry-label">입구</text>
      <rect x="166" y="25" width="395" height="170" fill="#e9f4ff" />
      <rect x="166" y="264" width="395" height="175" fill="#e9f4ff" />
      <rect x="561" y="25" width="253" height="170" fill="#fff3de" stroke="#e4a631" strokeWidth="3" />
      <rect x="561" y="264" width="253" height="175" fill="#fff0f4" stroke="#e45478" strokeWidth="3" />
      <rect x="166" y="195" width="648" height="69" fill="url(#hall-fill)" stroke="#b8c8d8" strokeWidth="2" />
      {[245, 324, 403, 482, 561].map((x) => <path key={`top-${x}`} d={`M${x} 25V195`} className="plan-wall" />)}
      {[245, 324, 403, 482, 561].map((x) => <path key={`bottom-${x}`} d={`M${x} 264V439`} className="plan-wall" />)}
      <path d="M166 25V439M814 25V439" className="plan-wall strong" />
      <text x="490" y="232" textAnchor="middle" className="hall-label">복도 · 모든 공간은 이곳에서 출입</text>
      <circle cx="193" cy="229" r="4" fill="#00cde6" /><circle cx="787" cy="229" r="4" fill="#00cde6" />
      {BOOTHS.map(({ number, x, y }) => {
        const isSelected = selectedNumber === number;
        const room = roomByNumber.get(number);
        return (
          <g key={number} className={`plan-booth ${isSelected ? "selected" : ""} ${room ? "available" : "disabled"}`}
            role="button" tabIndex={room ? 0 : -1}
            aria-label={`1인실 ${number}번 부스${isSelected ? ", 선택됨" : ", 선택하기"}`} aria-pressed={isSelected}
            onClick={() => choose(number)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose(number);
              }
            }}
            data-testid={`floor-booth-${number}`}>
            <rect x={x + 7} y={y + 10} width="65" height="144" rx="9" className="booth-hit" />
            <circle cx={x + 39.5} cy={y + 77} r="23" className="booth-number-bg" />
            <text x={x + 39.5} y={y + 85} textAnchor="middle" className="booth-number">{number}</text>
            {isSelected && <text x={x + 39.5} y={y + 127} textAnchor="middle" className="booth-selected-label">선택</text>}
          </g>
        );
      })}
      <text x="688" y="92" textAnchor="middle" className="multi-title">멀티룸 A</text>
      <text x="688" y="120" textAnchor="middle" className="multi-meta">최대 4인 · 시간 단위</text>
      <text x="688" y="333" textAnchor="middle" className="multi-title pink">멀티룸 B</text>
      <text x="688" y="361" textAnchor="middle" className="multi-meta">최대 6인 · 일 · 주 단위</text>
      <text x="839" y="236" textAnchor="middle" transform="rotate(90 839 236)" className="window-label">창가</text>
    </svg>
  );
}

export default function FloorPlan({ rooms, selectedRoomId, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const selected = rooms.find((room) => Number(room.id) === Number(selectedRoomId));
  const number = boothNumber(selected);
  const location = !Number.isFinite(number) ? "부스 정보를 불러오는 중" : number <= 5 ? `복도 위쪽 · 출입구에서 ${number}번째` : `복도 아래쪽 · 출입구에서 ${number - 5}번째`;

  useEffect(() => {
    if (!expanded) return undefined;
    const close = (event) => event.key === "Escape" && setExpanded(false);
    document.addEventListener("keydown", close);
    document.body.classList.add("plan-modal-open");
    return () => {
      document.removeEventListener("keydown", close);
      document.body.classList.remove("plan-modal-open");
    };
  }, [expanded]);

  return (
    <section className="floor-plan-card full-width" aria-label="부스 위치 선택" data-testid="floor-plan">
      <div className="floor-plan-head">
        <div><span>부스 위치 확인</span><small>배치도에서 번호를 눌러 바로 선택하세요.</small></div>
        <button type="button" className="plan-expand" onClick={() => setExpanded(true)} aria-label="배치도 크게 보기">크게 보기 <b>↗</b></button>
      </div>
      <div className="floor-plan-canvas"><PlanGraphic rooms={rooms} selectedRoomId={selectedRoomId} onSelect={onSelect} /></div>
      <div className="floor-plan-selection" aria-live="polite">
        <span className="selection-dot" />
        <div><small>선택한 부스</small><strong>{selected?.name || "부스를 불러오는 중"}</strong></div>
        <p>{location}</p>
      </div>
      {expanded && (
        <div className="plan-modal" role="dialog" aria-modal="true" aria-label="Project SOS 판교점 배치도 크게 보기"
          onMouseDown={(event) => event.target === event.currentTarget && setExpanded(false)}>
          <div className="plan-modal-card">
            <div className="plan-modal-head"><div><span>PROJECT SOS · 판교점</span><h4>부스 배치도</h4></div><button type="button" onClick={() => setExpanded(false)} aria-label="배치도 닫기">×</button></div>
            <PlanGraphic rooms={rooms} selectedRoomId={selectedRoomId} onSelect={onSelect} />
            <div className="plan-modal-foot"><span><i className="legend selected" />선택</span><span><i className="legend available" />선택 가능</span><b>{selected?.name} · {location}</b></div>
          </div>
        </div>
      )}
    </section>
  );
}
