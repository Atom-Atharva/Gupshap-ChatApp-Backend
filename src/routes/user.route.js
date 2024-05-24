import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    logInUser,
    logoutUser,
    registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(logInUser);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
