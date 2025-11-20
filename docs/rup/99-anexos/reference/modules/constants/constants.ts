// app/api/src/constants/constants.ts

// Environment variable utility function for Node.js projects
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not defined. ` +
        `Please ensure this variable is properly configured in your docker-compose.yml file. ` +
        `For development, you can use 'docker-compose up' or set up your local environment ` +
        `according to the env.example file.`,
    );
  }
  return value;
}

/**
 * Returns the API base URL from environment variables for the API project.
 *
 * Environment Variable Mapping:
 * - API Project (Node.js): process.env.API_BASE_URL
 * - UI Project (Vite): import.meta.env.VITE_API_URL
 * - Extension Project (Vite): import.meta.env.VITE_API_URL
 *
 * All projects export this value as the same constant name: API_BASE_URL
 * This ensures a single source of truth while respecting environment-specific naming conventions.
 *
 * No hard-coded fallback is allowed. All configuration must come from env.
 */
export function getApiBaseUrl(): string {
  return getEnvVar('API_BASE_URL');
}

/**
 * The standardized API base URL constant used across all projects.
 * This is the single source of truth for the API endpoint URL.
 */
export const API_BASE_URL = getApiBaseUrl();

