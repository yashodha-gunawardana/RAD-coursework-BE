import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import AuthRoutes from "./routes/authRoutes";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URL = process.env.MONGO_URL as string

const app = express();

// json data parse in incoming requests
app.use(express.json());

// mount routes
app.use("/api/v1/auth", AuthRoutes)

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