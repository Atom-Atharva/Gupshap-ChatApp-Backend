import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { emitEvent } from "../utils/emitEvent.js";

const newGroupChat = asyncHandler(async (req, res) => {
    const pictureFilePath = req.file?.path;
    if (!pictureFilePath) {
        throw new ApiError(400, "Picture Not Uploaded");
    }

    const { name, members } = req.body;
    if (!name) {
        fs.unlinkSync(pictureFilePath);
        throw new ApiError(400, "Group Name is Required");
    }
    if (members.length < 2) {
        fs.unlinkSync(pictureFilePath);
        throw new ApiError(400, "Group Chat must have atleast 3 members");
    }

    const pictureURL = await uploadOnCloudinary(pictureFilePath);
    if (!pictureURL) {
        throw new ApiError(500, "Avatar Failed To Upload On Cloudinary");
    }

    const allMembers = [...members, req.user._id];
    await Chat.create({
        name,
        groupChat: true,
        creator: req.user,
        members: allMembers,
        avatar: {
            public_id: pictureURL.public_id,
            url: pictureURL.url,
        },
    });

    emitEvent(req, "ALERT", allMembers, `Welcome to ${name}`);
    emitEvent(req, "REFETCH_CHATS", members);

    return res.status(201).json(new ApiResponse(201, {}, "Group Chat Created"));
});

const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ members: req.user._id }).populate(
        "members",
        "name avatar"
    );
    const transformedChats = chats.map(
        ({ _id, name, members, groupChat, avatar }) => {
            const otherMember = members.find(
                (member) => member._id.toString() !== req.user._id.toString()
            );

            return {
                _id,
                groupChat,
                avatar: groupChat ? avatar : [otherMember.avatar],
                name: groupChat ? name : otherMember.name,
                members: members.reduce((prev, curr) => {
                    if (curr._id.toString() !== req.user._id.toString()) {
                        prev.push(curr._id);
                    }
                    return prev;
                }, []),
            };
        }
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                transformedChats,
                "Chat Retrieved Successfully"
            )
        );
});

const getMyGroups = asyncHandler(async (req, res) => {
    const chats = await Chat.find({
        members: req.user._id,
        groupChat: true,
    }).populate("members", "name avatar");
    const groups = chats.map(
        ({ members, _id, groupChat, name, avatar, creator }) => ({
            _id,
            groupChat,
            name,
            avatar: avatar,
            members,
            creator,
        })
    );
    return res
        .status(200)
        .json(new ApiResponse(200, groups, "Group Retrieved sucessfully"));
});

const addMembers = asyncHandler(async (req, res) => {
    const { chatId, member } = req.body;
    if (!member) {
        throw new ApiError(400, "Please Select User!");
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.groupChat) {
        throw new ApiError(404, "This is not a group Chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
        throw new CError(403, "You are not allowed to add the participants");
    }

    // Check if Member is Present in Chat
    if (chat.members.includes(member.toString())) {
        throw new ApiError(400, "Member Already Present in Group");
    }

    // Add New Member
    chat.members.push(member);

    if (chat.members.length > 100) {
        throw new ApiError(400, "Group Members limit reached");
    }
    await chat.save();

    const allUsersname = allNewMembers.map((i) => i.name).join(",");
    emitEvent(
        req,
        "ALERT",
        chat.members,
        `${allUsersname} has been added in the group`
    );

    emitEvent(req, "REFETCH_CHATS", chat.members);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Member added sucessfully"));
});

const removeMembers = asyncHandler(async (req, res) => {
    const { userId, chatId } = req.body;
    const [chat, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId),
    ]);
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.groupChat) {
        throw new ApiError(404, "This is not a group Chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to remove the participants"
        );
    }
    if (!userThatWillBeRemoved) {
        throw new ApiError(404, "User not found");
    }
    if (chat.members.length <= 3) {
        throw new ApiError(400, "Group must have atleast 3 members");
    }
    if (!chat.members.includes(userId.toString())) {
        throw new ApiError(404, "User Not in Group");
    }

    chat.members = chat.members.filter(
        (member) => member.toString() !== userId.toString()
    );
    await chat.save();

    emitEvent(req, ALERT, chat.members, {
        message: `${userThatWillBeRemoved.name} has been removed from the group`,
        chatId,
    });

    emitEvent(req, REFETCH_CHATS, allChatMembers);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Member removed sucessfully"));
});

