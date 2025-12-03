import { Request, Response } from "express";
import Event from "../model/eventModel";
import Booking from "../model/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";


// new booking create function
export const createBooking = async (req: AuthRequest, res: Response) => {
    
}