const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

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
  name: "dice",
  aliases: [dce],
  category: "Gambling",

  async execute(message, args) {
    const bet = parseInt(args[0]);
    const pick = parseInt(args[1]);

    if (!bet || bet < MIN_BET || bet > MAX_BET) {
      return message.reply(
        `❌ Bet must be between ${MIN_BET} and ${MAX_BET}.`
      );
    }

    if (!pick || pick < 1 || pick > 6) {
      return message.reply("❌ Pick a number between **1 and 6**.");
    }

    const users = loadUsers();
    const userId = message.author.id;

    if (!users[userId]) {
      users[userId] = {
        wallet: 5000,
        bank: 0
      };
    }

    if (users[userId].wallet < bet) {
      return message.reply("💸 You don't have enough coins in your wallet.");
    }

    // deduct bet
    users[userId].wallet -= bet;

    const roll = rollDice();
    let winAmount = 0;
    let resultText;

    if (roll === pick) {
      winAmount = bet * 5;
      users[userId].wallet += winAmount;
      resultText = `🎉 **WIN!** You rolled **${roll}** and won **${winAmount} coins** (x5)`;
    } else {
      resultText = `❌ Rolled **${roll}** — better luck next time.`;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Dice")
      .setColor(winAmount > 0 ? "#22C55E" : "#EF4444")
      .setDescription(
        `🎯 **Your Pick:** ${pick}\n` +
        `🎲 **Dice Roll:** ${roll}\n\n` +
        `🪙 **Bet:** ${bet}\n${resultText}`
      )
      .setFooter({ text: "Category: Gambling" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
