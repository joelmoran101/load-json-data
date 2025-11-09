import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const DEMO_MODE = (process.env.DEMO_MODE || 'true').toLowerCase() === 'true';
const RAW_CORS = process.env.CORS_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = RAW_CORS.split(',').map(o => o.trim());
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jm.beaminstitute@gmail.com';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-CSRF-Token', 'Authorization'],
  maxAge: 86400,
};

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'otp-backend', demoMode: DEMO_MODE });
});

// Utility: basic email validation
const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

// Mock invitation codes (keep in sync with frontend demo)
const MOCK_INVITES = new Map([
  ['DEMO-ANALYST-2024', { email: 'analyst@company.com', role: 'Analyst', invitedBy: 'admin@company.com' }],
  ['DEMO-VIEWER-2024', { email: 'viewer@company.com', role: 'Viewer', invitedBy: 'admin@company.com' }],
]);

// POST /api/auth/validate-invite
app.post('/api/auth/validate-invite', (req, res) => {
  const { inviteCode, email } = req.body || {};
  if (!inviteCode || !email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, valid: false, error: 'Invalid request' });
  }

  const record = MOCK_INVITES.get(inviteCode);
  if (!record || record.email !== email) {
    return res.status(200).json({ success: true, valid: false });
  }

  return res.status(200).json({
    success: true,
    valid: true,
    role: record.role,
    invitedBy: record.invitedBy,
  });
});

// POST /api/auth/request-otp
app.post('/api/auth/request-otp', (req, res) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Generate a 6-digit OTP
  let otp;
  if (DEMO_MODE && email === ADMIN_EMAIL) {
    otp = '123456';
  } else {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // In real production, send the OTP via email and DO NOT include it in the response.
  // For local/demo, return it so the current frontend flow can hash/verify client-side.
  return res.status(200).json({ success: true, otp, isDemoMode: DEMO_MODE });
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`OTP backend listening on http://localhost:${PORT} (demoMode=${DEMO_MODE})`);
});
