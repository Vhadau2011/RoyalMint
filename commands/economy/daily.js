const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const DAILY_AMOUNT = 500;

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  name: "daily",
  aliases: [],
  category: "Economy",

  async execute(message) {
    const users = loadUsers();
    const userId = message.author.id;
    const now = Date.now();

    if (!users[userId]) {
      users[userId] = {
        wallet: 5000,
        bank: 0,
        lastDaily: 0
      };
    }

    const lastClaim = users[userId].lastDaily || 0;
    const remaining = DAILY_COOLDOWN - (now - lastClaim);

    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      return message.reply(
        `⏳ You already claimed your daily.\nCome back in **${hours}h ${minutes}m**.`
      );
    }

    users[userId].wallet += DAILY_AMOUNT;
    users[userId].lastDaily = now;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Daily Reward")
      .setColor("#000000") // dark black
      .setDescription(
        `🎁 You claimed your daily reward!\n\n🪙 **+${DAILY_AMOUNT} Coins**`
      )
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
