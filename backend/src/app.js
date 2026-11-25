import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import tweetRoutes from './routes/tweetRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy; needed so the rate limiter sees real client IPs
// Middlewares

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
            .split(',')
            .map((o) => o.trim().replace(/\/+$/, ''))
            .filter(Boolean);

        const normalizedOrigin = origin?.replace(/\/+$/, '');
        if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin} is not allowed`));
        }
    },
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Twiller backend is running successfully');
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tweets', tweetRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

export default app;
