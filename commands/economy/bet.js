const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// 🔒 CHANNEL LOCK
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

// 🎲 CONFIG
const MIN_BET = 50;
const MAX_BET = 5000;

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  category: "Gambling",

  data: new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Place a simple bet and test your luck")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    ),

  async execute(interaction) {
    // 🔒 CHANNEL CHECK
    if (interaction.channelId !== GAMBLING_CHANNEL_ID) {
      return interaction.reply({
        content: "🎰 This command can only be used in the gambling channel.",
        ephemeral: true
      });
    }

    const bet = interaction.options.getInteger("amount");
    const userId = interaction.user.id;

    const users = loadUsers();
    if (!users[userId]) users[userId] = { coins: 0, bank: 0 };

    if (users[userId].coins < bet) {
      return interaction.reply({
        content: "💸 You don't have enough coins.",
        ephemeral: true
      });
    }

    // Deduct bet
    users[userId].coins -= bet;

    const win = Math.random() < 0.5;
    let resultText;
    let color;

    if (win) {
      const winnings = bet * 2;
      users[userId].coins += winnings;
      resultText = `🎉 **YOU WON!**\n🪙 Gained **${winnings} coins**`;
      color = "#22C55E";
    } else {
      resultText = `❌ **YOU LOST**\n🪙 Lost **${bet} coins**`;
      color = "#EF4444";
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Bet")
      .setDescription(
        `🪙 Bet: **${bet}**\n\n${resultText}`
      )
      .setColor(color)
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}; 
