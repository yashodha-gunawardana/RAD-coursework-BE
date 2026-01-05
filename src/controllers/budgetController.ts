import { Response } from "express";
import Budget, { BudgetStatus } from "../models/budgetModel";
import Event from "../models/eventModel";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";
import { Role } from "../models/userModel";

const isValid = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const createOrUpdateBudget = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, selectedItems = [] } = req.body;
        const userId = req.user?._id;

        if (!isValid(eventId)) return res.status(400).json({ message: "Invalid event ID" });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Map and validate items against the Event's allowed extras
        const validItems = selectedItems.map((item: any) => {
            const eventExtra = event.extraItems?.find((e: any) => e.name === item.name);
            if (!eventExtra) throw new Error(`Extra item "${item.name}" not available for this event`);
            
            return {
                name: eventExtra.name,
                unitPrice: eventExtra.unitPrice,
                quantity: item.quantity || 1
            };
        });

        // Find or Create manually to ensure the 'save' hook triggers
        let budget = await Budget.findOne({ userId, eventId });

        if (budget) {
            budget.selectedItems = validItems;
            budget.basePrice = event.basePrice;
            await budget.save();
        } else {
            budget = new Budget({
                userId,
                eventId,
                basePrice: event.basePrice,
                selectedItems: validItems
            });
            await budget.save();
        }

        return res.status(200).json({ 
            message: "Budget saved successfully", 
            data: budget 
        });
    } catch (err: any) {
        return res.status(400).json({ message: err.message });
    }
};

export const getBudgetId = async (req: AuthRequest, res: Response) => {
    try {
        const { budgetId } = req.params;
        if (!isValid(budgetId)) return res.status(400).json({ message: "Invalid budget ID" });

        const budget = await Budget.findOne({ _id: budgetId, userId: req.user?._id })
            .populate("eventId", "title date location basePrice")
            .populate("userId", "name email");

        if (!budget) return res.status(404).json({ message: "Budget not found" });
        return res.status(200).json({ data: budget });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const getAllUserBudgets = async (req: AuthRequest, res: Response) => {
    try {
        const budgets = await Budget.find({ userId: req.user?._id })
            .populate("eventId", "title date")
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: budgets.length, data: budgets });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateBudgetStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { budgetId } = req.params;
        const { status } = req.body;

        if (!Object.values(BudgetStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const budget = await Budget.findOneAndUpdate(
            { _id: budgetId, userId: req.user?._id },
            { status },
            { new: true }
        );

        if (!budget) return res.status(404).json({ message: "Budget not found" });
        return res.status(200).json({ message: "Status updated", data: budget });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
    try {
        const query: any = { _id: req.params.budgetId };
        if (!req.user?.roles.includes(Role.ADMIN)) query.userId = req.user?._id;

        const budget = await Budget.findOneAndDelete(query);
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        return res.status(200).json({ message: "Budget deleted" });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};