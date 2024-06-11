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
    deleteChat,
     getChatDetails,
     renameGroup

} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Secured Routes
router
    .route("/new-group")
    .post(verifyJWT, upload.single("avatar"), newGroupChat);
router.route("/my-chat").get(verifyJWT, getMyChats);
router.route("/my-chat/groups").get(verifyJWT, getMyGroups);
router.route("/addmembers").put(verifyJWT, addMembers);
router.route("/removemember").put(verifyJWT, removeMembers);
router.route("/leave-group/:id").delete(verifyJWT, leaveGroup);
// router.route("/message").post(upload.array("files", 5),sendattachements)
router.route("/message/:id").get(verifyJWT, getMessages);
router.route("/:id")
  .get(verifyJWT,getChatDetails)
  .put( verifyJWT,upload.single("picture"),renameGroup)
  .delete(verifyJWT,deleteChat);
export default router;
