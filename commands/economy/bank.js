 
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
  name: "bank",
  aliases: ["atm"],
  category: "Economy",

  async execute(message, args) {
    const users = loadUsers();
    const userId = message.author.id;

    if (!users[userId]) {
      users[userId] = {
        wallet: 5000,
        bank: 0
      };
    }

    const action = args[0];
    const amount = parseInt(args[1]);

    if (!action || !["deposit", "withdraw"].includes(action)) {
      return message.reply(
        "❌ Usage: `.bank deposit <amount>` or `.bank withdraw <amount>`"
      );
    }

    if (!amount || amount < 1) {
      return message.reply("❌ Please provide a valid amount.");
    }

    if (action === "deposit") {
      if (users[userId].wallet < amount) {
        return message.reply("❌ You don't have enough coins in your wallet.");
      }

      users[userId].wallet -= amount;
      users[userId].bank += amount;
    }

    if (action === "withdraw") {
      if (users[userId].bank < amount) {
        return message.reply("❌ You don't have enough coins in your bank.");
      }

      users[userId].bank -= amount;
      users[userId].wallet += amount;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Bank")
      .setColor("#000000") // dark black
      .setDescription(
        `✅ **${action === "deposit" ? "Deposited" : "Withdrew"} ${amount} Coins**\n\n` +
        `🪙 **Wallet:** ${users[userId].wallet}\n` +
        `🏦 **Bank:** ${users[userId].bank}`
      )
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
