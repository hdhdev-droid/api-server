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
| `DB_TYPE` | (선택) DB 유형. 미설정 시 `DB_PORT`로 자동 판단 (5432→PostgreSQL, 3306→MySQL/MariaDB, 27017→MongoDB) |
| `DB_HOST` | DB 호스트 |
| `DB_PORT` | DB 포트 (기본: PostgreSQL 5432, MySQL/MariaDB 3306, MongoDB 27017) |
| `DB_NAME` | DB(데이터베이스/스키마) 이름 |
| `DB_USER` | DB 사용자 |
| `DB_PASSWORD` | DB 비밀번호 |
| `DB_URI` | (선택) MongoDB 연결 문자열. 있으면 MongoDB로 연결. 없으면 위 호스트/포트 등으로 연결 |

로컬에서는 프로젝트 루트에 `.env` 파일을 두거나, `.env.example`을 복사해 `.env`로 만든 뒤 값을 채워 사용할 수 있습니다. (실제 값은 Git에 올리지 마세요.)

**지원 DB**: PostgreSQL, MySQL, MariaDB, MongoDB. **DB 연결이 필수**이며, 변수·메모리 DB는 사용하지 않습니다. `DB_TYPE`을 넣지 않아도 `DB_PORT`만 맞으면(5432/3306/27017) DB 유형이 자동 결정됩니다. DB 미설정 또는 연결 실패 시 503 접속 불가 화면(설정된 환경 변수 표시)이 나옵니다. 테이블/컬렉션이 없으면 첫 요청 시 자동 생성됩니다.

## 메인 페이지

- **http://localhost:3000/** — DB에 연결해 테이블(또는 컬렉션) 목록을 표시합니다.  
  DB 미설정 또는 연결 실패 시 503 접속 불가 화면이 표시됩니다.

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
