const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// ===== CONFIG =====
const WORK_COOLDOWN = 30 * 60 * 1000; // 30 minutes
const WORK_MIN = 1000;
const WORK_MAX = 5500;

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  category: "Economy",

  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn some RoyalMint coins"),

  async execute(interaction) {
    const users = loadUsers();
    const userId = interaction.user.id;
    const now = Date.now();

    // Ensure user exists
    if (!users[userId]) {
      users[userId] = {
        coins: 0,
        bank: 0,
        lastWork: 0
      };
    }

    const lastWork = users[userId].lastWork || 0;
    const remaining = WORK_COOLDOWN - (now - lastWork);

    if (remaining > 0) {
      const minutes = Math.ceil(remaining / (1000 * 60));
      return interaction.reply({
        content: `🛠️ You are tired!\nTry again in **${minutes} minute(s)**.`,
        ephemeral: true
      });
    }

    const earned = randomAmount(WORK_MIN, WORK_MAX);
    users[userId].coins += earned;
    users[userId].lastWork = now;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Work")
      .setDescription(
        `You worked hard and earned:\n\n🪙 **+${earned} Coins**`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
