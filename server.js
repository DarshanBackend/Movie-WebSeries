import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/userRoutes.js";
import aboutUSRoutes from "./src/routes/aboutUsRoutes.js";
import faqRoutes from "./src/routes/faqRoutes.js";
import termsConditionRoutes from "./src/routes/termsConditionRoutes.js";
import privacyPolicyRoutes from "./src/routes/privacyPolicyRoutes.js";
import cookiePolicyRoutes from "./src/routes/cookiePolicyRoutes.js";
import contactUsRoutes from "./src/routes/contactUsRoutes.js";
import movieCategoryRoutes from "./src/routes/movieCategoryRoutes.js";
import movieRoutes from "./src/routes/movieRoutes.js";
import starringRoutes from "./src/routes/starringRoutes.js";
import premiumRoutes from "./src/routes/premiumRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import episoderouter from "./src/routes/episodeRoutes.js";
dotenv.config();

const port = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//User Routes
app.use("/api/users", userRoutes)

//aboutUs Routes
app.use("/api/aboutUs", aboutUSRoutes)

//faq Routes
app.use("/api/faq", faqRoutes)

//termsCondition Routes
app.use("/api/termsCondition", termsConditionRoutes)

//privacyPolicy Routes
app.use("/api/privacyPolicy", privacyPolicyRoutes)

//cookiePolicy Routes
app.use("/api/cookiePolicy", cookiePolicyRoutes)

//contactUs Routes
app.use("/api/contactUs", contactUsRoutes)

//movieCategory Routes
app.use("/api/movieCategory", movieCategoryRoutes)

//movie Routes
app.use("/api/movies", movieRoutes)

//starring Routes
app.use("/api/starring", starringRoutes)

//premium Routes
app.use("/api/premium", premiumRoutes)

//payment Routes
app.use("/api/payment", paymentRoutes)

//episode Routes
app.use("/api/episode", episoderouter)

// Connect to Database
connectDB();

// Server Connection
app.listen(port, () => {
  console.log(`Server Start At Port http://localhost:${port}`);
});


