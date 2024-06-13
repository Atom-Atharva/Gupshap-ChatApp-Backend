import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        content: String,
        attachments: [
            {
                public_id: {
                    type: String,
                },
                url: {
                    type: String,
                },
            },
        ],
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
export const Message = mongoose.model("Message", messageSchema);
