import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wordRoutes from './routes/wordRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/word', wordRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GRE Vocab Builder API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GRE Verbal Vocabulary Builder API',
    version: '1.0.0',
    endpoints: {
      words: '/api/word',
      quiz: '/api/quiz',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 GRE Vocab Builder API running on port ${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
});

export default app;

