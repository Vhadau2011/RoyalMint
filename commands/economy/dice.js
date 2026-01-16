const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// 🔒 Gambling channel lock
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

// 🎲 Config
const MIN_BET = 50;
const MAX_BET = 5000;

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

module.exports = {
  category: "Gambling",

  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll the dice and test your luck")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    )
    .addIntegerOption(option =>
      option
        .setName("number")
        .setDescription("Pick a number between 1 and 6")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(6)
    ),

  async execute(interaction) {
    // 🔒 Channel check
    if (interaction.channelId !== GAMBLING_CHANNEL_ID) {
      return interaction.reply({
        content: "🎲 Dice can only be played in the gambling channel.",
        ephemeral: true
      });
    }

    const bet = interaction.options.getInteger("bet");
    const pick = interaction.options.getInteger("number");
    const userId = interaction.user.id;

    const users = loadUsers();
    if (!users[userId]) users[userId] = { coins: 0, bank: 0 };

    if (users[userId].coins < bet) {
      return interaction.reply({
        content: "💸 You don't have enough coins in your wallet.",
        ephemeral: true
      });
    }

    // Deduct bet
    users[userId].coins -= bet;

    const roll = rollDice();
    let win = 0;
    let resultText = "❌ You lost.";

    if (roll === pick) {
      win = bet * 5;
      users[userId].coins += win;
      resultText = `🎉 **WIN!** You rolled **${roll}** and won **${win} coins** (x5)`;
    } else {
      resultText = `🎲 Rolled **${roll}** — better luck next time.`;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Dice")
      .setDescription(
        `🎯 Your Pick: **${pick}**\n` +
        `🎲 Dice Roll: **${roll}**\n\n` +
        `🪙 Bet: **${bet}**\n${resultText}`
      )
      .setColor(win > 0 ? "#22C55E" : "#EF4444")
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
