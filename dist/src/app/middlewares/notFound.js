import httpStatus from "http-status-codes";
const notFound = (req, res) => {
    res
        .status(httpStatus.StatusCodes.NOT_FOUND)
        .json("Sorry, the requested resource was not found!");
};
export default notFound;
