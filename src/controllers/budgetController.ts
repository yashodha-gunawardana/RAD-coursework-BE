import { Request, Response } from "express";
import Budget, { IBudget, BudgetStatus } from "../model/budgetModel";
import Event from "../model/eventModel";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";



// role check
const hasAceess = (user: any, roles: string[]) => user?.roles?.some((r: string) => roles.includes(r))


// check valid objectId
const isValid = (id: string) => mongoose.Types.ObjectId.isValid(id)


// create or update budget function 
export const createOrUpdateBudget = async (req: AuthRequest, res: Response) => {
    try {

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets."
            });
        }

        const { eventId, selectedItems = [] } = req.body
        const userId = req.user._id


        if (!isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID.."
            })
        }

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
            const total = eventExtraItem.unitPrice * quantity


            validItems.push({
                name: eventExtraItem.name,
                unitPrice: eventExtraItem.unitPrice,
                quantity,
                total: total // temporary total

            })
            calculatedExtraTotal += total
        }

        const basePrice = event.basePrice || 0

        // check budget already exists
        let budget = await Budget.findOne({ userId, eventId })

        // store whether this is an update or create operation
        const isUpdate = budget ? true : false

        if (budget) {
            budget.selectedItems = validItems
            budget.basePrice = basePrice
            await budget.save()
        
        } else {
            // if busget doesn't exist, create new one
            budget = await Budget.create({
                userId,
                eventId,
                basePrice,
                selectedItems: validItems
            })
        }

        return res.status(isUpdate ? 200 : 201).json({
            message: isUpdate ? "Budget updated successfully.." : "Budget created successfully..",
            data: {
                budgetId: budget._id,
                eventId: budget.eventId,
                userId: budget.userId,
                basePrice: budget.basePrice,
                selectedItems: budget.selectedItems,
                extraTotal: budget.extraTotal,
                totalAmount: budget.totalAmount,
                status: budget.status,
                createdAt: budget.createdAt,
                updatedAt: budget.updatedAt
            }
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get budget by id function 
export const getBudgetId = async (req: AuthRequest, res: Response) => {
    try {

    } catch (err) {
        
    }
}