const express = require('express');
const router = express.Router();

const { ensureAuthenticated,
        ensureAdmin } = require('../middlewares/user');

const { uploadImage } = require('../middlewares/files');

const { createEvent,
        updateEventById,
        deleteEventById,
        deleteAllEvents,
        getUserById } = require('../controllers/admin');

const { userRegisteredOnEvent,
        userRegistered,
        uploadEventImage } = require('../controllers/event');

// PATH     : /admin/event
// DESC     : Create event by admin
// RESPONSE : Message response after creating event
router.post('/event', ensureAuthenticated, ensureAdmin, createEvent);

// PATH     : /admin/event/:id
// DESC     : Update event
// RESPONSE : Updated event data
router.put('/event/:id', ensureAuthenticated, ensureAdmin, updateEventById);

// PATH     : /admin/event/:id
// DESC     : Delete event
// RESPONSE : Message after deleting event
router.delete('/event/:id', ensureAuthenticated, ensureAdmin, deleteEventById);

// PATH     : /admin/events
// DESC     : Delete all events
// RESPONSE : Message after deleting all events
router.delete('/events', ensureAuthenticated, ensureAdmin, deleteAllEvents);

// PATH     : /admin/user/:userId
// DESC     : Get user by id
// RESPONSE : User json data
router.get('/user/:id', ensureAuthenticated, ensureAdmin, getUserById);

// PATH     : /admin/user/events
// DESC     : Get all user events
// RESPONSE : Array containing all user events
router.get('/user/event/:eventId', ensureAuthenticated, ensureAdmin, userRegisteredOnEvent);

// PATH     : /admin/user/events
// DESC     : Get all user events
// RESPONSE : Array containing all user events
router.get('/events', ensureAuthenticated, ensureAdmin, userRegistered);

// PATH     : /admin/event/image
// DESC     : Upload event image
// RESPONSE : Uploaded image data
router.post('/event/image', ensureAuthenticated, ensureAdmin, uploadImage.single("eventImage"), uploadEventImage);

module.exports = router;