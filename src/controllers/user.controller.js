import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";
import generateAccessAndRefreshToken from "../utils/generateAccessAndRefreshToken.js";
import { Chat } from "../models/chat.model.js";
import { Request } from "../models/request.model.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

// 3P Authentication
const googleAuth = asyncHandler(async (req, res) => {
    // Get Code from Body
    const { code } = req.body;
    // console.log(code);
    if (!code) {
        throw new ApiError(400, "Authorize Code not Found!");
    }

    // Convert Code to Access Token
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CLIENT_REDIRECT_URI
    );

    const { tokens } = await client.getToken(code);
    if (!tokens) {
        throw new ApiError(400, "Failed to get Tokens!");
    }

    // console.log("working");
    const accessToken = tokens.access_token;

    if (!accessToken) {
        throw new ApiError(400, "Failed to Fetch Access Token");
    }

    // Obtain Information from Access Token
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check if Existing User
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingUser._id);

        const user = await User.findById(existingUser._id).select(
            "-password -refreshToken"
        );
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, user, "Google Auth Successfull"));
    }

    // Save Information in Data Base
    const user = await User.create({
        email: payload.email,
        isOauth2User: true,
        name: payload.name,
        avatar: {
            public_id: payload.picture,
            url: payload.picture,
        },
    });
    const newTokens = await generateAccessAndRefreshToken(user._id);
    const accessTokenAuth = newTokens.accessToken;
    const refreshTokenAuth = newTokens.refreshToken;

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while Registering User");
    }

    // Return User and cookies to Frontend
    return res
        .status(200)
        .cookie("accessToken", accessTokenAuth, options)
        .cookie("refreshToken", refreshTokenAuth, options)
        .json(new ApiResponse(200, createdUser, "User Registered via Google!"));
});

const githubAuth = asyncHandler(async (req, res) => {
    // Get Code From body
    const { code } = req.body;
    // console.log(code);

    // Exchange with Access Token
    const response = await axios.post(
        process.env.GITHUB_GET_ACCESS_TOKEN,
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
        },
        {
            headers: {
                accept: "application/json",
            },
        }
    );
    if (!response?.data?.access_token) {
        console.log(response.data);
        throw new ApiError(
            500,
            `Couldn't Fetch Access Token: ${response.data.error}`
        );
    }
    const token = response?.data?.access_token;
    if (!token) {
        throw new ApiError(500, "Failed To Get Access Token");
    }

    // With Token Get User Info
    const userInfo = await axios.get(process.env.GITHUB_GET_USER_INFO, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!userInfo) {
        throw new ApiError(500, "Failed To GET user info.");
    }
    // console.log(userInfo);
    if (!userInfo?.data?.email) {
        throw new ApiError(400, "Your Email is NOT Public on GITHUB!");
    }

    // Check if Already Existed
    const existedUser = await User.findOne({ email: userInfo?.data?.email });
    if (existedUser) {
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existedUser._id);

        const user = await User.findById(existedUser._id).select(
            "-password -refreshToken"
        );

        console.log("accessToken: " + accessToken, refreshToken);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, user, "Github Auth Successfull"));
    }
    // Else Save in DB
    // Save Information in Data Base
    const user = await User.create({
        email: userInfo.data.email,
        isOauth2User: true,
        name: userInfo.data.name,
        avatar: {
            public_id: userInfo.data.avatar_url,
            url: userInfo.data.avatar_url,
        },
    });
    const tokens = await generateAccessAndRefreshToken(user._id);
    const accessTokenAuth = tokens.accessToken;
    const refreshTokenAuth = tokens.refreshToken;

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while Registering User");
    }

    // Return User and cookies to Frontend
    return res
        .status(200)
        .cookie("accessToken", accessTokenAuth, options)
        .cookie("refreshToken", refreshTokenAuth, options)
        .json(new ApiResponse(200, createdUser, "User Registered via Github!"));
});

