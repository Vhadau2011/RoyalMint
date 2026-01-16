const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

function getUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  name: "balance",
  aliases: ["bal"],
  category: "Economy", // 🔥 menu uses this

  async execute(message, args) {
    const users = getUsers();

    const target =
      message.mentions.users.first() || message.author;

    // create user if not exists
    if (!users[target.id]) {
      users[target.id] = {
        wallet: 5000,
        bank: 0
      };
      saveUsers(users);
    }

    const { wallet, bank } = users[target.id];

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Balance")
      .setColor("#000000") // dark black
      .setThumbnail(target.displayAvatarURL())
      .setDescription(
        `🪙 **Wallet:** ${wallet}\n` +
        `🏦 **Bank:** ${bank}`
      )
      .setFooter({
        text: "Category: Economy"
      });

    message.reply({ embeds: [embed] });
  }
};
