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
exports.updateRSVP = exports.getGuestByEvent = exports.addGuest = void 0;
const guestModel_1 = __importStar(require("../models/guestModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
// add new guest function (owner only)
const addGuest = async (req, res) => {
    try {
        const { eventId, name, email, phone, plusOne, message } = req.body;
        const userId = req.user._id;
        const event = await eventModel_1.default.findOne({ _id: eventId, userId });
        if (!event) {
            return res.status(404).json({
                message: "Event not found or you don't own it.."
            });
        }
        const newGuest = new guestModel_1.default({
            eventId,
            name,
            email,
            phone,
            plusOne,
            message,
            rsvpStatus: guestModel_1.RSVPStatus.PENDING
        });
        await newGuest.save();
        return res.status(201).json({
            message: "Guest added successfully..",
            data: newGuest
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.addGuest = addGuest;
// get guest by event function (owner only)
const getGuestByEvent = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const userId = req.user._id;
        const event = await eventModel_1.default.findOne({ _id: eventId, userId });
        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            });
        }
        const guests = await guestModel_1.default.find({ eventId }).sort({ createdAt: -1 });
        const stats = {
            total: guests.length,
            going: guests.filter(g => g.rsvpStatus === guestModel_1.RSVPStatus.GOING).length,
            notGoing: guests.filter(g => g.rsvpStatus === guestModel_1.RSVPStatus.NOT_GOING).length,
            maybe: guests.filter(g => g.rsvpStatus === guestModel_1.RSVPStatus.MAYBE).length,
            pending: guests.filter(g => g.rsvpStatus === guestModel_1.RSVPStatus.PENDING).length
        };
        return res.json({
            success: true,
            stats,
            data: guests
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.getGuestByEvent = getGuestByEvent;
// update RSVP function (gusest can do without login)
const updateRSVP = async (req, res) => {
    try {
        const { eventId, email, rsvpStatus, plusOne } = req.body;
        const guest = await guestModel_1.default.findByIdAndUpdate({ eventId, email }, { rsvpStatus, plusOne }, { new: true });
        if (!guest) {
            return res.status(404).json({
                message: "Guest not found for this event.."
            });
        }
        return res.status(200).json({
            message: "RSVP updated..",
            data: guest
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.updateRSVP = updateRSVP;
