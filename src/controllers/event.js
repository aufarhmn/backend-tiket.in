const UserEvent = require("../models/UserEvent");
const Event = require("../models/Event");

exports.userRegisteredOnEvent = (req, res) => {
    const eventId = req.params.eventId;

    Event.findById(eventId)
        .select("-_id eventName eventDescription")
        .then((event) => {
            if (!event) {
                return res.status(404).json({
                    message: "Event not found!",
                });
            }

            UserEvent.find({ eventId: eventId })
                .select("-_id userId code paymentFile qrCode status")
                .populate("userId", "name email")
                .then((userEvents) => {
                    if (userEvents.length === 0) {
                        return res.status(404).json({
                            message: "No user events found for this eventId",
                        });
                    }

                    const modifiedUserEvents = userEvents.map((userEvent) => {
                        const modifiedUserEvent = {
                            ...userEvent.userId.toObject(),
                            ...userEvent.toObject(),
                        };
                        delete modifiedUserEvent.userId;
                        return modifiedUserEvent;
                    });

                    res.status(200).json({
                        message: "User events retrieved successfully!",
                        eventDetail: event,
                        userDetails: modifiedUserEvents,
                        totalUserRegistered: modifiedUserEvents.length,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        message: "Error retrieving user events!",
                        error: err,
                    });
                });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving event!",
                error: err,
            });
        });
};

exports.userRegistered = (req, res) => {
    UserEvent.find()
        .select("-_id userId eventId code paymentFile qrCode status")
        .populate("userId", "name email")
        .populate("eventId", "eventName eventDescription")
        .then((userEvents) => {
            if (userEvents.length === 0) {
                return res.status(404).json({
                    message: "No user events found!",
                });
            }

            res.status(200).json({
                message: "User events retrieved successfully!",
                userEvents: userEvents,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user events!",
                error: err,
            });
        });
}