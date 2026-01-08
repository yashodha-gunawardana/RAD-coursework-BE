"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.updateBudgetStatus = exports.getAllUserBudgets = exports.getBudgetId = exports.createOrUpdateBudget = void 0;
const budgetModel_1 = __importStar(require("../models/budgetModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../models/userModel");
const isValid = (id) => mongoose_1.default.Types.ObjectId.isValid(id);
const createOrUpdateBudget = async (req, res) => {
    try {
        const { eventId, selectedItems = [] } = req.body;
        const userId = req.user?._id;
        if (!isValid(eventId))
            return res.status(400).json({ message: "Invalid event ID" });
        const event = await eventModel_1.default.findById(eventId);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        // Map and validate items against the Event's allowed extras
        const validItems = selectedItems.map((item) => {
            const eventExtra = event.extraItems?.find((e) => e.name === item.name);
            if (!eventExtra)
                throw new Error(`Extra item "${item.name}" not available for this event`);
            return {
                name: eventExtra.name,
                unitPrice: eventExtra.unitPrice,
                quantity: item.quantity || 1
            };
        });
        // Find or Create manually to ensure the 'save' hook triggers
        let budget = await budgetModel_1.default.findOne({ userId, eventId });
        if (budget) {
            budget.selectedItems = validItems;
            budget.basePrice = event.basePrice;
            await budget.save();
        }
        else {
            budget = new budgetModel_1.default({
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
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.createOrUpdateBudget = createOrUpdateBudget;
const getBudgetId = async (req, res) => {
    try {
        const { budgetId } = req.params;
        if (!isValid(budgetId))
            return res.status(400).json({ message: "Invalid budget ID" });
        const budget = await budgetModel_1.default.findOne({ _id: budgetId, userId: req.user?._id })
            .populate("eventId", "title date location basePrice")
            .populate("userId", "name email");
        if (!budget)
            return res.status(404).json({ message: "Budget not found" });
        return res.status(200).json({ data: budget });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.getBudgetId = getBudgetId;
const getAllUserBudgets = async (req, res) => {
    try {
        const budgets = await budgetModel_1.default.find({ userId: req.user?._id })
            .populate("eventId", "title date")
            .sort({ createdAt: -1 });
        return res.status(200).json({ count: budgets.length, data: budgets });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.getAllUserBudgets = getAllUserBudgets;
const updateBudgetStatus = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const { status } = req.body;
        if (!Object.values(budgetModel_1.BudgetStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const budget = await budgetModel_1.default.findOneAndUpdate({ _id: budgetId, userId: req.user?._id }, { status }, { new: true });
        if (!budget)
            return res.status(404).json({ message: "Budget not found" });
        return res.status(200).json({ message: "Status updated", data: budget });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.updateBudgetStatus = updateBudgetStatus;
const deleteBudget = async (req, res) => {
    try {
        const query = { _id: req.params.budgetId };
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN))
            query.userId = req.user?._id;
        const budget = await budgetModel_1.default.findOneAndDelete(query);
        if (!budget)
            return res.status(404).json({ message: "Budget not found" });
        return res.status(200).json({ message: "Budget deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.deleteBudget = deleteBudget;
