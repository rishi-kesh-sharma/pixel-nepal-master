require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const cron = require("node-cron");

//Router import
const userRoute = require("./routers/user/userRoute");
const favoriteRoute = require("./routers/user/favoriteRoute");
const categoryRoute = require("./routers/catgeory/categoryRoutes");
const tagRoute = require("./routers/resource/resourceTagRoute");
const resourceRoute = require("./routers/resource/resourceRoute");
const priceRoute = require("./routers/pricing/pricingRoute");
const subscriptionRoute = require("./routers/subscription/subscriptionRoute");
const teamRoute = require("./routers/pricing/team/teamRoute");
const downloadRoute = require("./routers/download/downloadRoute");
const commentRoute = require("./routers/resource/commentRoute");
const errorHandler = require("./middleware/errorMiddleware");

const {
  updateUserSubscriptionStatus,
} = require("./controllers/subscription/subscription");

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);

//Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/api/users", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/tag", tagRoute);
app.use("/api/resource", resourceRoute);
app.use("/api/pricing", priceRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/team", teamRoute);
app.use("/api/download", downloadRoute);
app.use("/api/comment", commentRoute);
app.use("/api/favorite", favoriteRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Error Handler
app.use(errorHandler);

// Connect to DB
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_CLOUD)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to DB with Host : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Schedule the task to run every day at a specific time (e.g., midnight)
// cron.schedule("* * * * * *", updateUserSubscriptionStatus);
