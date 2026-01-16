
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  name: "wallet",
  category: "Economy",

  async execute(message) {
    const users = loadUsers();
    const userId = message.author.id;

    // Ensure user exists
    if (!users[userId]) {
      users[userId] = { coins: 0, bank: 0 };
      saveUsers(users);
    }

    const wallet = users[userId].coins ?? 0;
    const bank = users[userId].bank ?? 0;

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Wallet")
      .setDescription(
        `🪙 **Wallet:** ${wallet}\n🏦 **Bank:** ${bank}`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
