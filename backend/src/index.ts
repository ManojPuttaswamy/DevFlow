import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './services/websocketService';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const server = createServer(app);

initializeWebSocket(server);


app.listen(PORT, () => {
  console.log(` DevFlow API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved, shutting down server gracefully...');
  server.close(()=> {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default server;