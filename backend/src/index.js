import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import messageRoute from './routes/message.routes.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './lib/socket.js';
import path from 'path'

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 8001;
const __dirname = path.resolve();

app.use(cookieParser());
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


// Handle preflight requests
app.options("*", cors());

// Add this to your Express app initialization
app.use(express.json({ limit: '10mb' })); // Adjust as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Additional CORS headers (optional)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoute);

if(process.env.NODE_ENV === "production"){
   app.use(express.static(path.join(__dirname, "../frontend/dist")))

   app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
   })
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  connectDB();
});