const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar:{
            type:String
        },
        status:{
            type:Number,
            default:3
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("users", userSchema);
