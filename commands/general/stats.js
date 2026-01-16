const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// 🔒 ENV CHANNEL LOCK
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID;

const usersPath = path.join(__dirname, "../../data/users.json");

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

module.exports = {
  category: "General",

  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View RoyalMint bot and economy statistics"),

  async execute(interaction) {
    // 🔒 Channel restriction
    if (interaction.channelId !== GENERAL_CHANNEL_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the official channel.",
        ephemeral: true
      });
    }

    const users = loadUsers();
    const totalUsers = Object.keys(users).length;

    let totalWallet = 0;
    let totalBank = 0;

    for (const user of Object.values(users)) {
      totalWallet += user.coins || 0;
      totalBank += user.bank || 0;
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Stats")
      .setColor("#A855F7")
      .addFields(
        {
          name: "🤖 Bot Info",
          value:
            `🕒 Uptime: **${formatUptime(interaction.client.uptime)}**\n` +
            `📡 Ping: **${Math.round(interaction.client.ws.ping)}ms**\n` +
            `🧠 Commands: **${interaction.client.commands.size}**`,
          inline: false
        },
        {
          name: "💰 Economy Stats",
          value:
            `👥 Users: **${totalUsers}**\n` +
            `🪙 Wallet Coins: **${totalWallet}**\n` +
            `🏦 Bank Coins: **${totalBank}**\n` +
            `👑 Total Coins: **${totalWallet + totalBank}**`,
          inline: false
        },
        {
          name: "🌐 Server Info",
          value:
            `🧩 Servers: **${interaction.client.guilds.cache.size}**\n` +
            `👤 Cached Users: **${interaction.client.users.cache.size}**`,
          inline: false
        }
      )
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
