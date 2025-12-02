import fs from "fs";
import path from "path";
import { generateSwaggerSpec } from "../src/config/swaggerOptions";

const generateOpenApiSpec = (): void => {
  try {
    // Generate the OpenAPI specification
    const specs = generateSwaggerSpec();

    // Ensure the output directory exists
    const outputDir = path.join(__dirname, "..");
    const outputPath = path.join(outputDir, "openapi.json");

    // Write the specification to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

    console.log("OpenAPI specification generated successfully!");
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error("Error generating OpenAPI specification:", error);
    process.exit(1);
  }
};

generateOpenApiSpec();
