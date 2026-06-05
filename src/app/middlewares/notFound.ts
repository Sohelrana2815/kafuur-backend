import { Request, Response } from "express";
import httpStatus from "http-status-codes";

const notFound = (req: Request, res: Response) => {
  res
    .status(httpStatus.StatusCodes.NOT_FOUND)
    .json("Sorry, the requested resource was not found!");
};
export default notFound;