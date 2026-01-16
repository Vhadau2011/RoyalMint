const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// ===== ENV CHANNEL LOCK =====
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

// ===== CONFIG =====
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
    .setName("coinflip")
    .setDescription("Flip a coin and gamble your RoyalMint coins")
    .addStringOption(option =>
      option
        .setName("side")
        .setDescription("Choose heads or tails")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "heads" },
          { name: "Tails", value: "tails" }
        )
    )
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    ),

  async execute(interaction) {
    // 🔒 CHANNEL CHECK
    if (interaction.channelId !== GAMBLING_CHANNEL_ID) {
      return interaction.reply({
        content: "🎰 Gambling commands are only allowed in the designated gambling channel.",
        ephemeral: true
      });
    }

    const choice = interaction.options.getString("side");
    const bet = interaction.options.getInteger("bet");
    const userId = interaction.user.id;

    const users = loadUsers();

    if (!users[userId]) {
      users[userId] = { coins: 0, bank: 0 };
    }

    if (users[userId].coins < bet) {
      return interaction.reply({
        content: "💸 You don't have enough coins in your wallet.",
        ephemeral: true
      });
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const win = result === choice;

    if (win) {
      users[userId].coins += bet;
    } else {
      users[userId].coins -= bet;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Coin Flip")
      .setDescription(
        `🪙 **Bet:** ${bet}\n🎲 **Result:** ${result.toUpperCase()}\n\n` +
        (win
          ? `✅ You **won** ${bet} coins!`
          : `❌ You **lost** ${bet} coins.`)
      )
      .setColor(win ? "#22C55E" : "#EF4444")
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
