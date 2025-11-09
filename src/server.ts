import app from "./app";

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 FitTrack API server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
