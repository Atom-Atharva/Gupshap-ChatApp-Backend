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
    sendAttachments,
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
router
.route("/changeGroupPicture/:id")
.put(verifyJWT, upload.single("avatar"), changeGroupPicture);
router.route("/renameGroup/:id").put(verifyJWT, renameGroup);
router
.route("/send-attachment")
.post(verifyJWT, upload.array("files", 5), sendAttachments);
router.route("/get-message/:id").get(verifyJWT, getChatDetails);
router.route("/message/:id").get(verifyJWT, getMessages);
export default router;
