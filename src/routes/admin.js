const express = require('express');
const router = express.Router();

const { ensureAuthenticated,
    ensureAdmin } = require('../middlewares/user');

const { createEvent,
        retrieveEvents,
        retrieveEventById,
        updateEventById,
        deleteEventById,
        deleteAllEvents } = require('../controllers/admin');

// PATH     : /admin/event
// DESC     : Create event by admin
// RESPONSE : Message response after creating event
router.post('/event',ensureAuthenticated,
ensureAdmin, createEvent);

// PATH     : /admin/events
// DESC     : Get all events
// RESPONSE : Array containing all events
router.get('/events',ensureAuthenticated,
ensureAdmin, retrieveEvents);

// PATH     : /admin/event/:id
// DESC     : Get single event by id
// RESPONSE : Event json data
router.get('/event/:id',ensureAuthenticated,
ensureAdmin, retrieveEventById);

// PATH     : /admin/event/:id
// DESC     : Update event
// RESPONSE : Updated event data
router.put('/event/:id',ensureAuthenticated,
ensureAdmin, updateEventById);

// PATH     : /admin/event/:id
// DESC     : Delete event
// RESPONSE : Message after deleting event
router.delete('/event/:id',ensureAuthenticated,
ensureAdmin, deleteEventById);

// PATH     : /admin/events
// DESC     : Delete all events
// RESPONSE : Message after deleting all events
router.delete('/events',ensureAuthenticated,
ensureAdmin, deleteAllEvents);

module.exports = router;