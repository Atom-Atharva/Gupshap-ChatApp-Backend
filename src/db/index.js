import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(
            `${process.env.MONGODB_URL}` + "/" + `${DB_NAME}`
        );

        console.log("DB Connected Succesfully");
    } catch (error) {
        console.log("Failed To Connect DB: ", error);
        process.exit(1);
    }
};

export default dbConnect;
