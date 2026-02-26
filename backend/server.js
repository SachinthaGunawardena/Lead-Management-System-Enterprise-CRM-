require("dotenv").config({ path: __dirname + "/.env" });

console.log("ENV TEST:", process.env);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const Lead = require("./models/Lead");
const connectDB = require("./config/db");

const app = express();
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// Database
// =======================
connectDB();

// Routes
// =======================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
// Telegram Bot Logic
// =======================

const userSessions = {};
let lastUpdateId = 0;

// Send Telegram Message Function
const TOKEN = process.env.TELEGRAM_TOKEN;

async function sendTelegramMessage(chatId, text) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
      },
    );

    console.log("Message sent:", response.data);
  } catch (error) {
    console.error(
      "Telegram Send Error:",
      error.response?.data || error.message,
    );
  }
}

// Telegram Webhook
app.post("/telegram-webhook", async (req, res) => {
  console.log("Telegram update:", req.body);
  res.sendStatus(200);

  try {
    const update = req.body;
    if (!update.message) return;

    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (!userSessions[chatId]) {
      userSessions[chatId] = { step: "service" };
    }

    const session = userSessions[chatId];

    // START
    if (text === "/start") {
      // FORCE RESET SESSION
      userSessions[chatId] = {
        step: "service",
      };

      await sendTelegramMessage(
        chatId,
        "👋 Welcome to GrowthLab Digital!\n\nPlease select a service:\n\n1️⃣ Social Media Marketing\n2️⃣ SEO\n3️⃣ Paid Ads\n4️⃣ Website Development",
      );

      return;
    }

    // SERVICE
    if (session.step === "service") {
      session.service = text;
      session.step = "name";

      await sendTelegramMessage(chatId, "Please enter your Full Name:");
      return;
    }

    // NAME
    if (session.step === "name") {
      session.name = text;
      session.step = "business";

      await sendTelegramMessage(chatId, "Please enter your Business Name:");
      return;
    }

    // BUSINESS
    if (session.step === "business") {
      session.business = text;
      session.step = "phone";

      await sendTelegramMessage(chatId, "Please enter your Phone Number:");
      return;
    }

    // PHONE
    if (session.step === "phone") {
      session.phone = text;
      session.step = "budget";

      await sendTelegramMessage(
        chatId,
        "What is your monthly marketing budget?",
      );
      return;
    }

    // FINAL STEP
    if (session.step === "budget") {
      session.budget = text;

      try {
        const newLead = new Lead({
          name: session.name,
          email: "telegram_user",
          businessName: session.business,
          service: session.service,
          budget: Number(session.budget),
          source: "Telegram",
        });

        await newLead.save();
        console.log("Lead saved successfully");
      } catch (dbError) {
        console.error("DB Error:", dbError);
      }

      await sendTelegramMessage(
        chatId,
        `🎉 Thank you ${session.name}!\n\nOur team will contact you shortly.\n\n🚀 GrowthLab Team`,
      );

      delete userSessions[chatId];
      return;
    }
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

// =======================
// Start Server
// =======================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
