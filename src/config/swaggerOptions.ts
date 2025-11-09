import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FitTrack API Documentation",
      version: "1.0.0",
      description:
        "Fitness tracking API for managing workouts, exercises, workout plans, and progress tracking.",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/api/v1/routes/*.ts", "./src/api/v1/validations/*.ts"],
};

// Generate the Swagger spec
export const generateSwaggerSpec = (): object => {
  return swaggerJsdoc(swaggerOptions);
};