const registerUser = asyncHandler(async (req, res) => {
    // Take Avatar
    const avatarFilePath = req.file?.path;
    // console.log(req.file);

    // Check if Present
    if (!avatarFilePath) {
        throw new ApiError(400, "Avatar File is Required");
    }

    // Take Body
    const { email, name, password } = req.body;

    // Validate Form
    if (!email) {
        fs.unlinkSync(avatarFilePath);
        throw new ApiError(400, "Email is Required");
    }
    if (!name) {
        fs.unlinkSync(avatarFilePath);
        throw new ApiError(400, "Name is Required");
    }
    if (!password) {
        fs.unlinkSync(avatarFilePath);
        throw new ApiError(400, "Password is Required");
    }

    // Existing User?
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        fs.unlinkSync(avatarFilePath);
        throw new ApiError(400, "User Email Already Exist");
    }
    const existingName = await User.findOne({ name: name });
    if (existingName) {
        fs.unlinkSync(avatarFilePath);
        throw new ApiError(400, "User Name Already Exist");
    }

    // Upload On Cloudinary
    const avatar = await uploadOnCloudinary(avatarFilePath, "profile");
    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required");
    }

    // Pick URL and Public Id
    const avatarURL = avatar.url;
    const avatarPublicId = avatar.public_id;

    const user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
        avatar: {
            public_id: avatarPublicId,
            url: avatarURL,
        },
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while Registering User");
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, createdUser, "User Registered!"));
});

const logInUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is Required");
    }
    if (!password) {
        throw new ApiError(400, "Password is Required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User Not Registered");
    }

    const isPasswordMatch = await user.isPasswordCorrect(password);
    if (!isPasswordMatch) {
        throw new ApiError(400, "Password is Incorrect");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
        user._id
    );
    // console.log(refreshToken, accessToken);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "Logged In Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: { refreshToken: 1 },
        },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password -refreshToken -isOauth2User"
    );
    if (!users) {
        throw new ApiError("400", "Error Finding Users!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "All Users Found!"));
});

const getMyProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "User Not Authenticated");
    }

    return res.status(200).json(new ApiResponse(200, user, "User Fetched!"));
});

const getMyFriends = asyncHandler(async (req, res) => {
    const chats = await Chat.find({
        groupChat: false,
        members: req.user._id,
    });

    if (!chats) {
        throw new ApiError(400, "Error While Finding Friends!");
    }

    const friends = await Promise.all(
        chats.map(async (chat) => {
            const friend = chat.members.find((member) => {
                return member._id.toString() !== req.user._id.toString();
            });

            const friendUser = await User.findById({ _id: friend._id }).select(
                "-password -refreshToken -isOauth2User"
            );
            if (!friendUser) {
                throw new ApiError(500, "Friend User ID Not Found!");
            }

            return friendUser;
        })
    );

    return res
        .status(200)
        .json(new ApiResponse(200, friends, "Friends List Fetched"));
});

const getMyNotfications = asyncHandler(async (req, res) => {
    const requests = await Request.find({ receiver: req.user._id }).populate({
        path: "sender",
        select: "_id name avatar",
    });
    if (!requests) {
        throw new ApiError(400, "Error While Fetching Requests");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, requests, "Notifications Fetched!"));
});

const sendFriendRequest = asyncHandler(async (req, res) => {
    const receiver = req.body.receiver;

    // If Friend Exist
    const chat = await Chat.find({
        groupChat: false,
        members: { $all: [req.user._id, receiver] },
    });
    console.log(chat);
    if (chat.length > 0) {
        throw new ApiError(400, "User is Already Friend.");
    }

    // If Request Exist
    const request = await Request.find({
        $or: [
            { $and: [{ receiver: receiver }, { sender: req.user._id }] },
            { $and: [{ receiver: req.user._id }, { sender: receiver }] },
        ],
    });

    if (request.length > 0) {
        throw new ApiError(400, "Request Already Exist");
    }

    const newRequest = await Request.create({
        sender: req.user._id,
        receiver: receiver,
    });
    if (!newRequest) {
        throw new ApiError(400, "Failed To Create Request");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Request Send Successfully."));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { accept, requestId, sender } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
        throw new ApiError(400, "Request Not Found!");
    }

    if (accept === "true") {
        const members = [req.user._id, sender];
        const chat = await Chat.create({
            members,
            creator: sender,
            name: `${sender}-${req.user.name}`,
        });

        if (!chat) {
            throw new ApiError(400, "Couldn't Add Friend");
        }

        await Request.deleteOne({ _id: requestId });

        return res.status(200).json(new ApiResponse(200, {}, "Friend Added."));
    } else {
        await Request.deleteOne({ _id: requestId });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Request Rejected."));
    }
});

export {
    registerUser,
    logInUser,
    logoutUser,
    getAllUser,
    getMyProfile,
    getMyFriends,
    getMyNotfications,
    sendFriendRequest,
    acceptFriendRequest,
    googleAuth,
    githubAuth,
};
