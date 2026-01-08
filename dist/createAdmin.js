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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importStar(require("./models/userModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        const existingAdmin = await userModel_1.default.findOne({ roles: userModel_1.Role.ADMIN });
        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }
        const hashedPassword = await bcryptjs_1.default.hash("Admin@123", 10);
        await userModel_1.default.create({
            fullname: "System Admin",
            email: "admin@system.com",
            password: hashedPassword,
            roles: [userModel_1.Role.ADMIN],
            vendorStatus: userModel_1.VendorStatus.APPROVED
        });
        console.log("Admin created successfully");
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
createAdmin();
