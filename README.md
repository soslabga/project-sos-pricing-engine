# Project SOS 예약 사이트

1인실 10개와 멀티룸 A/B를 예약하는 Next.js App Router 웹사이트입니다. 결제는 데모용 mock이며 예약 완료 시 6자리 출입코드를 발급합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. SQLite 파일은 첫 실행 때 `data/sos.db`로 자동 생성되고, 1인실 10개와 멀티룸 A/B가 시드됩니다.

## SMS

기본 상태에서는 실제 문자를 보내지 않고 서버 콘솔과 화면 토스트에 `[모의] 010-XXXX-XXXX로 '731942' 전송됨` 형태로 표시합니다.

SOLAPI 키와 등록 발신번호를 `.env.local`에 넣으면 LMS 실발송으로 자동 전환됩니다.

```dotenv
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=
SOS_ADDRESS=TBD
SOS_WIFI_PASSWORD=현장 비밀번호
SOS_SUPPORT_PHONE=원격관제 번호
```

문자 본문은 `lib/sms-solapi.js`에 있으며 예약자명, 예약일, 사무실, 결제금액, 공용·개인실 출입코드에 맞춰 생성합니다. 내 예약은 이름과 휴대폰 번호 입력 후 5분 유효 SMS 인증번호를 확인해야 열리며, 인증 세션은 30분 유지됩니다.

## 검증

```bash
npm test
npm run build
npm run test:e2e
```

- 가격 계산은 `lib/pricing.js` 한 곳에서 처리합니다.
- API는 요청에 담긴 룸 유형을 신뢰하지 않고 SQLite의 룸 유형으로 금액을 다시 계산합니다.
- 겹치는 예약은 `BEGIN IMMEDIATE` 트랜잭션과 SQLite INSERT/UPDATE 트리거가 DB 레벨에서 차단합니다.
- Playwright는 3100 포트와 실행별 별도 SQLite 파일을 사용해 실제 로컬 예약 데이터와 분리됩니다.

## 목업 반영 상태

스타일 값은 `app/globals.css`의 CSS 변수로 분리했습니다. 요청에 적힌 `project_sos_booking_mockup.html`은 작업 폴더에 포함되어 있지 않아 원본의 색상·폰트·레이아웃을 직접 추출하거나 나란히 비교하지는 못했습니다.

