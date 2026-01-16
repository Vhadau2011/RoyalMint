const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// 🔒 Gambling channel lock
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

// 🎡 Config
const MIN_BET = 50;
const MAX_BET = 5000;

// Roulette layout
const RED_NUMBERS = [
  1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
];
const BLACK_NUMBERS = [
  2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
];

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function spinRoulette() {
  return Math.floor(Math.random() * 37); // 0–36
}

function getColor(num) {
  if (num === 0) return "green";
  if (RED_NUMBERS.includes(num)) return "red";
  return "black";
}

module.exports = {
  category: "Gambling",

  data: new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Spin the roulette wheel")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    )
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Bet type")
        .setRequired(true)
        .addChoices(
          { name: "Color (Red / Black / Green)", value: "color" },
          { name: "Number (0 - 36)", value: "number" }
        )
    )
    .addStringOption(option =>
      option
        .setName("value")
        .setDescription("Color (red/black/green) or number (0-36)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔒 Channel check
    if (interaction.channelId !== GAMBLING_CHANNEL_ID) {
      return interaction.reply({
        content: "🎡 Roulette can only be played in the gambling channel.",
        ephemeral: true
      });
    }

    const bet = interaction.options.getInteger("bet");
    const type = interaction.options.getString("type");
    const value = interaction.options.getString("value").toLowerCase();
    const userId = interaction.user.id;

    const users = loadUsers();
    if (!users[userId]) users[userId] = { coins: 0, bank: 0 };

    if (users[userId].coins < bet) {
      return interaction.reply({
        content: "💸 You don't have enough coins in your wallet.",
        ephemeral: true
      });
    }

    // Validate input
    if (type === "color" && !["red", "black", "green"].includes(value)) {
      return interaction.reply({
        content: "❌ Invalid color. Choose **red**, **black**, or **green**.",
        ephemeral: true
      });
    }

    if (type === "number") {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0 || n > 36) {
        return interaction.reply({
          content: "❌ Invalid number. Choose between **0 and 36**.",
          ephemeral: true
        });
      }
    }

    // Deduct bet
    users[userId].coins -= bet;

    // Spin
    const resultNumber = spinRoulette();
    const resultColor = getColor(resultNumber);

    let win = 0;
    let resultText = "❌ You lost.";

    if (type === "color") {
      if (value === resultColor) {
        const multiplier = value === "green" ? 14 : 2;
        win = bet * multiplier;
        users[userId].coins += win;
        resultText = `🎉 **WIN!** ${value.toUpperCase()} hit — **${win} coins** (x${multiplier})`;
      }
    } else {
      const pickedNumber = Number(value);
      if (pickedNumber === resultNumber) {
        win = bet * 35;
        users[userId].coins += win;
        resultText = `🎉 **JACKPOT!** Number **${resultNumber}** — **${win} coins** (x35)`;
      }
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Roulette")
      .setDescription(
        `🎡 **Result:** ${resultNumber} (${resultColor.toUpperCase()})\n\n` +
        `🪙 Bet: **${bet}**\n` +
        `🎯 Your Bet: **${type} = ${value}**\n\n` +
        resultText
      )
      .setColor(
        resultColor === "red" ? "#EF4444" :
        resultColor === "black" ? "#111827" :
        "#22C55E"
      )
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
