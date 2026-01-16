const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
  category: "Economy",

  data: new SlashCommandBuilder()
    .setName("bank")
    .setDescription("Deposit or withdraw coins from your bank")

    .addSubcommand(sub =>
      sub
        .setName("deposit")
        .setDescription("Deposit coins into your bank")
        .addIntegerOption(opt =>
          opt
            .setName("amount")
            .setDescription("Amount to deposit")
            .setRequired(true)
            .setMinValue(1)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("withdraw")
        .setDescription("Withdraw coins from your bank")
        .addIntegerOption(opt =>
          opt
            .setName("amount")
            .setDescription("Amount to withdraw")
            .setRequired(true)
            .setMinValue(1)
        )
    ),

  async execute(interaction) {
    const users = loadUsers();
    const userId = interaction.user.id;
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger("amount");

    if (!users[userId]) {
      users[userId] = { coins: 0, bank: 0 };
    }

    if (sub === "deposit") {
      if (users[userId].coins < amount) {
        return interaction.reply({
          content: "❌ You don't have enough coins in your wallet.",
          ephemeral: true
        });
      }

      users[userId].coins -= amount;
      users[userId].bank += amount;
    }

    if (sub === "withdraw") {
      if (users[userId].bank < amount) {
        return interaction.reply({
          content: "❌ You don't have enough coins in your bank.",
          ephemeral: true
        });
      }

      users[userId].bank -= amount;
      users[userId].coins += amount;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Bank")
      .setDescription(
        `✅ **${sub === "deposit" ? "Deposited" : "Withdrew"} ${amount} Coins**\n\n🪙 Wallet: ${users[userId].coins}\n🏦 Bank: ${users[userId].bank}`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}; 
