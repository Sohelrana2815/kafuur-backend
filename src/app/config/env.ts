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
  PORT: getEnv("PORT", "5001"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BCRYPT_SALT_ROUND: getEnv("BCRYPT_SALT_ROUND"),
  //  Access Token
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "3d"),
  ADMIN_EMAIL: getEnv("ADMIN_EMAIL"),
  ADMIN_PASSWORD: getEnv("ADMIN_PASSWORD"),
  // CLOUDINARY
  CLOUDINARY_CLOUDE_NAME: getEnv("CLOUDINARY_CLOUDE_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  // CLERK
  PUBLIC_CLERK_PUBLISHABLE_KEY:getEnv("PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY:getEnv("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SIGNING_SECRET:getEnv("CLERK_WEBHOOK_SIGNING_SECRET")
} as const;
