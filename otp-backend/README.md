# OTP Backend Server

A small Express-based backend dedicated to handling OTP workflows for the load-json-data app. This replaces reliance on the Financial-Data-Dashboard server.

## Features
- POST /api/auth/request-otp — generate a 6-digit OTP for a given email
- POST /api/auth/validate-invite — validate invitation codes (demo/mock)
- Security middleware: Helmet, CORS (configurable), JSON size limits
- Health checks at GET /healthz

## Getting started

1) Install deps

```bash
npm install
```

2) Development

```bash
npm run dev
```

3) Production

```bash
npm start
```

## Configuration (.env)

See `.env.example` for all options.

- PORT: Server port (default 3002)
- DEMO_MODE: If true, respond with the OTP in the API for convenience
- CORS_ORIGIN: Allowed origin for CORS (e.g. http://localhost:5173)
- ADMIN_EMAIL: Demo admin email that always gets OTP 123456 (optional)

## Notes
- In DEMO_MODE the server returns the OTP in the response; do NOT enable this in production.
- In production, connect to an email service and remove OTP from the API response.
