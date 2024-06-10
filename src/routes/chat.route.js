import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { newGroupChat,getMyChats,getMyGroups,addMembers,removeMembers,leaveGroup } from "../controllers/chat.controller.js";

const router = Router();

// Secured Routes
router.route("/new-group").post(verifyJWT, newGroupChat);
router.route("/my-chat").get(verifyJWT,getMyChats);
router.route("/my-chat/groups").get(verifyJWT,getMyGroups);
router.route("/addmembers").put(verifyJWT,addMembers);
router.route("/removemember").put(verifyJWT,removeMembers);
router.route("/leave-group/:id").delete(verifyJWT,leaveGroup);
// router.route("/message").post(upload.array("files", 5),sendattachements)


export default router;
