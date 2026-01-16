const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

module.exports = {
  name: "lb",
  aliases: ["leaderboard", "top"],
  category: "Economy",

  async execute(message) {
    const users = loadUsers();

    if (Object.keys(users).length === 0) {
      return message.reply("📉 No users found in the economy yet.");
    }

    // sort by total wealth (wallet + bank)
    const sorted = Object.entries(users)
      .map(([id, data]) => ({
        id,
        wallet: data.wallet || 0,
        bank: data.bank || 0,
        total: (data.wallet || 0) + (data.bank || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    let description = "";

    for (let i = 0; i < sorted.length; i++) {
      const user = sorted[i];
      let member;

      try {
        member = await message.guild.members.fetch(user.id);
      } catch {
        member = null;
      }

      description +=
        `**${i + 1}.** ${member ? member.user.tag : "Unknown User"}\n` +
        `🪙 **Wallet:** ${user.wallet} | 🏦 **Bank:** ${user.bank}\n` +
        `👑 **Total:** ${user.total}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Leaderboard")
      .setColor("#000000") // dark black
      .setDescription(description)
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
