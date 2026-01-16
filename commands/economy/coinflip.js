const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

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
  name: "coinflip",
  aliases: ["cf"],
  category: "Gambling",

  async execute(message, args) {
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!choice || !["heads", "tails"].includes(choice)) {
      return message.reply("❌ Usage: `.coinflip <heads|tails> <amount>`");
    }

    if (!bet || bet < MIN_BET || bet > MAX_BET) {
      return message.reply(
        `❌ Bet amount must be between ${MIN_BET} and ${MAX_BET}.`
      );
    }

    const userId = message.author.id;
    const users = loadUsers();

    if (!users[userId]) {
      users[userId] = {
        wallet: 5000,
        bank: 0
      };
    }

    if (users[userId].wallet < bet) {
      return message.reply("💸 You don't have enough coins in your wallet.");
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const win = result === choice;

    if (win) {
      users[userId].wallet += bet;
    } else {
      users[userId].wallet -= bet;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Coin Flip")
      .setColor(win ? "#22C55E" : "#EF4444")
      .setDescription(
        `🪙 **Bet:** ${bet}\n` +
        `🎲 **Result:** ${result.toUpperCase()}\n\n` +
        (win
          ? `✅ You **won** ${bet} coins!`
          : `❌ You **lost** ${bet} coins.`)
      )
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
