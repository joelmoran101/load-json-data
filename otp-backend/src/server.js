import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { randomInt, randomBytes } from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const DEMO_MODE = (process.env.DEMO_MODE || 'true').toLowerCase() === 'true';
const RAW_CORS = process.env.CORS_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = RAW_CORS.split(',').map(o => o.trim());

// In-memory invite store
const INVITE_TTL_MINUTES = Number(process.env.INVITE_TTL_MINUTES || 60);
const inviteStore = new Map(); // code -> { email, role, invitedBy, createdAt, expiresAt, used }
const inviteRequests = new Map(); // id -> { id, email, status: 'pending'|'approved'|'denied', createdAt, approvedAt?, code? }
let inviteRequestSeq = 1;

const generateInviteCode = () => `INV-${randomBytes(4).toString('hex').toUpperCase()}`;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-CSRF-Token', 'Authorization', 'x-admin-email', 'x-admin-secret'],
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jm.beaminstitute@gmail.com';
const ADMIN_PANEL_SECRET = process.env.ADMIN_PANEL_SECRET || '';
const isAdmin = (req) => {
  const secret = req.header('x-admin-secret');
  const adminEmailHdr = req.header('x-admin-email');
  if (ADMIN_PANEL_SECRET && secret === ADMIN_PANEL_SECRET) return true;
  if (adminEmailHdr && adminEmailHdr === ADMIN_EMAIL) return true;
  return false;
};

// Health check
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'otp-backend', demoMode: DEMO_MODE });
});

// Utility: basic email validation
const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

// Deprecated demo invites are no longer used; invites are generated per request and tracked in-memory.

// POST /api/auth/validate-invite
app.post('/api/auth/validate-invite', (req, res) => {
  let { inviteCode, email } = req.body || {};
  
  // Trim whitespace
  inviteCode = inviteCode?.trim();
  email = email?.trim();
  
  console.log('[validate-invite] attempt:', { email, inviteCode: inviteCode?.substring(0, 8) + '...' });
  
  if (!inviteCode || !email || !isValidEmail(email)) {
    console.log('[validate-invite] invalid request');
    return res.status(400).json({ success: false, valid: false, error: 'Invalid request' });
  }

  const record = inviteStore.get(inviteCode);
  const now = Date.now();
  
  console.log('[validate-invite] record found:', record ? { email: record.email, used: record.used, expired: now > record.expiresAt.getTime() } : 'NOT FOUND');
  console.log('[validate-invite] inviteStore keys:', Array.from(inviteStore.keys()));
  
  if (!record) {
    console.log('[validate-invite] code not found');
    return res.status(200).json({ success: true, valid: false });
  }
  
  if (record.email !== email) {
    console.log('[validate-invite] email mismatch:', { provided: email, expected: record.email });
    return res.status(200).json({ success: true, valid: false });
  }
  
  if (record.used) {
    console.log('[validate-invite] already used');
    return res.status(200).json({ success: true, valid: false });
  }
  
  if (now > record.expiresAt.getTime()) {
    console.log('[validate-invite] expired');
    return res.status(200).json({ success: true, valid: false });
  }
  
  console.log('[validate-invite] validation successful');
  return res.status(200).json({
    success: true,
    valid: true,
    role: record.role,
    invitedBy: record.invitedBy,
  });
});

// POST /api/auth/request-otp
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Generate a 6-digit OTP (cryptographically strong)
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');

  const shouldSendEmail = (process.env.SEND_EMAIL || 'false').toLowerCase() === 'true';

  try {
    if (shouldSendEmail) {
      const { sendOtpEmail } = await import('./mailer.js');
      await sendOtpEmail(email, otp);
      // In email mode, do not expose OTP unless also in demo mode
      const body = DEMO_MODE ? { success: true, otp, delivered: true } : { success: true, delivered: true };
      return res.status(200).json(body);
    }

    // Demo/local mode - return OTP in response
    return res.status(200).json({ success: true, otp, isDemoMode: DEMO_MODE });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    if (!DEMO_MODE) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }
    // Fallback for demo: still return OTP
    return res.status(200).json({ success: true, otp, delivered: false, isDemoMode: DEMO_MODE });
  }
});

