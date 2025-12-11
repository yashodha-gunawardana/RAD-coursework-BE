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
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
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

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
            });
        }

        const { budgetId } = req.params
        const userId = req.user._id


        if (!isValid(budgetId)) {
            return res.status(400).json({
                message: "Invalid event ID.."
            })
        }

        const budget = await Budget.findOne({ _id: budgetId, userId })
            .populate("eventId", "title date location basePrice")
            .populate("userId", "name email")

        
            if (!budget) {
            return res.status(404).json({
                message: "Budget not found.."
            })
        }

        return res.status(200).json({
            message: "Budget retrieved successfully..",
            data: budget
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get budget by event id function
export const getBudgetByEventId = async (req: AuthRequest, res: Response) => {
    try {

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
            });
        }

        const { eventId } = req.params
        const userId = req.user._id

        if (!isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID.."
            })
        }        

        const budget = await Budget.findOne({ eventId, userId })
            .populate("eventId", "title date location basePrice")
            .populate("userId", "name email")

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found for this event.."
            })
        }

        return res.status(200).json({
            message: "Budget retrieved successfully..",
            data: budget
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get all budgets function
export const getAllUserBudgets = async (req: AuthRequest, res: Response) => {
    try {

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
            });
        }

        const userId = req.user._id

        const budgets = await Budget.find({ userId })
            .populate("eventId", "title date location basePrice")
            .sort({ createdAt: -1 })


        return res.status(200).json({
            message: "Budgets retrieved successfully..",
            count: budgets.length,
            data: budgets
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// update budget status function
export const updateBudgetStatus = async (req: AuthRequest, res: Response) => {
    try {

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
            });
        }

        const { budgetId } = req.params
        const { status } = req.body
        const userId = req.user._id

        if (!isValid(budgetId)) {
            return res.status(400).json({
                message: "Invalid budget ID.."
            })
        }  

        if (!Object.values(BudgetStatus).includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be Draft, Confirmed or Paid.."
            })
        }

        const budget = await Budget.findOne({ _id: budgetId, userId })

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found.."
            })
        }

        // update budget status
        budget.status = status

        await budget.save()

        return res.status(200).json({
            message: "Budget status updated successfully..",
            data: budget
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// delete budget function
export const deleteBudget = async (req: AuthRequest, res: Response) => {
    try {

        if (!hasAceess(req.user, ["USER", "ADMIN"])) {
            return res.status(403).json({
                message: "Access denied. Only USER or ADMIN can create or update budgets.."
            });
        }

        const { budgetId } = req.params
        const userId = req.user._id

        if (!isValid(budgetId)) {
            return res.status(400).json({
                message: "Invalid budget ID.."
            })
        }  

        const budget = await Budget.findOneAndDelete({ _id: budgetId, userId })
        


    } catch (err) {

    }
}