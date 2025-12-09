import mongoose, { Document, Schema } from "mongoose";


export enum BudgetStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    PAID = "PAID",
}


// interface for user-selected extra items
export interface IUserSelectedItems {
    name: string
    unitPrice: number
    quantity: number
    total: number
}


// budget interface
export interface IBudget extends Document {
    eventId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    basePrice: number
    selectedItems: IUserSelectedItems[]
    extraTotal: number
    totalAmount: number
    status: BudgetStatus
    createdAt: Date
    updatedAt: Date
}


// database structure for item selection
const selectedItemsSchema = new Schema<IUserSelectedItems> (
    {
        name: { type: String, required: true },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true, min: 0 } // auto calculate
    },
    { _id: false }
)


// database structure for budget
const budgetSchema = new Schema<IBudget> (
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        basePrice: { type: Number, required: true, min: 0 },
        selectedItems: { type: [selectedItemsSchema], default: [] },
        extraTotal: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: Object.values(BudgetStatus), default: BudgetStatus.DRAFT }
    },
    { timestamps: true }
)

// one budget, per event per user
budgetSchema.index({ userId: 1, eventId: 1 }, { unique: true })


budgetSchema.pre("save", function (next) {
    let extraTotal = 0 // extra total calculation

    this.selectedItems.forEach((item) => {
        item.total = item.unitPrice * item.quantity
        extraTotal += item.total
    })

    this.extraTotal = extraTotal

    // final total amount
    this.totalAmount = this.basePrice + extraTotal

    next()
})

export default mongoose.model<IBudget>("Budget", budgetSchema)