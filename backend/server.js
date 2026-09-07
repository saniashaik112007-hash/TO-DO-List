const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config();
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Daily Todo Backend is running" });
});

async function startServer() {
  const preferredUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daily-todo";

  try {
    await mongoose.connect(preferredUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. Starting in-memory MongoDB for local development...");
    const memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri(), { serverSelectionTimeoutMS: 10000 });
    console.log("In-memory MongoDB connected");
  }

  app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});