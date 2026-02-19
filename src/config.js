/**
 * 배포 시 사용하는 환경 변수.
 * 키 이름은 대문자와 언더스코어만 사용합니다.
 * DB_TYPE: POSTGRESQL | MYSQL | MARIADB | MONGODB
 */
module.exports = {
  PORT: process.env.WAS_PORT || process.env.WEB_PORT || process.env.PORT || 3000,
  DB_TYPE: process.env.DB_TYPE ? process.env.DB_TYPE.toUpperCase() : null,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
};
