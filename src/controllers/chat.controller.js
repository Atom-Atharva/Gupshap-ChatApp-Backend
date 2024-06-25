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

    const pictureURL = await uploadOnCloudinary(pictureFilePath, "group");
    if (!pictureURL) {
        throw new ApiError(500, "Avatar Failed To Upload On Cloudinary");
    }

    const allMembers = [...members, req.user._id];
    const group = await Chat.create({
        name,
        groupChat: true,
        creator: req.user,
        members: allMembers,
        avatar: {
            public_id: pictureURL.public_id,
            url: pictureURL.url,
        },
    });
    if (!group) {
        throw new ApiError(500, "Couldn't Create Group in DB!");
    }

    // console.log(group);

    const chatDetail = await Chat.findById(group._id)
        .populate("members", "name avatar")
        .populate("creator", "name avatar");

    // emitEvent(req, "ALERT", allMembers, `Welcome to ${name}`);
    // emitEvent(req, "REFETCH_CHATS", members);

    return res
        .status(201)
        .json(new ApiResponse(201, chatDetail, "Group Chat Created"));
});

const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({
        members: req.user._id,
    })
        .populate("members", "name avatar")
        .populate("creator", "name");
    const transformedChats = chats.map(
        ({ _id, name, members, groupChat, avatar, creator }) => {
            const otherMember = members.find(
                (member) => member._id.toString() !== req.user._id.toString()
            );

            return {
                _id,
                groupChat,
                avatar: groupChat ? avatar : otherMember.avatar,
                name: groupChat ? name : otherMember.name,
                members: groupChat
                    ? members
                    : members.reduce((prev, curr) => {
                          if (curr._id.toString() !== req.user._id.toString()) {
                              prev.push(curr);
                          }
                          return prev;
                      }, []),
                creator,
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
    })
        .populate("members", "name avatar")
        .populate("creator", "name");
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
        throw new ApiError(403, "You are not allowed to add the participants");
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
    // emitEvent(
    //     req,
    //     "ALERT",
    //     chat.members,
    //     `${allUsersname} has been added in the group`
    // );

    // emitEvent(req, "REFETCH_CHATS", chat.members);

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
    if (!files) {
        throw new ApiError(400, "Please Upload Attachments");
    }
    const filesPaths = files.map((file) => file.path);

    const chat = await Chat.findById(chatId);

    if (!chat) {
        filesPaths.map((file) => {
            fs.unlinkSync(file);
        });
        throw new ApiError(404, "Chat not found");
    }

    // Upload files here
    const attachmentsPromises = filesPaths.map(async (filePath) => {
        try {
            return await uploadOnCloudinary(filePath, "attachments");
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
        .json(new ApiResponse(200, {}, "Message Send Successfully"));
});

const getChatDetails = asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.id)
        .populate("members", "name avatar")
        .populate("creator", "name avatar");
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, chat, "Chat Details Fetched!"));
});

const getMessages = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    const { page = 1 } = req.query;
    const resultPerPage = 20;

    const skip = (page - 1) * resultPerPage;
    const [messages, totalMessagesCount] = await Promise.all([
        await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(resultPerPage)
            .populate("sender", "name")
            .lean(),
        await Message.countDocuments({ chat: chatId }),
    ]);

    const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

    const data = { messages: messages.reverse(), totalPages: totalPages };

    return res.status(200).json(new ApiResponse(200, data, "Messages Fetched"));
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
    const pictureURL = await uploadOnCloudinary(pictureFilePath, "group");
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
