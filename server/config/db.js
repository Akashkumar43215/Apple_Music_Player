// import mongoose from 'mongoose';

// /**
//  * Establishes a connection to MongoDB using Mongoose.
//  * Exits the process if the connection fails, since the API is unusable without a DB.
//  */
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`❌ MongoDB connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;




import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;