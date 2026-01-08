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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "DRAFT";
    BudgetStatus["CONFIRMED"] = "CONFIRMED";
    BudgetStatus["PAID"] = "PAID";
})(BudgetStatus || (exports.BudgetStatus = BudgetStatus = {}));
const selectedItemsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, default: 0 }
}, { _id: false });
const budgetSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    basePrice: { type: Number, required: true, min: 0 },
    selectedItems: { type: [selectedItemsSchema], default: [] },
    extraTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(BudgetStatus), default: BudgetStatus.DRAFT }
}, { timestamps: true });
// One budget per user, per event
budgetSchema.index({ userId: 1, eventId: 1 }, { unique: true });
// auto-calculate totals before saving
budgetSchema.pre("save", async function () {
    let extraTotal = 0;
    this.selectedItems.forEach((item) => {
        item.total = item.unitPrice * item.quantity;
        extraTotal += item.total;
    });
    this.extraTotal = extraTotal;
    this.totalAmount = this.basePrice + extraTotal;
});
exports.default = mongoose_1.default.model("Budget", budgetSchema);
