import app from "./app";
import { initializeFirebaseAdmin } from "./config/firebaseConfig";
import { getScheduler } from "./jobs/jobScheduler";

const PORT = process.env.PORT || 3000;

// Initialize Firebase
initializeFirebaseAdmin();

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  
  // Initialize and start job scheduler
  const scheduler = getScheduler();
  scheduler.startAll();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  
  // Stop all scheduled jobs
  const scheduler = getScheduler();
  scheduler.stopAll();
  
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  
  // Stop all scheduled jobs
  const scheduler = getScheduler();
  scheduler.stopAll();
  
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default server;