const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

function getUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

module.exports = {
  category: "Economy", // 🔥 THIS IS WHAT MENUS USE

  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your RoyalMint balance"),

  async execute(interaction) {
    const users = getUsers();
    const userId = interaction.user.id;

    const balance = users[userId]?.coins || 0;

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Balance")
      .setDescription(`You currently have:\n\n🪙 **${balance} Coins**`)
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" });

    await interaction.reply({ embeds: [embed] });
  }
};
