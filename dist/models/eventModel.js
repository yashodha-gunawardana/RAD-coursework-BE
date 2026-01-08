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
exports.EventStatus = exports.EventType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var EventType;
(function (EventType) {
    EventType["WEDDING"] = "WEDDING";
    EventType["BIRTHDAY"] = "BIRTHDAY";
    EventType["CONFERENCE"] = "CONFERENCE";
    EventType["CORPORATE"] = "CORPORATE";
    EventType["PARTY"] = "PARTY";
    EventType["OTHER"] = "OTHER";
})(EventType || (exports.EventType = EventType = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["PLANNING"] = "PLANNING";
    EventStatus["ONGOING"] = "ONGOING";
    EventStatus["COMPLETED"] = "COMPLETED";
    EventStatus["CANCELLED"] = "CANCELLED";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
// Database structure for event
const eventSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(EventType), required: true },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    basePrice: { type: Number, required: true },
    extraItems: [
        {
            name: { type: String, required: true },
            unitPrice: { type: Number, required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    isPackage: { type: Boolean, default: false },
    createdByAdmin: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(EventStatus), default: EventStatus.PLANNING }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Event', eventSchema);
