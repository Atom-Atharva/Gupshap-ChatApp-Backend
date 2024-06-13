import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(400, "Unauthorized Token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            throw new ApiError(400, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(500, `Error While Verifying Token: ${error}`);
    }
});

export const verifyJWTSocket = async (socket, next) => {
    try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies?.accessToken || null;

        if (!token) {
            throw new ApiError(400, "Unauthorized Token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            throw new ApiError(400, "Invalid Access Token");
        }

        socket.user = user;
        next();
    } catch (error) {
        throw new ApiError(500, `Error While Verifying Token: ${error}`);
    }
};
