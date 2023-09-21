const Event = require('../models/Event')

exports.createEvent = (req, res)=>{
    if(!req.body){
        return res.status(400).json({message: "Please fill all required fields!"})
    }
    const {eventName, eventDate, eventDescription, eventPrice, eventQuota} = req.body;

    const event = new Event({
        eventName: eventName,
        eventDate: eventDate,
        eventDescription: eventDescription,
        eventPrice: eventPrice,
        eventQuota: eventQuota
    });

    event.save().then(result=>{
        res.status(201).json({
            message: "Event created successfully!",
            event: result
        })
    }).catch(err=>{
        res.status(500).json({
            message: "Error creating event!",
            error: err
        })
    })
}

exports.retrieveEvents = (req, res)=>{
    Event.find().then(events=>{
        res.status(200).json({
            message: "Events retrieved successfully!",
            events: events
        })
    }).catch(err=>{
        res.status(500).json({
            message: "Error retrieving events!",
            error: err
        })
    })
}

exports.retrieveEventById = (req, res)=>{
    const {id} = req.params;

    Event.findById(id).then(event=>{
        if(!event){
           return res.status(404).json({
                message: "Event not found!"
            })

        }
        res.status(200).json({
            message: "Event retrieved successfully!",
            event: event
        })
    }).catch(err=>{
        res.status(500).json({
            message: "Error retrieving event!",
            error: err
        })
    })
}

exports.updateEventById = (req, res)=>{
    if(!req.body){
        return res.status(400).json({message: "Please fill all required fields!"})
    }
    const {id} = req.params;

    Event.findByIdAndUpdate(id,req.body).then(event=>{
        if(!event){
            return res.status(404).json({message: "Event not found!"})
        }

        res.status(200).json({
            message: "Event updated successfully!",
            event: event
        })
    }).catch(err=>{
        res.status(500).json({
            message: "Error updating event!",
            error: err
        })
    })

}

exports.deleteEventById = (req, res)=>{
    const {id} = req.params;

    Event.findByIdAndRemove(id).then(event=>{
        if(!event){
            return res.status(404).json({message: "Event not found!"})
        }

        res.status(200).json({
            message: "Event deleted successfully!",
            event: event
        })
    }).catch(err=>{  
        res.status(500).json({
            message: "Error deleting event!",
            error: err
        })
      })
}

exports.deleteAllEvents = (req, res)=>{ 
    Event.deleteMany().then(result=>{
        res.status(200).json({
            message: "All events deleted successfully!",
            result: result
        })
    }).catch(err=>{
        res.status(500).json({
            message: "Error deleting events!",
            error: err
        })
    })
}