import mongoose, { Document, Schema } from "mongoose";


export enum BudgetStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    PAID = "PAID",
}


// interface for user-selected extra items
export interface IUserSelectedItems {
    itemId: mongoose.Types.ObjectId
    name: string
    unitPrice: number
    quantity: number
    total: number
}
