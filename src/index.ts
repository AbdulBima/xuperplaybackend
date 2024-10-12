import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';  // Import rate limiter
import compression from 'compression';  // Import compression
import helmet from 'helmet';  // Import helmet
import morgan from 'morgan';  // Import morgan
import comapnyRoutes from './routes/companyRoutes.routes';
import tempCompRoutes from './routes/tempComp.routes';

import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

const app = express();
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || '*',  // Allow specific origin or use '*' to allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
};

// Use CORS middleware
app.use(cors(corsOptions));

// Security Middleware (Helmet)
app.use(helmet());  // Adds security-related HTTP headers

// Compression Middleware
app.use(compression());  // Compresses responses

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);  // Apply the rate limiter

// Logging Middleware (Morgan)
app.use(morgan('combined'));  // Log all HTTP requests

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:yourdb', {

}).then(() => console.log('MongoDB connected'));

// Routes
app.use('/api/xup/company', comapnyRoutes);
app.use('/api/xup/tempcomp', tempCompRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
