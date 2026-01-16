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
    .setName("pay")
    .setDescription("Send RoyalMint coins to another user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to pay")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of coins to send")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (receiver.bot) {
      return interaction.reply({
        content: "🤖 You cannot send coins to bots.",
        ephemeral: true
      });
    }

    if (receiver.id === senderId) {
      return interaction.reply({
        content: "❌ You cannot pay yourself.",
        ephemeral: true
      });
    }

    const users = loadUsers();

    if (!users[senderId]) {
      users[senderId] = { coins: 0 };
    }

    if (!users[receiver.id]) {
      users[receiver.id] = { coins: 0 };
    }

    if (users[senderId].coins < amount) {
      return interaction.reply({
        content: "💸 You don't have enough coins.",
        ephemeral: true
      });
    }

    users[senderId].coins -= amount;
    users[receiver.id].coins += amount;
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Payment Sent")
      .setDescription(
        `🪙 **${amount} Coins** sent to **${receiver.tag}**`
      )
      .setColor("#8B5CF6")
      .setFooter({ text: "Category: Economy" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
