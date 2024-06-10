import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

const newGroupChat = asyncHandler(async (req, res) => {
    const { name, members } = req.body;
    if (!name) {
        throw new ApiError(400, "Group Name is Required");
    }
    if (members.length < 2) {
        throw new ApiError(400, "Group Chat must have atleast 3 members");
    }

    const allMembers = [...members, req.user._id];
    await Chat.create({
        name,
        groupChat: true,
        creator: req.user,
        members: allMembers,
    });
    return res.status(201).json(new ApiResponse(201, {}, "Group Chat Created"));
});

const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ members: req.user._id }).populate(
        "members",
        "name avatar"
    );
    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
        const otherMember = members.find(
            (member) => member._id.toString() !== req.user._id.toString()
        );

        return {
            _id,
            groupChat,
            avatar: groupChat
                ? members.slice(0, 3).map(({ avatar }) => avatar.url)
                : [otherMember.avatar.url],
            name: groupChat ? name : otherMember.name,
            members: members.reduce((prev, curr) => {
                if (curr._id.toString() !== req.user._id.toString()) {
                    prev.push(curr._id);
                }
                return prev;
            }, []),
        };
    });
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
        creator: req.user._id,
    }).populate("members", "name avatar");
    const groups = chats.map(({ members, _id, groupChat, name }) => ({
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));
    return res
        .status(200)
        .json(new ApiResponse(200, groups, "Group Retrieved sucessfully"));
});
const addMembers = asyncHandler(async (req, res) => {
    const { chatId, members } = req.body;
    if (!members || members.length < 1) {
        throw new ApiError(400, "please provide members");
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

    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);
    const uniqueMembers = allNewMembers
        .filter((i) => !chat.members.includes(i._id.toString()))
        .map((i) => i._id);

    chat.members.push(...uniqueMembers);
    if (chat.members.length > 100) {
        throw new ApiError(400, "Group Members limit reached");
    }
    await chat.save();
    const allUsersname = allNewMembers.map((i) => i.name).join(",");
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Members added sucessfully"));
});
const removeMembers = asyncHandler(async (req, res) => {
    const { userId, chatId } = req.body;
    const [chat, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "name"),
    ]);
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.groupChat) {
        throw new ApiError(404, "This is not a group Chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to remove the participants");
    }
    if (chat.members.length <= 3) {
        throw new ApiError(400, "Group must have atleast 3 members");
    }
    chat.members = chat.members.filter(
        (member) => member.toString() !== userId.toString()
    );
    await chat.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Members removed sucessfully"));
});
const leaveGroup = asyncHandler(async (req, res) => {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.groupChat) {
        throw new ApiError(404, "This is not a group Chat");
    }
    const remainingMembers = chat.members.filter(
        (member) => member.toString() != req.user.toString()
    );
    if (chat.creator.toString() == req.user._id.toString()) {
        const newCreator = remainingMembers[0];
        chat.creator = newCreator;
    }
    chat.members = remainingMembers;
    const [user] = await Promise.all([
        User.findById(req.user, "name"),
        chat.save(),
    ]);
    await chat.save();
});

export {
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMembers,
    leaveGroup,
};
