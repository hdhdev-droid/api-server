/**
 * OpenAPI 3.0 스펙 — api-server API 문서
 */
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'api-server API',
    description: 'Node.js API 서버 (Express). DB: PostgreSQL, MySQL, MariaDB, MongoDB.',
    version: '1.0.0',
  },
  servers: [{ url: '/', description: '현재 서버' }],
  paths: {
    '/api': {
      get: {
        summary: 'API 정보',
        tags: ['기타'],
        responses: { 200: { description: '엔드포인트 목록' } },
      },
    },
    '/api/config': {
      get: {
        summary: 'DB 설정(마스킹) 조회',
        tags: ['설정'],
        responses: { 200: { description: 'env (DB_TYPE, DB_HOST 등, 비밀번호 마스킹)' } },
      },
    },
    '/api/main': {
      get: {
        summary: '메인 화면용 데이터 (env + 테이블 목록)',
        tags: ['설정'],
        responses: {
          200: { description: 'env, tables, error(있을 경우)' },
          503: { description: 'DB 미연결 시 JSON으로 error, env 반환' },
        },
      },
    },
    '/api/health': {
      get: {
        summary: '헬스 체크',
        tags: ['기타'],
        responses: { 200: { description: 'status, timestamp' } },
      },
    },
    '/api/tables': {
      get: {
        summary: '테이블 목록',
        tags: ['테이블'],
        responses: {
          200: { description: 'tables 배열 또는 { error }' },
          500: { description: '서버 오류' },
        },
      },
      post: {
        summary: '테이블 생성',
        tags: ['테이블'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['tableName'], properties: { tableName: { type: 'string' } } },
            },
          },
        },
        responses: {
          201: { description: '생성 결과' },
          400: { description: 'tableName 필수' },
          503: { description: 'DB 연결 불가' },
        },
      },
    },
    '/api/tables/{tableName}/rows': {
      post: {
        summary: '행 추가',
        tags: ['테이블'],
        parameters: [{ name: 'tableName', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {
          201: { description: '추가된 행' },
          400: { description: 'name 필수' },
          503: { description: 'DB 연결 불가' },
        },
      },
    },
    '/api/tables/{tableName}/rows/{id}': {
      delete: {
        summary: '행 삭제',
        tags: ['테이블'],
        parameters: [
          { name: 'tableName', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'deleted: true' },
          404: { description: 'Not found' },
          503: { description: 'DB 연결 불가' },
        },
      },
    },
    '/api/items': {
      get: {
        summary: '아이템 목록',
        tags: ['아이템'],
        responses: {
          200: { description: 'items 배열' },
          503: { description: 'DB 연결 불가' },
        },
      },
      post: {
        summary: '아이템 추가',
        tags: ['아이템'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {
          201: { description: '생성된 아이템' },
          400: { description: 'name 필수' },
          503: { description: 'DB 연결 불가' },
        },
      },
    },
    '/api/items/{id}': {
      get: {
        summary: '아이템 단건 조회',
        tags: ['아이템'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: '아이템 객체' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        summary: '아이템 삭제',
        tags: ['아이템'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'deleted: true' },
          404: { description: 'Not found' },
          503: { description: 'DB 연결 불가' },
        },
      },
    },
  },
  tags: [
    { name: '설정' },
    { name: '테이블' },
    { name: '아이템' },
    { name: '기타' },
  ],
};
