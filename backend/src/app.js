import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import tweetRoutes from './routes/tweetRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

const app = express();

// Middlewares

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(',') || [];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin} is not allowed`));
        }
    },
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization']
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

export default app;
