//

require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./db/connectDB");
const credentials = require("./middlewares/credentials");
const corsOptions = require("./config/corOptions"); // fixed typo corOptions -> corsOptions
const movieRoute = require("./routes/movie");
const newMovieRoute = require("./routes/newMovie");
const userRoute = require("./routes/user");
const verifyRoute = require("./routes/verify");
const authRoute = require("./routes/auth");
const refreshRoute = require("./routes/refresh");
const editMovieRoute = require("./routes/edit-movie");

const PORT = process.env.PORT || 3500;

// Middleware
app.use(credentials);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// --- Test route to verify server is alive ---
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Routes
app.use("/api/v1/movie", movieRoute);
app.use("/api/v1/newmovie", newMovieRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", refreshRoute);
app.use("/api/v1/admin", editMovieRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/auth", verifyRoute);

const start = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await connectDB(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server listening on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Server failed to start:");
    console.error(error);
    process.exit(1);
  }
};

start();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});
