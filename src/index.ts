import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import AuthRoutes from "./routes/authRoutes";
import cors from "cors";
import EventRoutes from "./routes/eventRoutes";
import VendorRoutes from "./routes/vendorRoutes";
import BookingRoutes from "./routes/bookingRoutes";
import GuestRoutes from "./routes/guestRoutes";
import BudgetRoutes from "./routes/budgetRoutes";
import path from "path";
import { authenticate } from "./middleware/authMiddleware";


dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URL = process.env.MONGO_URL as string

const app = express();

// json data parse in incoming requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))


app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["POST", "GET", "DELETE", "PUT"]
}))

// mount routes
app.use("/api/v1/auth", AuthRoutes)

app.use("/api/v1/events", authenticate, EventRoutes)
app.use("/api/v1/vendors", authenticate, VendorRoutes)
app.use("/api/v1/bookings", authenticate, BookingRoutes)
app.use("/api/v1/guests", authenticate, GuestRoutes)
app.use("/api/v1/budgets", authenticate, BudgetRoutes)


mongoose.connect(MONGO_URL).then(() => {
    console.log("Database connected..")
})
.catch((err) => {
    console.error(`DB connection failed: ${err}`)
    process.exit(1)
})

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on ${SERVER_PORT}`)
})