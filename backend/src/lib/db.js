import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_DB_URI)
        console.log(`MongoDB connected Sucessfully: ${connection.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB Connecetion Error: ", error);
        
    }
}