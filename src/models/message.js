const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "channels",
            required: true,
        },
        receivers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "users",
        },
        message: {
            type: String,
            default: null
        },
        uploadfiles: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'files',
            default: []
        },
        mention: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'users',
            default: []
        },
        emoticons: [
            {
                creator: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                },
                code: {
                    type: String
                }
            }
        ],
        isPined: [
            {
                state: { type: Boolean },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    require: true
                }
            }],
        isdraft: {
            type: Boolean,
            default: false
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages",
            default: null
        },
        isDMS: {
            type: Boolean, default: false
        },
        childCount: { type: Number, default: 0 }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("messages", messageSchema);
