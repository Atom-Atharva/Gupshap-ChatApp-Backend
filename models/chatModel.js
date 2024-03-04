import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
    {
        chatName: {
            type: String,
            required: true,
        },
        isGroupChat: {
            type: Boolean,
            required: true,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamp: true,
    }
);
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
