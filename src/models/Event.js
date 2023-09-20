const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
    {
        eventName: {
            type: String,
            required: true
        },
        eventDate: {
            type: String,
            required: true
        },
        eventDescription: {
            type: String,
            required: true
        },
        eventPrice: {
            type: Number,
            required: true
        },
        eventQuota: {
            type: Number,
            required: true
        },
    },
);

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;