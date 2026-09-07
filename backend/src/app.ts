import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import { getDatabaseHealth } from './config/database';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/authRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import doctorRoutes from './routes/doctorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import referralRoutes from './routes/referralRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import surveillanceRoutes from './routes/surveillanceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import medicineRoutes from './routes/medicineRoutes';
import patientRoutes from './routes/patientRoutes';
import complaintRoutes from './routes/complaintRoutes';
import announcementRoutes from './routes/announcementRoutes';
import campaignRoutes from './routes/campaignRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Strictly configured CORS: Never use wildcard '*' for authenticated healthcare APIs
const allowedOrigins = (config.frontendUrl || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || (config.nodeEnv !== 'production' && origin.includes('localhost'))) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified origin.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-target-hospital-id',
    'x-target-district',
    'x-target-province',
    'x-break-glass-reason',
  ],
}));


// ── Rate Limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

app.use(generalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── NoSQL Injection Protection ────────────────────────────────────────────────
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  next();
});

// ── Logging ───────────────────────────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ── Swagger Docs ──────────────────────────────────────────────────────────────
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Ministry of Health Digital Health Platform API',
    version: '1.0.0',
    description: 'A comprehensive API for managing national healthcare services, hospitals, doctors, patients, appointments, referrals, disease surveillance, and emergency management.',
    contact: {
      name: 'Ministry of Health — Digital Health Division',
      email: 'digithealth@moh.gov.lk',
    },
  },
  servers: [
    { url: '/api', description: 'Current server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'Hospitals', description: 'Hospital management' },
    { name: 'Doctors', description: 'Healthcare worker management' },
    { name: 'Appointments', description: 'Appointment booking and management' },
    { name: 'Referrals', description: 'Patient referral workflows' },
    { name: 'Emergency', description: 'Emergency incident management' },
    { name: 'Surveillance', description: 'Disease surveillance and reporting' },
    { name: 'Notifications', description: 'User notification management' },
    { name: 'Dashboard', description: 'Ministry dashboard analytics' },
  ],
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
  customSiteTitle: 'MoH Health Platform API',
}));

// ── Health Checks (Sections 13 & 14) ─────────────────────────────────────────
// Section 13: Root Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LankaCare API',
  });
});

// Section 14: Safe Database & API Health Check (never exposes credentials/secrets)
app.get('/api/health', (_req, res) => {
  const dbHealth = getDatabaseHealth();
  res.status(200).json({
    status: 'ok',
    service: 'LankaCare API',
    database: dbHealth.connected ? 'connected' : 'unavailable',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/surveillance', surveillanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reports', reportRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