// POST /api/auth/request-invite
// Visitor submits an invite request. No code is issued automatically.
app.post('/api/auth/request-invite', async (req, res) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  const id = String(inviteRequestSeq++);
  const createdAt = new Date();
  inviteRequests.set(id, { id, email, status: 'pending', createdAt });
  console.log(`[invite] request created`, { id, email, createdAt });

  // Optionally notify admin about the request
  const shouldSendEmail = (process.env.SEND_EMAIL || 'false').toLowerCase() === 'true';
  try {
    if (shouldSendEmail) {
      const { sendOtpEmail } = await import('./mailer.js');
      await sendOtpEmail(ADMIN_EMAIL, `New invite request from: ${email}`);
    }
  } catch (err) {
    console.error('Failed to notify admin about invite request:', err);
  }

  return res.status(200).json({ success: true, requestId: id });
});

// Admin endpoints
app.get('/api/admin/invite-requests', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.query || {};
  const list = Array.from(inviteRequests.values()).filter(r => (status ? r.status === status : true));
  return res.status(200).json({ success: true, requests: list });
});

app.post('/api/admin/invite-requests/:id/approve', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const reqRec = inviteRequests.get(id);
  if (!reqRec) return res.status(404).json({ error: 'Request not found' });
  if (reqRec.status === 'denied') return res.status(400).json({ error: 'Request denied' });

  const code = generateInviteCode();
  const role = 'Viewer';
  const invitedBy = ADMIN_EMAIL;
  const approvedAt = new Date();
  const expiresAt = new Date(Date.now() + INVITE_TTL_MINUTES * 60 * 1000);

  inviteStore.set(code, {
    email: reqRec.email,
    role,
    invitedBy,
    createdAt: approvedAt,
    expiresAt,
    used: false,
  });
  reqRec.status = 'approved';
  reqRec.approvedAt = approvedAt;
  reqRec.code = code;
  inviteRequests.set(id, reqRec);

  return res.status(200).json({ success: true, code });
});

app.post('/api/admin/invite-requests/:id/deny', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const reqRec = inviteRequests.get(id);
  if (!reqRec) return res.status(404).json({ error: 'Request not found' });
  reqRec.status = 'denied';
  inviteRequests.set(id, reqRec);
  return res.status(200).json({ success: true });
});

app.post('/api/admin/invite-requests/:id/send-code', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const reqRec = inviteRequests.get(id);
  if (!reqRec) return res.status(404).json({ error: 'Request not found' });
  if (reqRec.status !== 'approved' || !reqRec.code) return res.status(400).json({ error: 'Request not approved' });

  const shouldSendEmail = (process.env.SEND_EMAIL || 'false').toLowerCase() === 'true';
  try {
    if (shouldSendEmail) {
      const { sendOtpEmail } = await import('./mailer.js');
      await sendOtpEmail(reqRec.email, `Your invitation code is: ${reqRec.code}`);
      return res.status(200).json({ success: true, delivered: true });
    }
    return res.status(200).json({ success: true, delivered: false, inviteCode: reqRec.code });
  } catch (err) {
    console.error('Failed to send invite code:', err);
    return res.status(500).json({ error: 'Failed to send invite code' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  let { email, inviteCode, name } = req.body || {};
  
  // Trim whitespace from inputs
  email = email?.trim();
  inviteCode = inviteCode?.trim();
  name = name?.trim();
  
  console.log('[register] attempt:', { email, inviteCode: inviteCode?.substring(0, 8) + '...', name });
  
  if (!email || !isValidEmail(email) || !inviteCode || !name) {
    return res.status(400).json({ error: 'Email, name, and invite code are required' });
  }
  
  const record = inviteStore.get(inviteCode);
  const now = Date.now();
  
  console.log('[register] record found:', record ? { email: record.email, used: record.used, expired: now > record.expiresAt.getTime() } : 'NOT FOUND');
  console.log('[register] inviteStore keys:', Array.from(inviteStore.keys()));
  
  if (!record) {
    return res.status(400).json({ error: 'Invalid invitation code', success: false });
  }
  
  if (record.email !== email) {
    console.log('[register] email mismatch:', { provided: email, expected: record.email });
    return res.status(400).json({ error: `This invitation code is for ${record.email}`, success: false });
  }
  
  if (record.used) {
    return res.status(400).json({ error: 'This invitation code has already been used', success: false });
  }
  
  if (now > record.expiresAt.getTime()) {
    return res.status(400).json({ error: 'This invitation code has expired', success: false });
  }
  // Mark used
  record.used = true;
  inviteStore.set(inviteCode, record);

  // Create minimal user payload (no persistence in demo)
  const user = {
    id: String(randomInt(1, 1_000_000)),
    email,
    name,
    role: record.role,
    invitedBy: record.invitedBy,
    invitedAt: record.createdAt,
    lastLogin: new Date(),
  };

  return res.status(200).json({ success: true, user });
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`OTP backend listening on http://localhost:${PORT} (demoMode=${DEMO_MODE})`);
});
