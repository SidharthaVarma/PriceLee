import mongoose from "mongoose";

let isConnected = false; //variable to check if the connection is established

export const connectToDB = async () => {
    mongoose.set("strictQuery", true);
    if(!process.env.MONGODB_URI) return console.log('MongoDB URI is not defined');

    if(isConnected) return console.log("=> using existing database connection");

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        isConnected = true;
        console.log("=> MongoDB database Connected");
    } catch (error) {
        console.log(error);
    }
}