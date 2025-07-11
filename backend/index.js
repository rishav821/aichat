const express = require("express");
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");



const authRoutes = require("./Routes/authRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const { setupSocket } = require("./lib/socket");

require("dotenv").config();
require("./Config/db");

const app = express();
const server = http.createServer(app); 


// === Express Middleware ===

app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// === Routes ===
app.use("/uploads/files", express.static(path.join(__dirname, "Uploads/files")));
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);


// === Error Handler ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});


setupSocket(server);


// === Start Server ===
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server  running at port ${PORT}`);
});

module.exports = { app, server };