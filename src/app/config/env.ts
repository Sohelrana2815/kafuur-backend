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
    BCRYPT_SALT_ROUND: getEnv("BCRYPT_SALT_ROUND",),
    ADMIN_EMAIL: getEnv("ADMIN_EMAIL",),
    ADMIN_PASSWORD: getEnv("ADMIN_PASSWORD",)
} as const;