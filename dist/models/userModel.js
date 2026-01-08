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
exports.VendorStatus = exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["VENDOR"] = "VENDOR";
    Role["USER"] = "USER";
})(Role || (exports.Role = Role = {}));
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["NOT_REQUESTED"] = "NOT_REQUESTED";
    VendorStatus["PENDING"] = "PENDING";
    VendorStatus["APPROVED"] = "APPROVED";
    VendorStatus["REJECTED"] = "REJECTED";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
// Database structure
const userSchema = new mongoose_1.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
    vendorStatus: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.NOT_REQUESTED }
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", userSchema);
