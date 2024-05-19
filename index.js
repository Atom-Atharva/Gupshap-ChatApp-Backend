import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/dbConnect.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

// Dotenv Configure
dotenv.config();
const PORT = process.env.PORT;

// Initialise Express
const app = express();

// Body Parser
app.use(express.json());

// Allow requests from all origins
app.use(cors());

// Allow specific headers in CORS preflight response
app.options(
    "*",
    cors({
        allowedHeaders: ["Content-Type"],
    })
);

// Connection with DB
connectDB();

// Listening to PORT
app.listen(PORT || 5050, (err) => {
    if (err) throw err;

    console.log(`Listening to ${PORT}`);
});

app.use("/api/auth", authRoutes);
