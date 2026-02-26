const Lead = require("../models/Lead");

// 1️⃣ Get Total Leads
// Telegram Total Leads
exports.getTelegramLeads = async (req, res) => {
  try {
    const total = await Lead.countDocuments({ source: "Telegram" });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2️⃣ Get Converted Leads
exports.getConvertedLeads = async (req, res) => {
  try {
    const converted = await Lead.countDocuments({
      status: "converted",
    });
    res.json({ converted });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3️⃣ Get Conversion Rate
// Telegram Conversion Rate
exports.getTelegramConversionRate = async (req, res) => {
  try {
    const total = await Lead.countDocuments({ source: "Telegram" });

    const converted = await Lead.countDocuments({
      source: "Telegram",
      status: "converted",
    });

    const rate = total > 0 ? (converted / total) * 100 : 0;

    res.json({
      total,
      converted,
      conversionRate: rate.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4️⃣ Get Monthly Leads
// Telegram Monthly Leads
exports.getTelegramMonthlyLeads = async (req, res) => {
  try {
    const monthlyLeads = await Lead.aggregate([
      {
        $match: { source: "Telegram" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(monthlyLeads);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5️⃣ Get Leads by Source (Manual + Telegram)
exports.getLeadsBySource = async (req, res) => {
  try {
    const sourceData = await Lead.aggregate([
      {
        $match: {
          source: { $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(sourceData);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// 6️⃣ Telegram Growth (Month vs Previous Month)
exports.getTelegramGrowth = async (req, res) => {
  try {
    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // This Month Count
    const thisMonthCount = await Lead.countDocuments({
      source: "Telegram",
      createdAt: { $gte: startOfThisMonth },
    });

    // Last Month Count
    const lastMonthCount = await Lead.countDocuments({
      source: "Telegram",
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    let growth = 0;

    if (lastMonthCount > 0) {
      growth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }

    res.json({
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      growth: growth.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
