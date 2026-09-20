export const setAuthCookie = (res, tokenInfo) => {
    // Determine if running on Vercel/Production
    const isProduction = process.env.NODE_ENV === "production";
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: isProduction, // true //process.env.NODE_ENV === "production",
            sameSite: isProduction ? "none" : "lax", // process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: isProduction, //process.env.NODE_ENV === "production",
            sameSite: isProduction ? "none" : "lax", //production" ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
    }
};
// export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
//   if (tokenInfo.accessToken) {
//     res.cookie("accessToken", tokenInfo.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax", // process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 60 * 60 * 60 * 1000, // 1 day
//     });
//   }
//   if (tokenInfo.refreshToken) {
//     res.cookie("refreshToken", tokenInfo.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax", //production" ? "none" : "lax",
//       maxAge: 30 * 60 * 60 * 60 * 1000, // 30 days
//     });
//   }
// };
