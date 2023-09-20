const mongoose = require('mongoose');

const UserEventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        },
        code: {
            type: String,
            required: true
        },
        paymentFile: {
            type: String,
            default: ""
        },
        qrCode: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: "SUBMITTED"
        }
    },
);

const UserEvent = mongoose.model("UserEvent", UserEventSchema);

module.exports = UserEvent;