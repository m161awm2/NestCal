# NestCal

NestCal is a NestJS calendar app with MySQL-backed users and events.

## Requirements

- Node.js 22
- MySQL 8

## Environment

Create a local `.env` file. Do not commit it.

```bash
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=change-me
DB_NAME=nestcal
PORT=3000
```

## Development

```bash
npm ci
npm run start:dev
```

## Verification

```bash
npm run lint:check
npm test
npm run test:e2e
npm run build
```

## CI/CD

GitHub Actions runs formatting checks, linting, unit tests, e2e tests with a MySQL service, and a production build on pushes and pull requests.

Pushes to `master`, `main`, or version tags publish a Docker image to GitHub Container Registry using the built-in `GITHUB_TOKEN`.
