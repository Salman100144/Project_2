import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware';

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;
