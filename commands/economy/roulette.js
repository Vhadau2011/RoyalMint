
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const commandLock = require("../../utils/commandLock");

const usersPath = path.join(__dirname, "../../data/users.json");
const GAMBLING_CHANNEL_ID = process.env.GAMBLING_CHANNEL_ID;

const MIN_BET = 50;
const MAX_BET = 5000;

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
    .setDescription("Play the slot machine")
    .addIntegerOption(option =>
      option.setName("bet")
        .setDescription("Bet amount")
        .setRequired(true)
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
    ),

  async execute(interaction) {
    // 🔒 LOCK CHECK
    if (!commandLock(interaction, GAMBLING_CHANNEL_ID)) {
      return interaction.reply({
        content: "🔒 This command is locked to the gambling channel.",
        ephemeral: true
      });
    }

    const bet = interaction.options.getInteger("bet");
    const userId = interaction.user.id;
    const users = loadUsers();

    if (!users[userId]) users[userId] = { wallet: 5000, bank: 0 };
    if (users[userId].wallet < bet) {
      return interaction.reply({ content: "💸 Not enough coins.", ephemeral: true });
    }

    users[userId].wallet -= bet;

    const a = spin(), b = spin(), c = spin();
    let win = 0;
    let text = "❌ You lost.";

    if (a === b && b === c) {
      win = bet * MULTIPLIERS[a];
      users[userId].wallet += win;
      text = `🎉 JACKPOT! Won **${win}** coins`;
    } else if (a === b || b === c || a === c) {
      win = Math.floor(bet * 1.5);
      users[userId].wallet += win;
      text = `✨ Won **${win}** coins`;
    }

    saveUsers(users);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("👑 RoyalMint • Slots")
          .setDescription(`🎰 ${a} | ${b} | ${c}\n\n${text}`)
          .setColor(win ? "#22C55E" : "#EF4444")
      ]
    });
  }
};
