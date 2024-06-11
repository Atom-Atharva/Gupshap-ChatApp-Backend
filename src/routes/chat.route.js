import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMembers,
    leaveGroup,
    getMessages,
    
    getChatDetails,
    renameGroup,
    changeGroupPicture,
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Secured Routes
router
    .route("/new-group")
    .post(verifyJWT, upload.single("avatar"), newGroupChat);
router.route("/my-chat").get(verifyJWT, getMyChats);
router.route("/my-chat/groups").get(verifyJWT, getMyGroups);
router.route("/add-members").put(verifyJWT, addMembers);
router.route("/remove-member").put(verifyJWT, removeMembers);
router.route("/leave-group/:id").delete(verifyJWT, leaveGroup);
router.route("/message/:id").get(verifyJWT, getMessages);
router
    .route("/changeGroupPicture/:id")
    .put(verifyJWT, upload.single("avatar"), changeGroupPicture);
router.route("/renameGroup/:id").put(verifyJWT, renameGroup);
// router""
//     .route("/:id")
//     .get(verifyJWT, getChatDetails)
//     .put(verifyJWT, renameGroup)
export default router;
