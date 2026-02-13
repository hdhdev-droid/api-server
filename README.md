# API Server

Express 기반 Node.js API 서버입니다.

## 설치

```bash
npm install
```

## 실행

```bash
# 일반 실행
npm start

# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev
```

기본 포트는 **3000**입니다. `PORT` 환경 변수로 변경할 수 있습니다.

## 샘플 페이지

서버 실행 후 브라우저에서 다음 주소로 접속하면 API를 테스트할 수 있습니다.

- **http://localhost:3000/sample** 또는 **http://localhost:3000/sample.html**

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | API 정보 |
| GET | `/sample` | 샘플 페이지 (HTML) |
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/items` | 아이템 목록 |
| GET | `/api/items/:id` | 아이템 조회 |
| POST | `/api/items` | 아이템 생성 (body: `{ "name": "이름" }`) |

## 예시

```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 아이템 목록
curl http://localhost:3000/api/items

# 아이템 생성
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d "{\"name\":\"New Item\"}"
```