const leaveGroup = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    if (!chatId) {
        throw new ApiError(404, "ChatId Required");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.groupChat) {
        throw new ApiError(404, "This is not a group Chat");
    }
    if (!chat.members.includes(req.user._id.toString())) {
        throw new ApiError(404, "User Not in Group");
    }

    const remainingMembers = chat.members.filter(
        (member) => member.toString() != req.user._id.toString()
    );

    if (chat.creator.toString() == req.user._id.toString()) {
        const newCreator = remainingMembers[0];
        chat.creator = newCreator;
    }
    chat.members = remainingMembers;
    await chat.save();

    const [user] = await Promise.all([User.findById(req.user), chat.save()]);
    emitEvent(req, ALERT, chat.members, {
        chatId,
        message: `User ${user.name} has left the group`,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Group left sucessfully"));
});

const sendAttachments = asyncHandler(async (req, res) => {
    const { chatId } = req.body;

    const files = req.files || [];

    if (files.length < 1) throw new ApiError(400, "Please Upload Attachments");

    if (files.length > 5) throw new ApiError(400, "Not More Than 5 Files");

    const chat = await Chat.findById(chatId);

    if (!chat) throw new ApiError(404, "Chat not found");

    // Upload files here
    const attachmentsPromises = files.map(async (filePath) => {
        try {
            return await uploadOnCloudinary(filePath);
        } catch (error) {
            throw new ApiError(500, `Couldn't upload A File! ${error}`);
        }
    });
    
    const uploadedFiles = await Promise.all(attachmentsPromises);
    if (!uploadedFiles) {
        throw new ApiError(500, `Couldn't upload Files! ${error}`);
    }
    const messageForDB = {
        content: "",
        attachments: uploadedFiles,
        sender: req.user._id,
        chat: chatId,
    };

    const message = await Message.create(messageForDB);
    if (!message) throw new ApiError(500, "Failed to Store Attachment(s)");

    return res
        .status(200)
        .json(new ApiResponse(200, message, "Message Send Successfully"));
});

const getChatDetails = asyncHandler(async (req, res) => {
    if (req.query.populate === "true") {
        const chat = await Chat.findById(req.param.id)
            .populate("members", "name avatar")
            .lean();
        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }
        chat.members = chat.members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
        }));
        return res.status(200).json(new ApiResponse(200, chat, ""));
    } else {
        const chat = await Chat.findById(req.param.id);
        if (!chat) throw new ApiError(404, "Chat not found");

        return res.status(200).json(new ApiResponse(200, chat, ""));
    }
});

const getMessages = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    const { page = 1 } = req.query;
    const resultPerPage = 20;

    const skip = (page - 1) * resultPerPage;
    const [messages, totalMessagesCount] = await Promise.all([
        Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(resultPerPage)
            .populate("sender", "name")
            .lean(),
        Message.countDocuments({ chat: chatId }),
    ]);
    const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

    return res.status(200).json({
        success: true,
        messages: messages.reverse(),
        totalPages,
    });
});

const renameGroup = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    const { name } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found");
    if (!chat.groupChat) throw new ApiError(404, "This is not a group chat");
    if (chat.creator.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to rename the group");
    }

    chat.name = name;

    await chat.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "Group renamed sucessfully"));
});

const changeGroupPicture = asyncHandler(async (req, res) => {
    const pictureFilePath = req.file?.path;
    if (!pictureFilePath) {
        throw new ApiError(400, "Picture Not Uploaded!");
    }

    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) {
        fs.unlinkSync(pictureFilePath);
        throw new ApiError(400, "Invalid Group");
    }
    if (!chat.groupChat) {
        fs.unlinkSync(pictureFilePath);
        throw new ApiError(404, "This is not a group chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
        fs.unlinkSync(pictureFilePath);
        throw new ApiError(403, "You are not allowed to change the group icon");
    }
    const pictureURL = await uploadOnCloudinary(pictureFilePath);
    if (!pictureURL) {
        throw new ApiError(500, "Picture Not Uploaded on Cloudinary");
    }
    const olderAvatar = { ...chat.avatar };

    chat.avatar = {
        public_id: pictureURL.public_id,
        url: pictureURL.url,
    };

    await chat.save();

    const deleteAvatar = await deleteFromCloudinary(olderAvatar.public_id);
    if (!deleteAvatar) {
        throw new ApiError(500, "Failed to Delete Older Profile Picture.");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Picture Updated."));
});

export {
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMembers,
    renameGroup,
    leaveGroup,
    getChatDetails,
    getMessages,
    changeGroupPicture,
    sendAttachments,
};
