const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Telegram Analytics
router.get("/telegram-total", analyticsController.getTelegramLeads);
router.get(
  "/telegram-conversion",
  analyticsController.getTelegramConversionRate,
);
router.get("/telegram-monthly", analyticsController.getTelegramMonthlyLeads);
router.get("/telegram-growth", analyticsController.getTelegramGrowth);

// Source Pie
router.get("/source", analyticsController.getLeadsBySource);

module.exports = router;
