# Project SOS Operations

Project SOS 무인 예약·결제 상태 관리·권한 관리 MVP.

## 로컬 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속.

## 데모 계정

- 운영 관리자: `admin@soslab.co` / `admin1234`
- 일반 사용자: `user@soslab.co` / `user1234`
- 공유오피스 이용자: `member@soslab.co` / `member1234`

## 권한

- 운영 관리자: 결제 완료 예약 관리, 일반 사용자를 공유오피스 이용자로 전환
- 일반 사용자: 프로젝트룸 예약, 결제 완료 처리 요청
- 공유오피스 이용자: 일반 예약 + 회의실 예약

PG 연동은 제외되어 있으며, 결제는 데모 상태값으로만 처리함.

