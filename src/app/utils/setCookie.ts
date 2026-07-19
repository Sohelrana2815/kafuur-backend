import { Response } from "express";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 60 * 1000, // 1 day
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 60 * 60 * 1000, // 30 days
    });
  }
};
