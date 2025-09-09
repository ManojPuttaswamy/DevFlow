import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './services/websocketService';
import prisma from './utils/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const server = createServer(app);

try {
  const webSocketService = initializeWebSocket(server);
  console.log('WebSocket service initialized successfully');
} catch (error) {
  console.error('Failed to initialize WebSocket service:', error);
}

// Test database connection
async function testDatabaseConnection() {
  try {
      await prisma.$connect();
      console.log('Database connected successfully');
  } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
      await testDatabaseConnection();
      
      server.listen(PORT, () => {
          console.log('DevFlow API Server Status:');
          console.log(`HTTP Server: http://localhost:${PORT}`);
          console.log(`WebSocket: ws://localhost:${PORT}`);
          console.log(`Health Check: http://localhost:${PORT}/health`);
          console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
  } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
      console.log('HTTP server closed');
      prisma.$disconnect();
      process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
      console.log('HTTP server closed');
      prisma.$disconnect();
      process.exit(0);
  });
});

// Start the server
startServer();

// Export server for testing purposes
export default server;