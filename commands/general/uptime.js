const { EmbedBuilder } = require("discord.js");

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return [
    d ? `${d}d` : null,
    h ? `${h}h` : null,
    m ? `${m}m` : null,
    `${sec}s`
  ].filter(Boolean).join(" ");
}

module.exports = {
  name: "uptime",
  category: "General",

  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Uptime")
      .setDescription(
        `⏱️ **Online for:** ${formatUptime(message.client.uptime)}`
      )
      .setColor("#38BDF8")
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
