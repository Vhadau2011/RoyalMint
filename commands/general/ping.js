const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 CHANNEL LOCK (ENV)
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID;

module.exports = {
  category: "General",

  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check RoyalMint bot latency"),

  async execute(interaction) {
    // 🔒 Channel check
    if (interaction.channelId !== GENERAL_CHANNEL_ID) {
      return interaction.reply({
        content: "❌ This command can only be used in the official channel.",
        ephemeral: true
      });
    }

    const sent = await interaction.reply({
      content: "🏓 Pinging...",
      fetchReply: true
    });

    const botLatency =
      sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Ping")
      .setColor("#22C55E")
      .addFields(
        { name: "🤖 Bot Latency", value: `${botLatency}ms`, inline: true },
        { name: "🌐 API Latency", value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await interaction.editReply({
      content: null,
      embeds: [embed]
    });
  }
}; 
