const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

async function connectMongoDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

module.exports = { 
  connectMongoDb,
 };