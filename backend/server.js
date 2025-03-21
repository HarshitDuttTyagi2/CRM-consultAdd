// import mongoose from "mongoose";
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const colors = require("colors");
const connectDB = require("./database/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const leadRouter = require("./routes/leadRoutes");
const todoRoutes = require("./routes/todoRoutes");
const stageRoutes = require("./routes/leadStageRoutes");
const todoStatusRoutes = require("./routes/todoStatusRoutes");
const contactUsRoutes = require("./routes/contactUsRoutes");
const teamRoutes = require("./routes/teamRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes")
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const googleAuth = require("./routes/googleAuthRoutes")

require("dotenv").config();

// const URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }) .then(() => { console.log("MongoDB connected successfully!"); }) .catch((err) => { console.error("Error connecting to MongoDB:", err.message); });

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"], // Allow frontend domains
    credentials: true, // Required for sending cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure in production
      httpOnly: true, // Prevent client-side access
      sameSite: "None", // Allow cross-site usage
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const GoogleStrategy = require("./possport")

app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

app.use("/auth", googleAuth)
app.use("/api/auth", authRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/lead", leadRouter);
app.use("/api/stage", stageRoutes);
app.use("/api/todoStatus", todoStatusRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/contactUs", contactUsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/dashboard", dashboardRoutes)

// app.listen(PORT, async () => {
//   await connectDB(URL);
//   console.log(`Server running on Post- ${PORT}`.bgBlue.black);
// });

app.listen(PORT, () => {
  // connect();
  console.log("Server running on 3000");
});
