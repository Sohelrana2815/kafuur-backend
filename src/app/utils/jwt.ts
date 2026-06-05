import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";

// 1. Generate Token
export const generateToken = (
  payload: object,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = <T extends JwtPayload | string>(
  token: string,
  secret: string,
  options?: VerifyOptions,
): T | null => {
  try {
    return jwt.verify(token, secret, options) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
};