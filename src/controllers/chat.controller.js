import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";

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
                if (curr._id.toString() !== req.user.toString()) {
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
        members: req.useer,
        groupChat: true,
        creator: req.user,
    }).populate("members", "name avatar");
    const groups = chats.map(({ members, _id, groupChat, name }) => ({
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));
    return res.status(200).json(new ApiResponse(200, groups, "Group Retrieved sucessfully"));
});

export { newGroupChat, getMyChats, getMyGroups };
