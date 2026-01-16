const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

module.exports = {
  category: "Economy",

  data: new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("View your RoyalMint wallet"),

  async execute(interaction) {
    const users = loadUsers();
    const userId = interaction.user.id;

    const wallet = users[userId]?.coins || 0;
    const bank = users[userId]?.bank || 0;

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Wallet")
      .setDescription(
        `🪙 **Wallet:** ${wallet}\n🏦 **Bank:** ${bank}`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" });

    await interaction.reply({ embeds: [embed] });
  }
}; 
