import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import prisma from './utils/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { requestCache } from './middleware/requestCache';
import { redis } from './utils/redis';
import { compressionMiddleware } from './middleware/compression';


const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
}));
app.use(cors({
  origin: isProduction 
    ? [process.env.FRONTEND_URL!, 'https://devflow.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50, // Limit auth attempts
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  skip: (req) => {
    return !req.path.startsWith('/api/auth');
  }
});

app.use('/api/auth', authLimiter);

// Logging
// Compression middleware
app.use(compressionMiddleware);

// Logging (different levels for different environments)
if (isProduction) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route with database test
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      message: 'DevFlow API is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      database: 'Disconnected',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal error'
    });
  }
});

// API routes
app.use('/api/auth',authRoutes);
app.use('/api/users', 
  requestCache({ 
    ttl: 300, // 5 minutes
    skipCache: (req) => req.method !== 'GET' || req.path.includes('/me')
  }),
  userRoutes
);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api', (req, res) => {
  res.json({ 
    message: 'DevFlow API v1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      reviews: '/api/reviews',
      notifications: '/api/notifications'
    }
  });
});

// Global Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log error details
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Send appropriate response
  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: ['/health', '/api']
  });
});

export default app;