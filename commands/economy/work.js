const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// ===== CONFIG =====
const WORK_COOLDOWN = 30 * 60 * 1000; // 30 minutes
const WORK_MIN = 100;
const WORK_MAX = 400;

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "work",
  category: "Economy",

  async execute(message) {
    const users = loadUsers();
    const userId = message.author.id;
    const now = Date.now();

    if (!users[userId]) {
      users[userId] = {
        coins: 0,
        bank: 0,
        lastWork: 0
      };
    }

    const remaining = WORK_COOLDOWN - (now - users[userId].lastWork);

    if (remaining > 0) {
      const minutes = Math.ceil(remaining / (1000 * 60));
      return message.reply(
        `🛠️ You are tired!\nTry working again in **${minutes} minute(s)**.`
      );
    }

    const earned = random(WORK_MIN, WORK_MAX);
    users[userId].coins += earned;
    users[userId].lastWork = now;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Work")
      .setDescription(`You worked and earned:\n\n🪙 **+${earned} Coins**`)
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
