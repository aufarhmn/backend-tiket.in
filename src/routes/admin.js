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

router.post('/event',ensureAuthenticated,
ensureAdmin, createEvent);

router.get('/events',ensureAuthenticated,
ensureAdmin, retrieveEvents);

router.get('/event/:id',ensureAuthenticated,
ensureAdmin, retrieveEventById);

router.put('/event/:id',ensureAuthenticated,
ensureAdmin, updateEventById);

router.delete('/event/:id',ensureAuthenticated,
ensureAdmin, deleteEventById);

router.delete('/events',ensureAuthenticated,
ensureAdmin, deleteAllEvents);

module.exports = router;