import jwt from "jsonwebtoken";
// 1. Generate Token
export const generateToken = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
};
export const verifyToken = (token, secret, options) => {
    try {
        return jwt.verify(token, secret, options);
    }
    catch (error) {
        console.error(error);
        return null;
    }
};
