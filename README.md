# NestCal

NestCal은 NestJS로 만든 간단한 캘린더 서버입니다.

사용자와 일정을 MySQL 데이터베이스에 저장합니다.

## 필요한 프로그램

- Node.js 22
- MySQL 8

## 처음 설정하기

프로젝트 폴더에 `.env` 파일을 만듭니다.

이 파일에는 데이터베이스 접속 정보를 적습니다. 비밀번호가 들어가므로 GitHub에 올리면 안 됩니다.

```bash
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=change-me
DB_NAME=nestcal
PORT=3000
```

`DB_PASSWORD`는 내 MySQL 비밀번호로 바꿔 주세요.

## 실행하기

패키지를 설치합니다.

```bash
npm ci
```

개발 서버를 실행합니다.

```bash
npm run start:dev
```

기본 포트는 `3000`입니다.

## 확인하기

코드가 문제없이 동작하는지 확인할 때 아래 명령어를 사용합니다.

```bash
npm run lint:check
npm test
npm run test:e2e
npm run build
```

## GitHub Actions

GitHub에 코드를 올리면 자동으로 아래 작업을 실행합니다.

- 코드 스타일 검사
- 린트 검사
- 단위 테스트
- MySQL을 사용한 e2e 테스트
- 빌드 확인

`master`, `main`, 버전 태그에 push하면 Docker 이미지를 GitHub Container Registry에 게시합니다.
