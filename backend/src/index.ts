import express, { Application } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { config } from './config';
import { connectDB } from './config/database';
import { auth } from './lib';
import routes from './routes';
import { errorHandler, notFound, attachSession } from './middleware';

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// BetterAuth handler - must be before express.json() for auth routes
// This handles all /api/auth/* routes automatically
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach session to all requests (optional - for accessing user in routes)
app.use(attachSession);

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
