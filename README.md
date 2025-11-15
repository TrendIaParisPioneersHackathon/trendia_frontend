# trendIA Frontend

React SPA for trendIA AI-powered promotional video generator.

## Setup

```bash
npm install
cp .env.example .env
```

Configure `VITE_API_URL` in `.env` to point to your backend.

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Build

```bash
npm run build
```

## Docker

```bash
docker build --build-arg VITE_API_URL=http://your-backend-url:8000 -t trendia-frontend .
docker run -p 3000:80 trendia-frontend
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
