const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  category: "General",

  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get help and join the RoyalMint support server"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🛠️ RoyalMint • Support")
      .setDescription(
        "Need help, updates, or want to report a bug?\n\n" +
        "👉 **Join the official Re:Zero Support Server:**\n" +
        "🔗 https://discord.gg/Vejpj447"
      )
      .setColor("#22C55E")
      .setFooter({ text: "Category: General" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}; 
