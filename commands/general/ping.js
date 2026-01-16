const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "support",
  category: "General",

  async execute(message) {
    const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID;

    // 🔒 LOCK USING .env (ECONOMY STYLE)
    if (SUPPORT_CHANNEL_ID && message.channel.id !== SUPPORT_CHANNEL_ID) {
      return message.reply(
        "❌ This command can only be used in the support channel."
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("🛠️ RoyalMint • Support")
      .setDescription(
        "Need help or want to report a bug?\n\n" +
        "🔗 https://discord.gg/Vejpj447"
      )
      .setColor("#22C55E")
      .setFooter({ text: "Category: General" });

    message.reply({ embeds: [embed] });
  }
};      )
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await interaction.editReply({
      content: null,
      embeds: [embed]
    });
  }
}; 
