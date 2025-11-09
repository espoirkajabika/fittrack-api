import helmet from "helmet";

/**
 * Get Helmet configuration based on environment
 * Development has relaxed settings for easier debugging
 * Production has strict security settings
 */
export const getHelmetConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Base configuration for APIs
  const baseConfig = {
    contentSecurityPolicy: false, // Disable for JSON APIs
    hidePoweredBy: true, // Always hide server info
    noSniff: true, // Always prevent MIME sniffing
  };

  if (isDevelopment) {
    return helmet({
      ...baseConfig,
      hsts: false, // No HTTPS enforcement in development
    });
  }

  // Production gets full security
  return helmet({
    ...baseConfig,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
  });
};
