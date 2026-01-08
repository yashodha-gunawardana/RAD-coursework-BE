"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const guestRoutes_1 = __importDefault(require("./routes/guestRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const path_1 = __importDefault(require("path"));
const authMiddleware_1 = require("./middleware/authMiddleware");
dotenv_1.default.config();
const SERVER_PORT = process.env.SERVER_PORT;
const MONGO_URL = process.env.MONGO_URL;
const app = (0, express_1.default)();
// json data parse in incoming requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["POST", "GET", "DELETE", "PUT"]
}));
// mount routes
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/events", authMiddleware_1.authenticate, eventRoutes_1.default);
app.use("/api/v1/vendors", authMiddleware_1.authenticate, vendorRoutes_1.default);
app.use("/api/v1/bookings", authMiddleware_1.authenticate, bookingRoutes_1.default);
app.use("/api/v1/guests", authMiddleware_1.authenticate, guestRoutes_1.default);
app.use("/api/v1/budgets", authMiddleware_1.authenticate, budgetRoutes_1.default);
mongoose_1.default.connect(MONGO_URL).then(() => {
    console.log("Database connected..");
})
    .catch((err) => {
    console.error(`DB connection failed: ${err}`);
    process.exit(1);
});
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on ${SERVER_PORT}`);
});
