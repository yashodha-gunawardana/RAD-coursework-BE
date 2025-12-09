import { Request, Response } from "express";
import Budget, { BudgetStatus } from "../model/budgetModel";
import Event from "../model/eventModel";
import { AuthRequest } from "../middleware/authMiddleware";


export const createOrUpdateBudget = async (req: AuthRequest, res: Response) => {
    try {

        const { eventId, selectedItems = [] } = req.body
        const userId = req.user._id

        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            })
        }

        const validItems: any[] = []
        let calculatedExtraTotal = 0

        for (const item of selectedItems) {
            const eventExtraItem = event.extraItems?.find(
                (e: any) => e.name === item.name
            )

            if (!eventExtraItem) {
                return res.status(400).json({
                    message: `Extra item "${item.name}" not available for this event..`
                })
            }

            const quantity = item.quantity || 1

        }

        
        

    } catch (err) {

    }
}
