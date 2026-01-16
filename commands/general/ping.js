const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  category: "General",

  async execute(message) {
    const sent = await message.reply("🏓 Pinging...");

    const botLatency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Ping")
      .setColor("#22C55E")
      .addFields(
        { name: "🤖 Bot Latency", value: `${botLatency}ms`, inline: true },
        { name: "🌐 API Latency", value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await sent.edit({ content: null, embeds: [embed] });
  }
};
