const Event = require("../models/Event");
const User = require("../models/user");

exports.createEvent = (req, res) => {
    const { eventName, eventDate, eventDescription, eventPrice, eventQuota } =
        req.body;

    if (
        !req.body.eventName ||
        !req.body.eventDate ||
        !req.body.eventDescription ||
        !req.body.eventPrice ||
        !req.body.eventQuota
    ) {
        return res
            .status(400)
            .json({ message: "Please fill all required fields!" });
    }

    const event = new Event({
        eventName: eventName,
        eventDate: eventDate,
        eventDescription: eventDescription,
        eventPrice: eventPrice,
        eventQuota: eventQuota,
    });

    event
        .save()
        .then((result) => {
            res.status(201).json({
                message: "Event created successfully!",
                event: result.content,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error creating event!",
                error: err,
            });
        });
};

exports.retrieveEvents = (req, res) => {
    Event.find()
        .then((events) => {
            res.status(200).json({
                message: "Events retrieved successfully!",
                events: events,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving events!",
                error: err,
            });
        });
};

exports.retrieveEventById = (req, res) => {
    const { id } = req.params;
    Event.findById(id)
        .then((event) => {
            if (!event) {
                return res.status(404).json({
                    message: "Event not found!",
                });
            } else {
                res.status(200).json({
                    message: "Event retrieved successfully!",
                    event: event,
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving event!",
            });
        });
};

exports.updateEventById = (req, res) => {
    const { id } = req.params;

    const allowedFields = [
        "eventName",
        "eventDate",
        "eventDescription",
        "eventPrice",
        "eventQuota",
    ];

    const updatedFields = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updatedFields[field] = req.body[field];
        }
    }

    if (Object.keys(updatedFields).length === 0) {
        return res
            .status(400)
            .json({ message: "No valid fields provided for update!" });
    }

    Event.findByIdAndUpdate(id, { $set: updatedFields }, { new: true })
        .then((event) => {
            if (!event) {
                return res.status(404).json({ 
                    message: "Event not found!" 
                });
            }
            
            res.status(200).json({
                message: "Event updated successfully!",
                event: event,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error updating event!",
                error: err,
            });
        });
};

exports.deleteEventById = (req, res) => {
    const { id } = req.params;

    Event.findByIdAndRemove(id)
        .then((event) => {
            if (!event) {
                return res.status(404).json({ message: "Event not found!" });
            }

            res.status(200).json({
                message: "Event deleted successfully!",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error deleting event!",
            });
        });
};

exports.deleteAllEvents = (req, res) => {
    Event.deleteMany()
        .then((result) => {
            res.status(200).json({
                message: "All events deleted successfully!",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error deleting events!",
            });
        });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;

    User.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ 
                    message: "User not found!",
                    user: user,
                });
            }

            res.status(200).json({
                message: "User retrieved successfully!",
                user: user,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user!",
            });
        });
};