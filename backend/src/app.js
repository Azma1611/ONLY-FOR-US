import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Middlewares
import { globalLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/error.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import relationshipRoutes from './routes/relationship.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import messageRoutes from './routes/message.routes.js';
import chatRoutes from './routes/chat.routes.js';
import goalRoutes from './routes/goals.routes.js';
import habitRoutes from './routes/habits.routes.js';
import healthRoutes from './routes/health.routes.js';
import productivityRoutes from './routes/productivity.routes.js';
import achievementRoutes from './routes/achievements.routes.js';
import aiRoutes from './routes/ai.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import taskRoutes from './routes/task.routes.js';
import shoppingRoutes from './routes/shopping.routes.js';
import travelRoutes from './routes/travel.routes.js';
import movieRoutes from './routes/movie.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import reminderRoutes from './routes/reminders.routes.js';
import financeRoutes from './routes/finance.routes.js';
import journalRoutes from './routes/journal.routes.js';
import memoryRoutes from './routes/memories.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import integrationRoutes from './routes/integrations.routes.js';
import syncRoutes from './routes/sync.routes.js';
import mediaRoutes from './routes/media.routes.js';
import themeRoutes from './routes/theme.routes.js';

const app = express();

// Standard middleware setups
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(express.json({ limit: '50kb' })); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());
app.use(compression());

// Prevent parameter pollution
app.use(hpp());

// Logger configuration (suppressed in automated testing)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Throttle global API calls
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Only For Us API is running perfectly',
    timestamp: new Date(),
  });
});

// Register api route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/relationship', relationshipRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/productivity', productivityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/theme', themeRoutes);

// Catch-all unhandled fallback routes
app.use('*', (req, res, next) => {
  const error = new Error(`Resource pathway ${req.originalUrl} not found.`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handler middleware
app.use(errorHandler);

export default app;
