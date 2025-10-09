// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Use your MongoDB Atlas URL from .env
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message); // If connection fails, show error
    process.exit(1); // Stop the server
  }
};

module.exports = connectDB;
