import mongoose, { mongo } from "mongoose";

const messageModelSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            trim: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
        },
    },
    {
        timeStamp: true,
    }
);

const Message = mongoose.model("Message", messageModelSchema);

module.exports = Message;
