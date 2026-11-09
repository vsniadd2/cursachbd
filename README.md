# Flexora

CRM и система управления проектами для IT-компании.

## Структура

| Папка | Назначение |
|-------|------------|
| `frontend/` | React + Vite — `npm run dev` |
| `backend/` | Express API — локально `npm run dev` или через Docker |
| `docker-compose.yml` | PostgreSQL + API (из корня репозитория) |
| `docs/` | Документация |

## Быстрый старт

### 1. Корневой `.env` (для Docker)

```powershell
cd C:\Users\Ivan\Desktop\cursach-four
copy .env.example .env
```

Задайте `JWT_SECRET` (минимум 16 символов).

### 2. Зависимости

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

### 3. Два терминала

**Терминал 1 — из корня, backend в Docker:**

```powershell
cd C:\Users\Ivan\Desktop\cursach-four
docker compose up
```

**Терминал 2 — frontend:**

```powershell
cd C:\Users\Ivan\Desktop\cursach-four\frontend
copy .env.example .env
npm run dev
```

> В PowerShell при ошибке политики: `npm.cmd run dev`

### URLs

- Frontend: http://localhost:5173  
- API: http://localhost:3001/api/v1  
- Swagger: http://localhost:3001/api/docs  
- Логин: `admin@flexora.local` / `admin123`

## Backend без Docker

```powershell
cd backend
copy .env.example .env
docker compose up postgres -d
npm run db:migrate
npm run db:seed
npm run dev
```

## Сборка

```powershell
cd frontend
npm run build

cd ..\backend
npm run build
```

## Документация

- [docs/DATABASE.md](docs/DATABASE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
