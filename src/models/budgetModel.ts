import mongoose, { Document, Schema } from "mongoose";

export enum BudgetStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    PAID = "PAID",
}

export interface IUserSelectedItems {
    name: string;
    unitPrice: number;
    quantity: number;
    total: number;
}

export interface IBudget extends Document {
    eventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    basePrice: number;
    selectedItems: IUserSelectedItems[];
    extraTotal: number;
    totalAmount: number;
    status: BudgetStatus;
    createdAt: Date;
    updatedAt: Date;
}

const selectedItemsSchema = new Schema<IUserSelectedItems>(
    {
        name: { type: String, required: true },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, default: 0 } 
    },
    { _id: false }
);

const budgetSchema = new Schema<IBudget>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        basePrice: { type: Number, required: true, min: 0 },
        selectedItems: { type: [selectedItemsSchema], default: [] },
        extraTotal: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        status: { type: String, enum: Object.values(BudgetStatus), default: BudgetStatus.DRAFT }
    },
    { timestamps: true }
);

// One budget per user, per event
budgetSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// auto-calculate totals before saving
budgetSchema.pre("save", async function (this: IBudget) {
    let extraTotal = 0;

    this.selectedItems.forEach((item) => {
        item.total = item.unitPrice * item.quantity;
        extraTotal += item.total;
    });

    this.extraTotal = extraTotal;
    this.totalAmount = this.basePrice + extraTotal;
});

export default mongoose.model<IBudget>("Budget", budgetSchema);