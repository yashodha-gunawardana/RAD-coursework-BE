import mongoose, { Document, Schema } from "mongoose";

export enum BudgetStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    PAID = "PAID",
}