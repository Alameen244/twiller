import dotenv from 'dotenv';
dotenv.config();

import { initiateCloudinary } from './middlewares/cloudinary.middleware.js';
import { connectDB } from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5000;

// Initialize Cloudinary
initiateCloudinary();

// Connect to MongoDB
connectDB();

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
