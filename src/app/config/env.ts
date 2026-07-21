import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required Env variable: ${key}`);
  }

  return value;
}

export const envVars = {
  PORT: getEnv("PORT", "5000"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BCRYPT_SALT_ROUND: getEnv("BCRYPT_SALT_ROUND"),
  //  Access Token
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN"),
  ADMIN_EMAIL: getEnv("ADMIN_EMAIL"),
  ADMIN_PASSWORD: getEnv("ADMIN_PASSWORD"),
  // CLOUDINARY
  CLOUDINARY_CLOUDE_NAME: getEnv("CLOUDINARY_CLOUDE_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  // Passport Google OAuth20
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
} as const;
