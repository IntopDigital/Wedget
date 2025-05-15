const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');
const googleReviewsRouter = require('./routes/googleReviews/index');
const whatsappWidgetRouter = require('./routes/whatsappWidget1.js/index');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up logging with Winston
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

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:5173', 'https://whatsapwidget.netlify.app']
    : '*',
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/google', googleReviewsRouter);
app.use('/api/whatsapp', whatsappWidgetRouter);

// Catch-all route for undefined endpoints
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Endpoint not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5001;

// '0.0.0.0' मतलब सभी नेटवर्क इंटरफेस पर सुनना
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


