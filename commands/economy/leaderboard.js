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
    .setName("lb")
    .setDescription("View the richest users in RoyalMint"),

  async execute(interaction) {
    const users = loadUsers();

    if (Object.keys(users).length === 0) {
      return interaction.reply({
        content: "📉 No users found in the economy yet.",
        ephemeral: true
      });
    }

    // Sort users by total wealth
    const sorted = Object.entries(users)
      .map(([id, data]) => ({
        id,
        total: (data.coins || 0) + (data.bank || 0),
        wallet: data.coins || 0,
        bank: data.bank || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    let description = "";

    for (let i = 0; i < sorted.length; i++) {
      const user = sorted[i];
      let member;

      try {
        member = await interaction.guild.members.fetch(user.id);
      } catch {
        member = null;
      }

      description +=
        `**${i + 1}.** ${member ? member.user.tag : "Unknown User"}\n` +
        `💰 Wallet: **${user.wallet}** | 🏦 Bank: **${user.bank}**\n` +
        `👑 Total: **${user.total}**\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Leaderboard")
      .setDescription(description)
      .setColor("#FACC15")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
