import { Request, Response } from "express";
import Event, { IEvent, Status } from "../model/eventModel";

// create new event function
export const createEvent = async (req: Request, res: Response) => {
    try {
        const { userId, title, type, date, time, location, description, image } = req.body

        // new Event object based on req data
        const newEvent = new Event({
            userId,
            title,
            type,
            date,
            time,
            location,
            description,
            image,
            status: Status.PLANNING,
        })
        await newEvent.save()

        res.status(201).json({
            message: "Event created successfully.."
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })
    }
}

// get all events function
export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find()
    } catch (err) {

    }
}