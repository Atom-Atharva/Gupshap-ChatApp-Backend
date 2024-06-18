import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    acceptFriendRequest,
    getAllUser,
    getMyFriends,
    getMyNotfications,
    getMyProfile,
    githubAuth,
    googleAuth,
    logInUser,
    logoutUser,
    registerUser,
    sendFriendRequest,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(logInUser);
router.route("/auth/google").post(googleAuth);
router.route("/auth/github").post(githubAuth);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getAllUser").get(verifyJWT, getAllUser);
router.route("/getMyProfile").get(verifyJWT, getMyProfile);
router.route("/getMyFriends").get(verifyJWT, getMyFriends);
router.route("/getMyNotifications").get(verifyJWT, getMyNotfications);
router.route("/sendFriendRequest").post(verifyJWT, sendFriendRequest);
router.route("/acceptFriendRequest").post(verifyJWT, acceptFriendRequest);

export default router;
