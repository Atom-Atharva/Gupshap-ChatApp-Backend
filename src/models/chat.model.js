import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        groupChat: {
            type: Boolean,
            default: false,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);
export const Chat = mongoose.model("Chat", chatSchema);
