const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const DAILY_AMOUNT = 500; // keep in sync with config.json if you want

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  category: "Economy", // 🔥 used by menu/help

  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily RoyalMint reward"),

  async execute(interaction) {
    const users = loadUsers();
    const userId = interaction.user.id;
    const now = Date.now();

    if (!users[userId]) {
      users[userId] = {
        coins: 0,
        lastDaily: 0
      };
    }

    const lastClaim = users[userId].lastDaily || 0;
    const remaining = DAILY_COOLDOWN - (now - lastClaim);

    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      return interaction.reply({
        content: `⏳ You already claimed your daily.\nCome back in **${hours}h ${minutes}m**.`,
        ephemeral: true
      });
    }

    users[userId].coins += DAILY_AMOUNT;
    users[userId].lastDaily = now;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Daily Reward")
      .setDescription(
        `You claimed your daily reward!\n\n🪙 **+${DAILY_AMOUNT} Coins**`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
