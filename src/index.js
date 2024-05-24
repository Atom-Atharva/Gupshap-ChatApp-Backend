import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import dbConnect from "./db/index.js";

const PORT = process.env.PORT;

dbConnect()
    .then(() => {
        app.on("error", (error) => {
            throw error;
        });

        app.listen(PORT || 8080, (err) => {
            if (err) throw err;
            console.log(`Listening on http//:localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed: ", error);
    });