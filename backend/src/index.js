import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import bidRoutes from './routes/bids.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to your frontend's origin
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PeerHire API',
      version: '1.0.0',
      description: 'PeerHire Job Posting & Bidding API'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/bids', bidRoutes);

// Error handling middleware
app.use(errorHandler);

// Pass the io instance to routes that need it
app.set('io', io);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peerhire')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { // Use server.listen instead of app.listen
  console.log(`Server is running on port ${PORT}`);
});

export default app;