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

기본 포트는 **3000**입니다. 환경 변수 `PORT`로 변경할 수 있습니다.

## 환경 변수

배포 시 아래 환경 변수를 사용합니다. 키는 대문자와 언더스코어만 사용합니다.

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본값: 3000) |
| `DB_HOST` | DB 호스트 |
| `DB_PORT` | DB 포트 |
| `DB_NAME` | DB 이름 |
| `DB_USER` | DB 사용자 |
| `DB_PASSWORD` | DB 비밀번호 |

로컬에서는 프로젝트 루트에 `.env` 파일을 두거나, `.env.example`을 복사해 `.env`로 만든 뒤 값을 채워 사용할 수 있습니다. (실제 값은 Git에 올리지 마세요.)

DB는 **PostgreSQL**을 사용합니다. `DB_HOST`, `DB_NAME` 등이 설정되어 있으면 메인 페이지에서 테이블 목록을 조회합니다.

## 메인 페이지

- **http://localhost:3000/** — DB에 연결해 **public** 스키마의 테이블 목록을 표시합니다.  
  DB가 설정되지 않았거나 연결에 실패하면 안내 메시지가 표시됩니다.

## 샘플 페이지

- **http://localhost:3000/sample** 또는 **http://localhost:3000/sample.html** — API 테스트용 페이지입니다.

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 메인 페이지 (DB 테이블 목록) |
| GET | `/api` | API 정보 (JSON) |
| GET | `/api/tables` | DB 테이블 목록 (JSON) |
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
