const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    days ? `${days}d` : null,
    hours ? `${hours}h` : null,
    minutes ? `${minutes}m` : null,
    `${secs}s`
  ].filter(Boolean).join(" ");
}

module.exports = {
  category: "General",

  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Check how long RoyalMint has been online"),

  async execute(interaction) {
    const uptimeSeconds = Math.floor(interaction.client.uptime / 1000);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Uptime")
      .setDescription(`⏱️ **Online for:** ${formatUptime(uptimeSeconds)}`)
      .setColor("#38BDF8")
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
