const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        profilePhoto: {
            type: String,
            default: ""
        },
    },
);

const User = mongoose.model("User", UserSchema);

module.exports = User;