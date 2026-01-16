
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// 🔒 Gambling channel (ENV)
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

// 🎰 Config
const MIN_BET = 50;
const MAX_BET = 5000;

// Slot symbols & multipliers
const SYMBOLS = ["🍒", "🍋", "🍇", "🍉", "⭐", "💎"];
const MULTIPLIERS = {
  "🍒": 2,
  "🍋": 2,
  "🍇": 3,
  "🍉": 3,
  "⭐": 5,
  "💎": 10
};

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function spin() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

module.exports = {
  name: "slots",
  category: "Gambling",

  async execute(message, args) {
    // 🔒 Channel lock
    if (message.channel.id !== GAMBLING_CHANNEL_ID) {
      return message.reply(
        "🎰 Slots can only be played in the official gambling channel."
      );
    }

    const bet = parseInt(args[0]);
    if (!bet || bet < MIN_BET || bet > MAX_BET) {
      return message.reply(
        `❌ Enter a valid bet between **${MIN_BET}** and **${MAX_BET}**.\nExample: \`${process.env.PREFIX}slots 500\``
      );
    }

    const users = loadUsers();
    const userId = message.author.id;

    if (!users[userId]) {
      users[userId] = { coins: 0, bank: 0 };
    }

    if (users[userId].coins < bet) {
      return message.reply("💸 You don't have enough coins in your wallet.");
    }

    // Deduct bet
    users[userId].coins -= bet;

    // Spin
    const a = spin();
    const b = spin();
    const c = spin();

    let win = 0;
    let resultText = "❌ You lost.";

    if (a === b && b === c) {
      const multiplier = MULTIPLIERS[a] || 2;
      win = bet * multiplier;
      users[userId].coins += win;
      resultText = `🎉 **JACKPOT!** You won **${win} coins** (x${multiplier})`;
    } else if (a === b || b === c || a === c) {
      win = Math.floor(bet * 1.5);
      users[userId].coins += win;
      resultText = `✨ **Nice!** You won **${win} coins**`;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Slots")
      .setDescription(
        `🎰 **[ ${a} | ${b} | ${c} ]**\n\n` +
        `🪙 Bet: **${bet}**\n` +
        resultText
      )
      .setColor(win > 0 ? "#22C55E" : "#EF4444")
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
