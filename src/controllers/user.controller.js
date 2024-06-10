import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";
import generateAccessAndRefreshToken from "../utils/generateAccessAndRefreshToken.js";

const registerUser = asyncHandler(async (req, res) => {
    // Take Avatar
    const avatarFilePath = req.file?.path;

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
    const avatar = await uploadOnCloudinary(avatarFilePath);
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

/**
 * Search User
 * Send Friend Request
 * Accept Friend Request
 * Get My Friends
 * Get My Profile
 * Get My Notification
 */

export { registerUser, logInUser, logoutUser };
