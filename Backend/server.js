// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Routers
const googleReviewsRouter = require('./routes/googleReviews/index');
const whatsappWidgetRouter = require('./routes/whatsappWidget1.js/index');
const signupRoute = require('./routes/auth/Signup');
const loginRoute = require('./routes/auth/Login');
const authenticationToken = require('./middleware/Authentication');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ],
});

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:5173', 'http://localhost:5174']
    : '*',
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// MongoDB Connection
if (!process.env.MONGO_URI) {
  logger.error('MONGO_URI not set in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000, // 20 seconds
})
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running OK" });
});

// API Routes
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/google', googleReviewsRouter);
app.use('/api/whatsapp', whatsappWidgetRouter);

// Protected Route Example
app.get('/api/validate-token', authenticationToken, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});


// Static File Access
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// 404 Error Handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Endpoint not found: ${req.originalUrl}` });
});

// General Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(` Server running on http://localhost:${PORT}`);
});
