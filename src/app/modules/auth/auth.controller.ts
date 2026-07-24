import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import AppError from "../../errorsHelpers/AppError.js";
import { setAuthCookie } from "../../utils/setCookie.js";
import { createUserTokens } from "../../utils/userTokens.js";
import { envVars } from "../../config/env.js";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.credentialsLogin(req.body);
  // const { accessToken, refreshToken, user } = result;

  // Set Access Token in HTTP-Only Cookie exactly like your core configurations
  // res.cookie("accessToken", accessToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   maxAge: 60 * 60 * 60 * 1000, // 1 day
  // });
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   maxAge: 30 * 60 * 60 * 60 * 1000, // 30 days
  // });
  setAuthCookie(res, result);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "User Logged in Successfully",
    data: result,
  });
});

const getNewAccessToken = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "No refresh token recieved from cookies",
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string,
    );

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.StatusCodes.OK,
      message: "New Access Token Retrived Successfully",
      data: tokenInfo,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user
    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.StatusCodes.OK,
      message: "Password changed successfully",
      data: null,
    });
  },
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    // 1. Extract the original route the user was trying to access (e.g., /booking)
    let redirectTo = (req.query.state as string) || "";

    // Remove leading slash so it formats cleanly (e.g., /booking -> booking)
    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    // 2. Ensure passport successfully attached the user
    const user = req.user;
    console.log(user, "From Controller")
    if (!user) {
      throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "User not found");
    }

    // 3. Create your JWT tokens
    const tokenInfo = createUserTokens(user);

    // 4. Attach the tokens to the response cookies
    setAuthCookie(res, tokenInfo);

    // 5. REDIRECT back to the frontend instead of sending a JSON response. 
    // This is required for OAuth flows to close the loop.
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  },
);

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.StatusCodes.OK,
    message: "User Logged out Successfully",
    data: null
  })

})

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  logout,
  googleCallbackController
};
