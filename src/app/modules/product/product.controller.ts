// /* eslint-disable @typescript-eslint/no-unused-vars */

// import { NextFunction, Request, Response } from "express";
// import { catchAsync } from "../../utils/catchAsync.js";
// import { PostServices } from "./post.service.js";
// import { sendResponse } from "../../utils/sendResponse.js";
// import httpStatus from "http-status-codes";

// // const createPost = catchAsync(
// //   async (req: Request, res: Response, next: NextFunction) => {
// //     // 1. Extract the author identity from the JWT (via req.user)

// //     // const authorId = req.user?.userId as string;
// //     // 2. Pass both the body (content/category) and the author identity

// //     // const result = await PostServices.createPost(authorId, req.body);
// //     sendResponse(res, {
// //       statusCode: httpStatus.StatusCodes.CREATED,
// //       success: true,
// //       message: "Post Created Successfully",
// //       data: result,
// //     });
// //   },
// // );

// const createPost = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const authorId = req.user?.userId as string;
//     const result = await PostServices.createPost(authorId, req.body);

//     sendResponse(res, {
//       statusCode: httpStatus.StatusCodes.CREATED,
//       success: true,
//       message: "Post Created Successfully",
//       data: result,
//     });
//   },
// );

// const getAllPosts = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await PostServices.getAllPosts();
//     sendResponse(res, {
//       statusCode: httpStatus.StatusCodes.OK,
//       success: true,
//       message: "All Posts Retrieved Successfully",
//       meta: result.meta,
//       data: result.data,
//     });
//   },
// );
// const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
//   // Cast 'slug' to string to satisfy the PostServices parameter type
//   const slug = req.params.slug as string;

//   const result = await PostServices.getPostBySlug(slug);

//   sendResponse(res, {
//     statusCode: httpStatus.StatusCodes.OK,
//     success: true,
//     message: "Post fetched successfully",
//     data: result,
//   });
// });

// export const PostControllers = {
//   createPost,
//   getAllPosts,
//   getPostBySlug,
// };