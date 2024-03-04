import express from "express";
import { connectDB } from "./config/connectDB.js";

const app = express();

// Config for env files
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

// Connect DB
connectDB();

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

app.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Listening to ${PORT}`);
});
