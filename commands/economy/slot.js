const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// 🔒 Gambling channel lock (ENV)
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
  category: "Gambling",

  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play the slot machine and try your luck")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    ),

  async execute(interaction) {
    // 🔒 Channel lock
    if (interaction.channelId !== GAMBLING_CHANNEL_ID) {
      return interaction.reply({
        content: "🎰 Slots can only be played in offical server channel.",
        ephemeral: true
      });
    }

    const bet = interaction.options.getInteger("bet");
    const userId = interaction.user.id;

    const users = loadUsers();
    if (!users[userId]) {
      users[userId] = { wallet: 5000, bank: 0 };
    }

    if (users[userId].wallet < bet) {
      return interaction.reply({
        content: "💸 You don't have enough coins in your wallet.",
        ephemeral: true
      });
    }

    // Deduct bet
    users[userId].wallet -= bet;

    // Spin slots
    const a = spin();
    const b = spin();
    const c = spin();

    let win = 0;
    let resultText = "❌ You lost.";

    // Win conditions
    if (a === b && b === c) {
      const multiplier = MULTIPLIERS[a] || 2;
      win = bet * multiplier;
      users[userId].wallet += win;
      resultText = `🎉 **JACKPOT!** You won **${win} coins** (x${multiplier})`;
    } else if (a === b || b === c || a === c) {
      win = Math.floor(bet * 1.5);
      users[userId].wallet += win;
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

    await interaction.reply({ embeds: [embed] });
  }
};
