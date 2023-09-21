const express = require('express');
const router = express.Router();

const { createEvent,
        retrieveEvents,
        retrieveEventById,
        updateEventById,
        deleteEventById,
        deleteAllEvents } = require('../controllers/admin');

router.post('/event', createEvent);

router.get('/events', retrieveEvents);

router.get('/event/:id', retrieveEventById);

router.put('/event/:id', updateEventById);

router.delete('/event/:id', deleteEventById);

router.delete('/events', deleteAllEvents);

module.exports = router;