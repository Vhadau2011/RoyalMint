
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
  name: "pay",
  aliases: ["send", "give"],
  category: "Economy",

  async execute(message, args) {
    const senderId = message.author.id;
    const receiver = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!receiver) {
      return message.reply("❌ Mention a user to pay.\nUsage: `.pay @user <amount>`");
    }

    if (receiver.bot) {
      return message.reply("🤖 You cannot send coins to bots.");
    }

    if (receiver.id === senderId) {
      return message.reply("❌ You cannot pay yourself.");
    }

    if (!amount || amount < 1) {
      return message.reply("❌ Enter a valid amount.");
    }

    const users = loadUsers();

    if (!users[senderId]) {
      users[senderId] = {
        wallet: 5000,
        bank: 0
      };
    }

    if (!users[receiver.id]) {
      users[receiver.id] = {
        wallet: 5000,
        bank: 0
      };
    }

    if (users[senderId].wallet < amount) {
      return message.reply("💸 You don't have enough coins in your wallet.");
    }

    users[senderId].wallet -= amount;
    users[receiver.id].wallet += amount;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Payment Sent")
      .setColor("#000000") // dark black
      .setDescription(
        `🪙 **${amount} Coins** sent to **${receiver.tag}**`
      )
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
