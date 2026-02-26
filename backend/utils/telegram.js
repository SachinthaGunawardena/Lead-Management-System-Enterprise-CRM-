const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const axios = require("axios");

const sendTelegramMessage = async (message) => {
  try {
    console.log("Telegram function called");

    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: assignedStaff.telegramId,
      text: message,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📲 WhatsApp Client",
              url: `https://wa.me/${phone}`,
            },
          ],
        ],
      },
    });

    console.log("Telegram message sent successfully");
  } catch (error) {
    console.error(
      "Telegram Full Error:",
      error.response?.data || error.message,
    );
  }
};

module.exports = sendTelegramMessage;
