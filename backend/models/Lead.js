const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },
    phone: {
      type: String,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Closed"],
      default: "New",
    },

    message: {
      type: String,
    },

    service: {
      type: String,
    },

    source: {
      type: String,
      enum: ["Manual", "Telegram"],
      default: "Manual",
    },

    businessName: {
      type: String,
    },

    serviceInterested: {
      type: String,
    },

    budget: {
      type: Number,
    },

    value: {
      type: Number,
      default: 0,
    },

    telegramChatId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast analytics queries
leadSchema.index({ createdAt: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });

module.exports = mongoose.model("Lead", leadSchema);
