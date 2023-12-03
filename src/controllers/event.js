const UserEvent = require("../models/UserEvent");
const Event = require("../models/Event");
const { drive } = require("../config/drive");
const { Readable } = require("stream");

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

exports.uploadEventImage = (req, res) => {
    const id = req.query.eventId;

    Event.findById(id)
        .then(async (result) => {
            let fileBuffer = Readable.from([req.file.buffer]);

            if (!result) {
                return res.status(404).json({
                    message: "result not found!",
                });
            } else if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded!",
                });
            } else {
                try {
                    const fileMetadata = {
                        name: id + "-" + Date.now(),
                        parents: ["1jGDte8_oUWLYy25UXX2vpTrXMYmgPBZC"],
                    };

                    const media = {
                        mimeType: "image/jpeg" || "image/png" || "image/jpg",
                        body: fileBuffer,
                    };

                    const response = await drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: "id",
                    });

                    await drive.permissions.create({
                        fileId: response.data.id,
                        requestBody: {
                            role: "reader",
                            type: "anyone",
                        },
                    });

                    result.eventPhoto = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

                    await result.save()

                    .then((result) =>{
                        res.status(200).json({
                            message: "Photo updated successfully!",
                            paymentFile: result.paymentFile,
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: "Error updating photo!",
                            error: err,
                        });
                    });
                } catch (err) {
                    console.error("Error updating photo:", err);
                    res.status(500).json({
                        message: "Error updating photo",
                        error: err,
                    });
                }
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving event!",
                error: err,
            });
        });
};