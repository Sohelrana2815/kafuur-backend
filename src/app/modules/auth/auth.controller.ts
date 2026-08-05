import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import AppError from "../../errorsHelpers/AppError.js";
import { setAuthCookie } from "../../utils/setCookie.js";
import { createUserTokens } from "../../utils/userTokens.js";
import { envVars } from "../../config/env.js";
import { CustomJwtPayload } from "./auth.interface.js";
import passport from "passport";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.authenticate("local", async (err: any, user: any, info: any) => {

    if (err) {

   


      return next(new AppError(401, err))
    }

    if (!user) {
    
      return next(new AppError(401, info.message))
    }

    const userTokens = createUserTokens(user)

    // delete user.toObject().password

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { username,password, ...userWithoutPassword } = user

    setAuthCookie(res, userTokens)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.StatusCodes.OK,
      message: "User Logged In Successfully",
      data: {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: userWithoutPassword

      },
    })
  })(req, res, next)




})

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "No refresh token received from cookies",
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
      message: "New Access Token Retrieved Successfully",
      data: tokenInfo,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user
    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as CustomJwtPayload);
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
