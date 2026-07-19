import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import AppError from "../../errorsHelpers/AppError.js";
import { setAuthCookie } from "../../utils/setCookie.js";

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
  async (req: Request, res: Response, next: NextFunction) => {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logout = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  res.clearCookie("accessToken",{
    httpOnly:true,
    secure:false,
    sameSite:"lax"
  })
  res.clearCookie("refreshToken",{
    httpOnly:true,
    secure:false,
    sameSite:"lax"
  })
})

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout
};
