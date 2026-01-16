
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

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
  name: "stats",
  category: "General",

  async execute(message) {
    const users = loadUsers();

    const totalUsers = Object.keys(users).length;

    let totalWallet = 0;
    let totalBank = 0;

    for (const user of Object.values(users)) {
      totalWallet += user.wallet || 0;
      totalBank += user.bank || 0;
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Stats")
      .setColor("#A855F7")
      .addFields(
        {
          name: "🤖 Bot Info",
          value:
            `🕒 Uptime: **${formatUptime(message.client.uptime)}**\n` +
            `📡 Ping: **${Math.round(message.client.ws.ping)}ms**\n` +
            `🧠 Commands: **${message.client.commands.size}**`,
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
            `🧩 Servers: **${message.client.guilds.cache.size}**\n` +
            `👤 Cached Users: **${message.client.users.cache.size}**`,
          inline: false
        }
      )
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
