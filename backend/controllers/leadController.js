const Lead = require("../models/Lead");
const sendTelegramMessage = require("../utils/telegram");

// ===== STAFF LIST =====
const staffMembers = [
  { name: "Kamal", telegramId: "123456789" },
  { name: "Nimal", telegramId: "987654321" },
  { name: "Saman", telegramId: "456123789" },
];

// CREATE LEAD
const createLead = async (req, res) => {
  const { name, email, phone, status } = req.body;

  try {
    const newLead = new Lead({
      name,
      email,
      phone,
      status,
    });

    await newLead.save();

    // ===== AUTO ASSIGN STAFF =====
    const assignedStaff =
      staffMembers[Math.floor(Math.random() * staffMembers.length)];

    // 🔔 SEND TELEGRAM MESSAGE HERE
    await newLead.save();

    console.log("Reached after save");

    const message = `
<b>🔥 NEW LEAD RECEIVED</b>

<b>📞 Phone:</b> <a href="tel:${phone}">${phone || "Not Provided"}</a>
<b>👤 Name:</b> ${name || "No Name"}
<b>📧 Email:</b> ${email || "Not Provided"}
<b>💰 Budget:</b> ${budget || "Not Specified"}

<b>Assigned To:</b> ${assignedStaff.name}
`;

    await sendTelegramMessage(telegramText);

    res.status(201).json({
      message: "Lead created successfully",
      lead: newLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

// GET ALL LEADS
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

// UPDATE LEAD
const updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;

  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { name, email, phone, status },
      { new: true }, // return updated document
    );

    if (!updatedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json({
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

// DELETE LEAD
const deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete lead",
      error: error.message,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  deleteLead,
  updateLead,
};
