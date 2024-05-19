import mongoose from "mongoose";

// Establish Connection with DB
export const connectDB = () => {
    mongoose
        .connect(process.env.DB_CONNECTION)
        .then(() => {
            console.log("Database is Connected");
        })
        .catch((err) => {
            console.log(err);
        });
};
